<script setup>
import { Form } from '@/lib/Form';

defineProps({
   legend: {
      type: String,
      default: ''
   },
   form: {
      type: Form,
      default: null
   },
   readonly: {
      type: Boolean,
      default: false
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
      <slot :readonly :form />

      <slot name="form-actions" :form :readonly :legend>
         <div v-if="!readonly" class="flex flex-wrap items-center gap-4 !flex-auto w-full">
            <Button
               :label="$t('save')"
               class="flex-[.2] w-48 ms-auto"
               :disabled="!form?._isChanged"
               type="submit"
            />
            <Button
               :label="$t('reset')"
               severity="secondary"
               class="flex-[.2] w-48"
               :disabled="!form?._isChanged"
               type="reset"
            />
         </div>
      </slot>
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
