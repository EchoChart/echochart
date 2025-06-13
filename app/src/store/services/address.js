import Collection from '@/lib/Collection';

export const useAddressStore = defineStore('address', () => {
   const useAddresses = () => {
      const defaultSelect = '*';
      const addresses = Collection.create(null);

      async function fetchAddresses(select = defaultSelect) {
         const res = await supabase.from('address').select(select).throwOnError();
         const { data } = res;
         addresses._set(data);
         return res;
      }

      async function fetchAddress(id = '', select = defaultSelect) {
         if (_isNil(id)) return;
         const res = await supabase
            .from('address')
            .select(select)
            .eq('id', id)
            .single()
            .throwOnError();
         const { data } = res;
         return data;
      }

      async function getAddresses(select = defaultSelect) {
         if (_isNil(addresses._data)) await fetchAddresses(select);

         return addresses;
      }

      async function getAddress(id, select = defaultSelect) {
         const address = addresses.find?.((a) => a?.id === id);

         if (!_isNil(address)) return address;

         const res = await fetchAddress(id, select);

         return res;
      }

      return {
         addresses,

         fetchAddresses,
         fetchAddress,

         getAddresses,
         getAddress
      };
   };

   return {
      ...useAddresses()
   };
});
