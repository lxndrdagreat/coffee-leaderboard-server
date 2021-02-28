import { ObjectId } from 'bson';
import { UserAppTokenSchema } from './user-app-token.schema';

export interface UserSchema {
  _id: ObjectId;
  userName: string;
  tokens: UserAppTokenSchema[];
}
