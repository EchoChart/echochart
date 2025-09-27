import { RouteRecordNameGeneric } from 'vue-router';

// Define a type for auditItemRoutes
interface FieldRoutes {
   [key: string]: { name: RouteRecordNameGeneric };
}

// Initialize auditItemRoutes with the correct type
export const fieldRoutes: FieldRoutes = {
   role_id: { name: 'branch-role-edit' },
   role: { name: 'branch-role-edit' },
   user_id: { name: 'branch-user-manage' },
   user: { name: 'branch-user-manage' },
   client_id: { name: 'client-manage' },
   client: { name: 'client-manage' },
   address_id: { name: 'address-edit' },
   address: { name: 'address-edit' },
   record_id: { name: 'record-edit' },
   record: { name: 'record-edit' },
   stock_id: { name: 'stock-edit' },
   stock: { name: 'stock-edit' }
};
