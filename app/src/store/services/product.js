import Collection from '@/lib/Collection';

export const useProductStore = defineStore('products', () => {
   const useProducts = () => {
      const defaultSelect = '*, categories: product_category(*)';
      const products = new Collection(null);
      const productsByCategory = new Collection({});

      async function fetchProducts(select = defaultSelect) {
         const res = await supabase.from('products').select(select).throwOnError();
         const { data } = res;
         products._setDefaults(data || [])._reset();

         productsByCategory._reset();
         data?.forEach((product) => {
            product.categories.forEach((category) => {
               productsByCategory[category.display_name] ??= [];
               productsByCategory[category.display_name] = _concat(
                  productsByCategory[category.display_name],
                  [product]
               );
            });
         });

         return res;
      }

      async function getProducts(select = defaultSelect) {
         if (_isNil(products._data)) {
            await fetchProducts(select);
            emitter.on('product-update', () => fetchProducts(select));
         }

         return products;
      }

      async function getProductsByCategory() {
         if (_isNil(products._data)) await getProducts();
         return productsByCategory;
      }

      return {
         products,
         productsByCategory,

         fetchProducts,

         getProducts,
         getProductsByCategory
      };
   };

   const useCategories = () => {
      const categories = new Collection(null);

      async function fetchCategories(select = '*') {
         const res = await supabase.from('product_category').select(select).throwOnError();
         const { data } = res;
         categories._setDefaults(data || [])._reset();
      }

      async function getCategories(select = '*') {
         if (_isNil(categories._data)) await fetchCategories(select);

         return categories;
      }

      return {
         categories,

         fetchCategories,
         getCategories
      };
   };

   const useBrands = () => {
      const productBrands = new Collection(null);

      async function fetchProductBrands(select = '*') {
         const res = await supabase.from('product_brands').select(select).throwOnError();
         const { data } = res;
         productBrands._setDefaults(data || [])._reset();
      }

      async function getProductBrands() {
         if (_isNil(productBrands.data)) await fetchProductBrands();
         return productBrands;
      }

      return {
         productBrands,
         fetchProductBrands,
         getProductBrands
      };
   };

   return {
      useProducts,
      useCategories,
      useBrands
   };
});
