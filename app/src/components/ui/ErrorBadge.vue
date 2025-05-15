<script setup>
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
      class="!p-0"
      v-tooltip="{
         value: error,
         pt: {
            root: {
               class: 'backdrop-blur-md'
            },
            text: '!bg-red-400 !bg-opacity-20 !border-red-400 border !text-current '
         }
      }"
   >
      <i class="!text-lg" :class="PrimeIcons.EXCLAMATION_CIRCLE" />
   </Badge>
</template>
