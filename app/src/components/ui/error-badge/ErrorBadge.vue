<script setup>
import { defineProps } from 'vue';

defineProps({
   error: {
      type: String,
      default: null
   }
});
</script>

<template>
   <Badge
      severity="danger"
      class="error-badge__badge"
      v-tooltip="{
         value: error,
         pt: {
            root: {
               class: 'error-tooltip'
            },
            text: 'error-tooltip-text'
         }
      }"
   >
      <i class="error-badge__icon" :class="PrimeIcons.EXCLAMATION_CIRCLE" />
   </Badge>
</template>

<style lang="scss">
.error-badge {
   &__badge {
      @apply p-0;
   }

   &__icon {
      @apply text-lg;
   }
}
</style>
