<script setup>
defineProps({
   legend: {
      type: String,
      default: ''
   }
});
</script>

<template>
   <Fieldset
      v-if="legend"
      :legend="legend"
      :pt="{
         content: {
            class: 'flex-1 flex flex-wrap gap-4 !p-4'
         }
      }"
   >
      <slot />
   </Fieldset>
   <form v-else class="flex-1 flex flex-wrap gap-4 p-4" @submit.prevent>
      <slot />
   </form>
</template>
