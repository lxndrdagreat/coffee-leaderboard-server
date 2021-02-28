import { getCollection } from './mongodb.service';
import { UserSchema } from '../schemas/user-profile.schema';
import { ObjectId } from 'bson';
import type { Collection } from 'mongodb';

export class UserNotFoundError extends Error {
  constructor() {
    super('User not found.');
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

export async function createUser(username: string): Promise<UserSchema> {
  const users = await getUserCollection();

  const result = await users.insertOne({
    userName: username,
    tokens: []
  });

  if (result.result.ok !== 1) {
    throw new Error(`Failed to create user with username "${username}".`);
  }

  return getUserById(result.insertedId);
}
