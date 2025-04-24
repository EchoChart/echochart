import { Database } from './database.types';

declare global {
   type Db = Database;
   type Public = Db['public'] & {};
   type Tables = Public['Tables'] & {};
   type Views = Public['Views'] & {};
}
