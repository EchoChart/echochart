<script setup>
import { countries } from 'countries-list';

const options = computed(() => _values(countries));
</script>
<template>
   <Select
      :filter="true"
      :options
      option-value="name"
      option-label="name"
      :placeholder="$t('address.select_country')"
   />
</template>
