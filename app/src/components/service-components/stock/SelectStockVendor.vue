<script setup>
import Collection from '@/lib/Collection';

const props = defineProps({
   select: {
      type: String,
      default: '*',
      required: false
   }
});

const useVendors = () => {
   const vendors = Collection.create([]);
   const fetchVendors = async () => {
      const { data } = await supabase.from('stock_vendor').select(props.select).throwOnError();
      vendors._setDefaults(data)._reset();
   };
   return { vendors, fetchVendors };
};

const { vendors, fetchVendors } = useVendors();

await fetchVendors();

onMounted(() => emitter.on('stock-update', fetchVendors));
onUnmounted(() => emitter.off('stock-update', fetchVendors));
</script>

<template>
   <Select
      filter
      :options="vendors._data"
      option-label="display_name"
      option-value="display_name"
      editable
      :placeholder="$t('input.select_or_write')"
   />
</template>
