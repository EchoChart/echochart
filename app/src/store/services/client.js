import Collection from '@/lib/Collection';

export const useClientsStore = defineStore('clients', () => {
   const useClients = () => {
      const defaultSelect = '*';
      const clients = new Collection(null);

      async function fetchClients(select = defaultSelect) {
         const res = await supabase.from('clients').select(select).throwOnError();
         const { data } = res;
         clients._set(data);
         return res;
      }

      async function getClients(select = defaultSelect) {
         if (_isNil(clients._data)) await fetchClients(select);

         return clients;
      }

      async function getClient(id, select = defaultSelect) {
         const res = await supabase.from('clients').select(select).single().throwOnError();
         const { data } = res;
         return data;
      }

      return {
         clients,
         fetchClients,
         getClients,
         getClient
      };
   };

   return {
      useClients
   };
});
