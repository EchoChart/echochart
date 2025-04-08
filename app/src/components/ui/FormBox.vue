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
            class: 'form-box'
         }
      }"
   >
      <slot />
   </Fieldset>
   <form v-else class="form-box" @submit.prevent>
      <slot :readonly="$attrs.readonly" />
   </form>
</template>
<style lang="scss">
.form-box {
   @apply flex-1 flex flex-wrap gap-2;

   & > .form-field {
      @apply flex-1 min-w-min max-w-max;
   }
}
</style>
