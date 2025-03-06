<script setup>
const modelValue = defineModel('modelValue');
</script>

<template>
   <IconField class="w-96 max-w-1/4">
      <InputIcon>
         <i class="pi pi-search" />
      </InputIcon>
      <InputText
         v-keyfilter="{ pattern: /[a-zA-Z0-9\.\-\/\s]+/ }"
         :placeholder="$t('keyword search')"
         class="w-full"
         v-model="modelValue"
      />
   </IconField>
</template>
