<script setup>
defineProps({
   error: {
      type: [String, Boolean],
      default: null
   }
});
</script>

<template>
   <Badge
      severity="danger"
      class="error_badge__badge"
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
      <i class="error_badge__icon" :class="PrimeIcons.EXCLAMATION_CIRCLE" />
   </Badge>
</template>

<style lang="scss">
.error_badge {
   &__badge {
      @apply p-0;
   }

   &__icon {
      @apply text-lg;
   }
}
</style>
