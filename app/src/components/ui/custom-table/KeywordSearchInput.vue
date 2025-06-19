<script setup>
const modelValue = defineModel('modelValue');
</script>

<template>
   <IconField class="keyword_search__field">
      <InputIcon>
         <i class="keyword_search__icon pi pi-search" />
      </InputIcon>
      <InputText
         :placeholder="$t('component.table.keyword_search')"
         class="keyword_search__input"
         v-model="modelValue"
      />
   </IconField>
</template>

<style lang="scss">
.keyword_search {
   &__field {
      @apply w-[clamp(12rem,40vw,32rem)];
   }

   &__input {
      @apply w-full;
   }
}
</style>
