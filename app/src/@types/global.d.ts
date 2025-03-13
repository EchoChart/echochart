import { Database } from "./database.types";

declare global{
    type Db = Database
    type Public = Db['public'] & {}
    type Tables = Public['Tables'] & {}

    // Users
    type Users = Tables['user']
    type UserRow =  Users['Row'] & {
    }
    type UserInsert =  Users['Insert'] & {
    }
    type UserUpdate =  Users['Update'] & {
    }

    // Users
    type Permissions = Tables['permission']
    type PermissionRow =  Permissions['Row'] & {
    }
    type PermissionInsert =  Permissions['Insert'] & {
    }
    type PermissionUpdate =  Permissions['Update'] & {
    }
}
