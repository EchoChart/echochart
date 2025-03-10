<script setup>
import { useProductsStore } from '@/store/services/product';

const productStore = useProductsStore();
const productBrands = await productStore.getProductBrands();
</script>

<template>
   <Select
      :filter="true"
      :options="productBrands._data"
      option-label="display_name"
      option-value="display_name"
   />
</template>
