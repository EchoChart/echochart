import Collection from '@/lib/Collection';

export const useStocksStore = defineStore('stocks', () => {
   const useStocks = () => {
      const defaultSelect = '*, product:products(*, category:product_category(*))';
      const stocks = new Collection(null);

      async function fetchStocks(select = defaultSelect) {
         const res = await fetchStocks(select);
         const { data } = res;
         stocks._setDefaults(data || [])._reset();

         return supabase.from('stocks').select(select).throwOnError();
      }

      async function fetchStock(id = '', select = defaultSelect) {
         if (_isNil(id) || _isEmpty(id)) return;

         const { data } = await supabase
            .from('stocks')
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
         const stock = stocks ? stocks.find?.((stock) => stock.id === id) : null;
         if (stock) {
            return stock;
         }
         return await fetchStock(id, select);
      }

      emitter.on('device-update', () => emitter.emit('stock-update'));
      emitter.on('spare-part-update', () => emitter.emit('stock-update'));
      emitter.on('battery-update', () => emitter.emit('stock-update'));

      return {
         stocks,

         fetchStocks,
         fetchStock,
         getStocks,
         getStock
      };
   };

   const useVendors = () => {
      const vendors = new Collection(null);
      const vendorStats = new Collection(null);

      async function fetchVendors(select = '*') {
         const { data } = await supabase.from('stock_vendors').select(select).throwOnError();
         vendors._setDefaults(data || [])._reset();
      }

      async function fetchVendorStats(select = '*, product:products!product_id(*)') {
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
      useStocks,
      useVendors
   };
});
