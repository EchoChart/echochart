<script setup>
const modelValue = defineModel('modelValue');
</script>

<template>
   <IconField class="w-[clamp(12rem,40vw,32rem)]">
      <InputIcon>
         <i class="pi pi-search" />
      </InputIcon>
      <InputText :placeholder="$t('keyword search')" class="w-full" v-model="modelValue" />
   </IconField>
</template>
