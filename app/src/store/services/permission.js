import Collection from '@/lib/Collection';

export const usePermissionStore = defineStore('permission', () => {
   const usePermissions = () => {
      const defaultSelect = 'id,resource_name,group_name,kind';
      const permission = new Collection(null);

      async function fetchPermissions(select = defaultSelect) {
         const res = await supabase.from('permission').select(select).throwOnError();
         const { data } = res;
         permission._set(data);
         return res;
      }

      async function getPermissions(select = defaultSelect) {
         if (_isNil(permission._data)) await fetchPermissions(select);

         return permission;
      }

      return {
         permission,
         fetchPermissions,
         getPermissions
      };
   };

   return {
      usePermissions
   };
});
