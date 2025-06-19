<script setup>
import { STOCK_UNIT_TYPES } from '@/constants/form/stock';
</script>
<template>
   <Select
      :filter="true"
      option-label="label"
      option-value="value"
      :options="STOCK_UNIT_TYPES"
      :placeholder="$t('financial.select_unit_type')"
   />
</template>
