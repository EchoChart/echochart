import Collection from '@/lib/Collection';

export const usePermissionsStore = defineStore('permissions', () => {
   const usePermissions = () => {
      const defaultSelect = 'id,resource_name,group_name,kind';
      const permissions = new Collection(null);

      async function fetchPermissions(select = defaultSelect) {
         const res = await supabase.from('permissions').select(select).throwOnError();
         const { data } = res;
         permissions._set(data);
         return res;
      }

      async function getPermissions(select = defaultSelect) {
         if (_isNil(permissions._data)) await fetchPermissions(select);

         return permissions;
      }

      return {
         permissions,
         fetchPermissions,
         getPermissions
      };
   };

   return {
      ...usePermissions()
   };
});
