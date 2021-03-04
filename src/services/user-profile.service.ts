import { getCollection } from './mongodb.service';
import { UserSchema } from '../schemas/user-profile.schema';
import { ObjectId } from 'bson';
import type { Collection } from 'mongodb';
import {
  AppAuthRequestModel,
  UserAppServiceName,
  UserAppTokenSchema
} from '../schemas/user-app-token.schema';
import { generatePasswordHash } from './generate-token';
import { getUserInfoFromSlackAPI } from './slack.service';

export class UserNotFoundError extends Error {
  constructor() {
    super('User not found.');
  }
}

export class FailedToAddAppForUser extends Error {
  constructor(userName: string) {
    super(`Failed to add app authentication for user "${userName}".`);
  }
}

export async function getUserCollection(): Promise<Collection<UserSchema>> {
  return getCollection<UserSchema>('users');
}

export async function getUserById(id: string | ObjectId): Promise<UserSchema> {
  if (!ObjectId.isValid(id)) {
    throw new UserNotFoundError();
  }

  const users = await getUserCollection();

  const user = await users.findOne({
    _id: typeof id === 'string' ? new ObjectId(id) : id
  });

  if (!user) {
    throw new UserNotFoundError();
  }

  return user;
}

export async function getUserByUsername(username: string): Promise<UserSchema> {
  const users = await getUserCollection();

  const user = await users.findOne({
    userName: new RegExp(`^${username}$`, 'i')
  });

  if (!user) {
    throw new UserNotFoundError();
  }

  return user;
}

export async function getOrCreateUser(username: string): Promise<UserSchema> {
  try {
    return await getUserByUsername(username);
  } catch (e) {
    if (!(e instanceof UserNotFoundError)) {
      throw e;
    }
  }
  try {
    return await createUser(username);
  } catch (e) {
    throw e;
  }
}

export async function getUserBySlackId(slackId: string): Promise<UserSchema> {
  const users = await getUserCollection();
  const user = await users.findOne({
    slackId: slackId
  });

  if (!user) {
    throw new UserNotFoundError();
  }
  return user;
}

export async function getOrCreateUserForSlackId(
  slackUserId: string
): Promise<UserSchema> {
  try {
    return await getUserBySlackId(slackUserId);
  } catch (e) {
    if (!(e instanceof UserNotFoundError)) {
      throw e;
    }
  }
  // fetch the user from the Slack API
  const userInfo = await getUserInfoFromSlackAPI(slackUserId);
  const user = await getOrCreateUser(userInfo.name);
  user.slackId = slackUserId;
  await updateUser(user);
  return user;
}

export async function createUser(
  username: string,
  slackId: string | null = null
): Promise<UserSchema> {
  const users = await getUserCollection();

  const result = await users.insertOne({
    userName: username,
    slackId: slackId,
    tokens: []
  });

  if (result.result.ok !== 1) {
    throw new Error(`Failed to create user with username "${username}".`);
  }

  return getUserById(result.insertedId);
}

export async function updateUser(user: UserSchema): Promise<boolean> {
  const users = await getUserCollection();
  const result = await users.replaceOne(
    {
      _id: user._id
    },
    user
  );

  return result.result.ok === 1;
}

async function generateUserServiceToken(
  serviceName: string,
  userName: string
): Promise<string> {
  return generatePasswordHash(`${serviceName}${userName}`, userName);
}

async function generateUserAppToken(
  appName: string,
  serviceName: string,
  userName: string
): Promise<string> {
  return generatePasswordHash(`${appName}${serviceName}${userName}`, userName);
}

export async function createServiceAuth(
  userId: string | ObjectId,
  serviceName: UserAppServiceName
): Promise<[Readonly<UserSchema>, Readonly<UserAppTokenSchema>]> {
  const user = await getUserById(userId);
  const serviceToken = await generateUserServiceToken(
    serviceName.toLowerCase(),
    user.userName
  );
  const appToken: UserAppTokenSchema = {
    service: serviceName,
    serviceToken: serviceToken,
    createdOn: new Date(),
    app: null,
    appToken: null
  };
  user.tokens.push(appToken);
  const success = await updateUser(user);
  if (!success) {
    throw new FailedToAddAppForUser(user.userName);
  }
  return [user, appToken];
}

export async function confirmServiceAuth(
  authRequestInfo: AppAuthRequestModel
): Promise<[Readonly<UserSchema>, Readonly<UserAppTokenSchema>]> {
  const users = await getUserCollection();
  const user = await users.findOne({
    $and: [
      {
        'tokens.serviceToken': authRequestInfo.serviceToken
      },
      {
        'tokens.service': authRequestInfo.serviceName
      },
      // Do not allow re-authing with the same serviceToken
      {
        'tokens.app': null
      },
      {
        'tokens.appToken': null
      }
    ]
  });

  if (!user) {
    throw new UserNotFoundError();
  }

  const appInfo = user.tokens.find(
    (app) =>
      app.serviceToken === authRequestInfo.serviceToken &&
      app.service === authRequestInfo.serviceName
  );
  if (!appInfo) {
    throw new FailedToAddAppForUser(user.userName);
  }
  appInfo.appToken = await generateUserAppToken(
    authRequestInfo.app,
    authRequestInfo.serviceName,
    user.userName
  );
  appInfo.app = authRequestInfo.app;
  const success = await updateUser(user);
  if (!success) {
    throw new FailedToAddAppForUser(user.userName);
  }
  return [user, appInfo];
}

export type ValidatedUserAppTokenInfo = [
  user: UserSchema,
  appInfo: UserAppTokenSchema
];

export async function validateUserAppToken(
  appToken: string,
  appName: string
): Promise<ValidatedUserAppTokenInfo> {
  const users = await getUserCollection();
  const found = await users
    .aggregate<{ user: UserSchema; appInfo: UserAppTokenSchema }>([
      {
        $project: {
          _id: 1,
          userName: 1,
          tokens: 1,
          tokensCopy: '$tokens'
        }
      },
      {
        $unwind: '$tokensCopy'
      },
      {
        $match: {
          $and: [
            {
              'tokensCopy.appToken': appToken
            },
            {
              'tokensCopy.app': appName
            }
          ]
        }
      },
      {
        $project: {
          _id: false,
          user: {
            userName: '$userName',
            _id: '$_id',
            tokens: '$tokens'
          },
          appInfo: '$tokensCopy'
        }
      }
    ])
    .toArray();
  if (found.length === 0) {
    throw new UserNotFoundError();
  }
  return [found[0].user, found[0].appInfo];
}
