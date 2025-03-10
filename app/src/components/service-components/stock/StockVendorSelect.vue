<script setup>
import { useStocksStore } from '@/store/services/stock';

const { getVendors } = useStocksStore().useVendors();
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
