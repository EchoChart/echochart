<script setup>
import Collection from '@/lib/Collection';
const operations = Collection.create([
   { value: 'INSERT', label: i18n.t('add'), severity: 'success' },
   { value: 'UPDATE', label: i18n.t('update'), severity: 'info' },
   { value: 'DELETE', label: i18n.t('delete'), severity: 'danger' }
   // { value: 'SELECT', label: i18n.t('read'), severity: 'secondary' }
]);
</script>

<template>
   <MultiSelect
      :filter="true"
      :options="operations._data"
      option-label="label"
      option-value="value"
      :placeholder="$t('select_operation')"
   >
      <template #value="{ value }">
         <Tag
            v-for="operation in operations.filter((o) => value?.includes?.(o.value))"
            v-bind="operation"
            :value="operation?.label || operation.value"
            :key="operation"
         />
      </template>
      <template #option="{ option: operation }">
         <Tag v-bind="operation" :value="operation?.label || operation.value" :key="operation" />
      </template>
   </MultiSelect>
</template>
