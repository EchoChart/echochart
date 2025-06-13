import Collection from '@/lib/Collection';

export const useStockStore = defineStore('stock', () => {
   const useStocks = () => {
      const defaultSelect = '*, product:product(*, category:product_category(*))';
      const stocks = Collection.create(null);

      async function fetchStocks(select = defaultSelect) {
         const res = supabase.from('stock').select(select).throwOnError();
         const { data } = res;
         stocks._setDefaults(data || [])._reset();

         return res;
      }

      async function fetchStock(id = '', select = defaultSelect) {
         if (_isNil(id) || _isEmpty(id)) return;

         const { data } = await supabase
            .from('stock')
            .select(select)
            .eq('id', id)
            .single()
            .throwOnError();

         return data;
      }

      async function getStocks(select = defaultSelect) {
         if (_isNil(stocks._data)) {
            await fetchStocks(select);
         }
         return stocks;
      }

      async function getStock(id, select = defaultSelect) {
         const stock = stocks?.find?.((stock) => stock.id === id);
         if (stock) {
            return stock;
         }
         return await fetchStock(id, select);
      }

      return {
         stocks,

         fetchStocks,
         fetchStock,
         getStocks,
         getStock
      };
   };
   emitter.on('stock-update', (data) => {
      emitter.emit('device-update', data);
      emitter.emit('spare-part-update', data);
      emitter.emit('battery-update', data);
   });

   const useVendors = () => {
      const vendors = Collection.create(null);
      const vendorStats = Collection.create(null);

      async function fetchVendors(select = '*') {
         const { data } = await supabase.from('stock_vendor').select(select).throwOnError();
         vendors._setDefaults(data || [])._reset();
      }

      async function fetchVendorStats(select = '*, product:product!product_id(*)') {
         const { data } = await supabase.from('stock_vendor_stats').select(select).throwOnError();
         return data;
      }

      async function getVendors(select) {
         if (_isNil(vendors._data)) await fetchVendors(select);
         return vendors;
      }

      async function getVendorStats(select) {
         if (_isNil(vendorStats._data)) await fetchVendorStats(select);
         return vendorStats;
      }

      return {
         vendors,
         vendorStats,

         fetchVendors,
         fetchVendorStats,
         getVendors,
         getVendorStats
      };
   };

   return {
      ...useStocks(),
      ...useVendors()
   };
});
