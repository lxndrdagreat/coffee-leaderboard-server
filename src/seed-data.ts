import { readFile, access } from 'fs/promises';
import { ObjectId } from 'bson';
import {
  createUser,
  getUserByUsername,
  getUserCollection,
  UserNotFoundError
} from './services/user-profile.service';
import { createEntry } from './services/entry.service';

type OldIdToNewId = [oldId: number, newId: ObjectId];

async function seedUsers(): Promise<OldIdToNewId[]> {
  try {
    await access('users.json');
  } catch (e) {
    console.error('Cannot seed user data: "users.json" file does not exist.');
    return [];
  }

  const fileData = JSON.parse((await readFile('users.json')).toString());

  const mapping: OldIdToNewId[] = [];

  for (const userData of fileData) {
    try {
      const existing = await getUserByUsername(userData['username']);
      mapping.push([userData['id'], existing._id]);
      continue;
    } catch (e) {
      if (!(e instanceof UserNotFoundError)) {
        throw e;
      }
    }

    // create new
    console.log('Adding user:', userData['username']);
    const user = await createUser(userData['username']);
    mapping.push([userData['id'], user._id]);
  }

  return mapping;
}

async function seedEntries(userMap: OldIdToNewId[]): Promise<void> {
  /*
  {"user_id":2,"text":":coffee: ","channel_id":"C096GNV6K","channel_name":"coffeeholics","date":1484569858037,"id":1}
   */
  try {
    await access('entries.json');
  } catch (e) {
    console.error(
      'Cannot seed entry data: "entries.json" file does not exist.'
    );
    return;
  }

  const entries = JSON.parse((await readFile('entries.json')).toString()) as {
    user_id: number;
    text: string;
    channel_id: string;
    channel_name: string;
    date: number;
    id: number;
  }[];
  for (const entry of entries) {
    const user = userMap.find((u) => u[0] === entry.user_id);
    if (!user) {
      console.log('Could not find user: ', entry.user_id);
      continue;
    }

    await createEntry(
      user[1],
      {
        type: 'slack',
        text: entry.text,
        channel: {
          id: entry.channel_id,
          name: entry.channel_name
        }
      },
      new Date(entry.date)
    );
  }
}

async function setupDb(): Promise<void> {
  const users = await getUserCollection();
  await users.createIndex(
    {
      userName: 1
    },
    {
      unique: true
    }
  );
}

(async () => {
  await setupDb();

  const idMap = await seedUsers();
  if (!idMap.length) {
    return;
  }

  await seedEntries(idMap);

  process.exit(0);
})();
