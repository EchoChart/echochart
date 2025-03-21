<script setup>
import Collection from '@/lib/Collection';
const props = defineProps({
   select: {
      type: String,
      default: '*'
   }
});

const { data } = await supabase.from('product_brands').select(props.select).throwOnError();
const productBrands = new Collection(data);
</script>

<template>
   <Select
      :filter="true"
      :options="productBrands._data"
      option-label="display_name"
      option-value="display_name"
      @value-change="
         $emit(
            'client',
            productBrands._data.find(
               (brand) => _get(brand, $attrs.optionValue || 'display_name') == $event
            )
         )
      "
   />
</template>
