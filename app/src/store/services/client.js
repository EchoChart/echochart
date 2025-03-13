import Collection from '@/lib/Collection';

export const useClientStore = defineStore('client', () => {
   const useClients = () => {
      const defaultSelect = '*';
      const client = new Collection(null);

      async function fetchClients(select = defaultSelect) {
         const res = await supabase.from('client').select(select).throwOnError();
         const { data } = res;
         client._set(data);
         return res;
      }

      async function fetchClient(id = '', select = defaultSelect) {
         if (_isNil(id)) return;
         const res = await supabase
            .from('client')
            .select(select)
            .eq('id', id)
            .single()
            .throwOnError();
         const { data } = res;
         return data;
      }

      async function getClients(select = defaultSelect) {
         if (_isNil(client._data)) await fetchClients(select);

         return client;
      }

      async function getClient(id, select = defaultSelect) {
         const client = client.find?.((c) => c?.id === id);

         if (!_isNil(client)) return client;

         const res = await fetchClient(id, select);
         return res;
      }

      return {
         client,

         fetchClients,
         fetchClient,

         getClients,
         getClient
      };
   };

   return {
      useClients
   };
});
