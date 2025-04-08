<script setup>
import { countries } from 'countries-list';

const currencies = computed(() => [
   ...new Set(_values(countries).flatMap(({ currency }) => currency)).values()
]);
</script>
<template>
   <Select :filter="true" :options="currencies" :placeholder="$t('select_currency')" />
</template>
