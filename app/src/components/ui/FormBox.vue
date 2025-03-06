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
            class: 'flex-1 flex flex-wrap gap-2'
         }
      }"
   >
      <slot />
   </Fieldset>
   <form v-else class="flex-1 flex flex-wrap gap-2" @submit.prevent>
      <slot :readonly="$attrs.readonly" />
   </form>
</template>
