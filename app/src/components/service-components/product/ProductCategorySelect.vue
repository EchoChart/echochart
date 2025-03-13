<script setup>
import { PRODUCT_CATEGORY_PROPS } from '@/services/models/ProductModel';
import { useProductStore } from '@/store/services/product';

const { getCategories } = useProductStore();
const productCategories = await getCategories();
</script>

<template>
   <MultiSelect
      :filter="true"
      :options="productCategories._data"
      option-label="display_name"
      option-value="display_name"
      display="chip"
   >
      <template #value="{ value }">
         <Badge
            v-for="category in value"
            :value="$t(category?.display_name || category)"
            size="large"
            :key="category"
            v-bind="PRODUCT_CATEGORY_PROPS[category?.display_name || category]"
         />
      </template>
      <template #option="{ option }">
         <Badge
            :value="$t(option?.display_name || option)"
            size="large"
            v-bind="PRODUCT_CATEGORY_PROPS[option?.display_name || option]"
         />
      </template>
   </MultiSelect>
</template>
