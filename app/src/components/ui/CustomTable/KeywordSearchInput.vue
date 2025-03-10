<script setup>
const modelValue = defineModel('modelValue');
</script>

<template>
   <IconField class="w-[clamp(12rem,40vw,32rem)]">
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
