import Collection from '@/lib/Collection';

export const usePermissionsStore = defineStore('permissions', () => {
   const permissions = new Collection(null);

   async function fetchPermissions(select = 'id,resource_name,group_name,kind') {
      return supabase.from('permissions').select(select).throwOnError();
   }

   async function getPermissions() {
      if (_isNil(permissions._data)) {
         const { data } = await fetchPermissions();
         permissions._setDefaults(data || [])._reset();
      }
      return permissions;
   }

   return {
      permissions,
      fetchPermissions,
      getPermissions
   };
});
