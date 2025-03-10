<script setup>
import { useStockStore } from '@/store/services/stock';

const { getVendors } = useStockStore().useVendors();
const vendors = await getVendors();
</script>

<template>
   <Select
      filter
      :options="vendors._data"
      option-label="display_name"
      option-value="display_name"
      editable
   />
</template>
