import Collection from '@/lib/Collection';

export const useProductsStore = defineStore('products', () => {
   const useProducts = () => {
      const defaultSelect = '*, categories: product_category(*)';
      const products = new Collection(null);
      const productsByCategory = new Collection({});
      const productBrands = new Collection(null);

      async function fetchProducts(select = defaultSelect) {
         const res = await supabase.from('products').select(select).throwOnError();
         const { data } = res;
         products._set(data);

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

      async function fetchProductBrands(select = '*') {
         const res = await supabase.from('product_brands').select(select).throwOnError();
         const { data } = res;
         productBrands._set(data);
      }

      async function getProducts(select = defaultSelect) {
         if (_isNil(products._data)) await fetchProducts(select);

         return products;
      }

      async function getProductsByCategory() {
         if (_isNil(products._data)) await getProducts();
         return productsByCategory;
      }

      async function getProductBrands() {
         if (_isNil(productBrands.data)) await fetchProductBrands();
         return productBrands;
      }

      return {
         products,
         productsByCategory,
         productBrands,

         fetchProducts,
         fetchProductBrands,

         getProducts,
         getProductsByCategory,
         getProductBrands
      };
   };

   const useCategories = () => {
      const categories = new Collection(null);

      async function fetchCategories(select = '*') {
         const res = await supabase.from('product_category').select(select).throwOnError();
         const { data } = res;
         categories._set(data);
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

   return {
      ...useProducts(),
      ...useCategories()
   };
});
