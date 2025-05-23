<script setup>
import { currencies } from '@/constants/form/common';
</script>
<template>
   <Select :filter="true" :options="currencies" :placeholder="$t('select_currency')" />
</template>
