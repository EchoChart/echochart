<script setup>
import { useProductsStore } from '@/store/services/product';

const routeLoading = inject('routeLoading', false);

const productStore = useProductsStore();
const productBrands = routeLoading?.value ? [] : await productStore.getProductBrands();
</script>

<template>
   <Select
      :loading="routeLoading"
      :filter="true"
      :options="productBrands._data"
      option-label="display_name"
      option-value="display_name"
   />
</template>
