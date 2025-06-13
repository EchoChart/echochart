<script setup>
import Collection from '@/lib/Collection';
import { PRODUCT_CATEGORY_PROPS } from '@/services/models/ProductModel';

const props = defineProps({
   select: {
      type: String,
      default: '*'
   }
});

const { data } = await supabase.from('product_category').select(props.select).throwOnError();
const categories = Collection.create(data);
</script>

<template>
   <MultiSelect
      :filter="true"
      :options="categories._data"
      option-label="display_name"
      option-value="display_name"
      display="chip"
      :placeholder="$t('select_category')"
   >
      <template #value="{ value }">
         <Tag
            v-for="category in value"
            :value="$t(category?.display_name || category)"
            :key="category"
            v-bind="PRODUCT_CATEGORY_PROPS[category?.display_name || category]"
         />
      </template>
      <template #option="{ option }">
         <Tag
            :value="$t(option?.display_name || option)"
            v-bind="PRODUCT_CATEGORY_PROPS[option?.display_name || option]"
         />
      </template>
   </MultiSelect>
</template>
