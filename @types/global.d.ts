import { Database } from "./database.types";

declare global{
    type Db = Database
    type Public = Db['public'] & {}
    type Tables = Public['Tables'] & {}

    // Users
    type Users = Tables['users']
    type UserRow =  Users['Row'] & {
    }
    type UserInsert =  Users['Insert'] & {
    }
    type UserUpdate =  Users['Update'] & {
    }
}
