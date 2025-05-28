<script setup>
import AppConfigurator from '@components/layout/AppConfigurator.vue';

const appConfigurator = ref();
</script>

<template>
   <div class="floating-configurator">
      <Button
         icon="pi pi-palette"
         @click="appConfigurator?.toggle"
         type="button"
         rounded
         class="floating-configurator__button"
      />
      <Popover class="floating-configurator__popover" ref="appConfigurator">
         <AppConfigurator />
      </Popover>
   </div>
</template>

<style lang="scss">
.floating-configurator {
   @apply fixed flex gap-4 top-8 right-8;

   &__button {
      @apply rounded;
   }

   &__popover {
      @apply w-min;
   }
}
</style>
