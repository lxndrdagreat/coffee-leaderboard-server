import { ObjectId } from 'bson';

export type EntrySource =
  | {
      type: 'slack';
      text: string;
      channel: {
        id: string;
        name: string;
      };
    }
  | {
      type: 'app';
    };

export interface CoffeeEntrySchema {
  _id: ObjectId;
  user: ObjectId;
  source: EntrySource;
  date: Date;
}
