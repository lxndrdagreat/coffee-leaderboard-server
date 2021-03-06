import { getCollection } from './mongodb.service';
import { CoffeeEntrySchema, EntrySource } from '../schemas/coffee-entry.schema';
import type { Collection } from 'mongodb';
import { ObjectId } from 'bson';
import { getUserById, UserNotFoundError } from './user-profile.service';

export class EntryNotFound extends Error {
  constructor() {
    super('Entry not found.');
  }
}

export async function getEntryCollection(): Promise<
  Collection<CoffeeEntrySchema>
> {
  return getCollection<CoffeeEntrySchema>('entries');
}

export async function getEntriesForUserId(
  userId: string | ObjectId
): Promise<CoffeeEntrySchema[]> {
  if (!ObjectId.isValid(userId)) {
    throw new UserNotFoundError();
  }

  const entries = await getEntryCollection();

  const found = await entries.find({
    user: typeof userId === 'string' ? new ObjectId(userId) : userId
  });

  return found.toArray();
}

export async function getEntryById(
  id: string | ObjectId
): Promise<CoffeeEntrySchema> {
  if (!ObjectId.isValid(id)) {
    throw new EntryNotFound();
  }
  const entries = await getEntryCollection();
  const entry = await entries.findOne({
    _id: typeof id === 'string' ? new ObjectId(id) : id
  });
  if (!entry) {
    throw new EntryNotFound();
  }
  return entry;
}

const yesterdayRegex = /[\w\d\s]*(-y\s*\d+|-y\s+|-y$|--yesterday\s*\d+|--yesterday\s+|--yesterday$)[\w\s]*$/i;

export async function createEntry(
  userId: ObjectId,
  source: EntrySource,
  date?: Date
): Promise<CoffeeEntrySchema> {
  // throw error if user isn't real
  await getUserById(userId);

  if (!date) {
    date = new Date();
  }

  const entries = await getEntryCollection();

  const match = source.text.match(yesterdayRegex);
  if (match && match.length) {
    const group = match[1].replace(/-y\s*|--yesterday\s*/gi, '');
    let daysAgo = 1;
    if (group.length) {
      try {
        daysAgo = parseInt(group.trim(), 10);
      } catch (e) {}
    }
    if (daysAgo > 0) {
      date.setDate(date.getDate() - daysAgo);
    }
  }

  const result = await entries.insertOne({
    user: userId,
    source: source,
    date: date
  });

  if (result.result.ok !== 1) {
    throw new Error('Failed to create new entry.');
  }

  return getEntryById(result.insertedId);
}
