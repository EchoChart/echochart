<script setup>
import { useProductsStore } from '@/store/services/product';
const props = defineProps({
   category: {
      type: String,
      default: null,
      required: false
   }
});

const routeLoading = inject('routeLoading', false);

const categories = computed(() => props.category?.split?.('|') || []);

const productStore = useProductsStore();
const allProducts = routeLoading?.value ? [] : await productStore.getProducts();
const productsByCategory = routeLoading?.value ? [] : await productStore.getProductsByCategory();

const products = computed(() => {
   if (categories.value.some?.((c) => _keys(productsByCategory._data).includes(c)))
      return _flatMap(_values(_pick(productsByCategory, categories.value)));
   return allProducts._data;
});
</script>

<template>
   <Select
      :loading="routeLoading"
      :filter="true"
      :options="products"
      option-label="display_name"
      option-value="id"
   />
</template>
