<script setup>
import Collection from '@/lib/Collection';
import { PRODUCT_CATEGORY_PROPS } from '@/services/models/ProductModel';

const props = defineProps({
   select: {
      type: String,
      default: 'id,display_name'
   }
});

const { data } = await supabase.from('product_category').select(props.select).throwOnError();
const categories = new Collection(data);
</script>

<template>
   <MultiSelect
      :filter="true"
      :options="categories._data"
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
