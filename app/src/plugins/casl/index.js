import { createAliasResolver } from '@casl/ability';

export const resolveAction = createAliasResolver({
   select: ['modify', 'read', 'access', 'get', 'fetch', 'view'],
   insert: ['create', 'add', 'make'],
   update: ['modify', 'change', 'edit'],
   delete: ['modify', 'destroy', 'remove']
});
