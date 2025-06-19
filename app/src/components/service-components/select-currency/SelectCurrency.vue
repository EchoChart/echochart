<script setup>
import { currencies } from '@/constants/form/common';
</script>
<template>
   <Select :filter="true" :options="currencies" :placeholder="$t('financial.select_currency')" />
</template>
