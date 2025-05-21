<script setup>
import { Form } from '@/lib/Form';

defineProps({
   legend: {
      type: String,
      default: null
   },
   form: {
      type: Form,
      default: null
   },
   readonly: {
      type: Boolean,
      default: false
   },
   invalid: {
      type: Boolean,
      default: false
   },
   error: {
      type: [String, Boolean],
      default: null
   }
});
</script>

<template>
   <template v-if="_isNil(legend)">
      <form :invalid="invalid || !!error" class="form_box" @submit.prevent>
         <slot :readonly :form />

         <slot name="form-actions" :form :readonly :legend>
            <div v-if="!readonly" class="form_box-actions">
               <span class="flex-[0] flex items-center gap-4 p-4 justify-end backdrop-blur-lg">
                  <Button
                     :label="$t('save')"
                     class="flex-1 w-48"
                     :disabled="!form?._isChanged"
                     type="submit"
                  />
                  <Button
                     :label="$t('reset')"
                     severity="secondary"
                     class="flex-1to w-48"
                     :disabled="!form?._isChanged"
                     type="reset"
                  />
               </span>
            </div>
         </slot>
      </form>
   </template>
   <template v-else>
      <Fieldset
         :invalid="invalid || !!error"
         :legend="_startCase(legend)"
         :pt="{
            content: {
               class: 'form_box'
            }
         }"
         class="form_box"
      >
         <slot />
         <template #legend="slotProps">
            <slot name="header">
               <div class="flex items-center gap-4">
                  <slot name="legend">
                     <label v-text="_startCase(legend)" v-bind="slotProps" />
                  </slot>
                  <slot name="actions" />
                  <ErrorBadge v-if="error" :error="error" />
               </div>
            </slot>
         </template>
      </Fieldset>
   </template>
</template>
<style lang="scss">
.form_box {
   @apply flex-1 flex flex-wrap gap-2 items-start;

   &[invalid='true'] {
      @apply border-[var(--p-button-danger-border-color)];
   }

   & > .form_box {
      @apply self-start;
   }

   &-actions {
      @apply w-full flex justify-end items-center sticky bottom-0 bg-transparent;
   }

   & .form_field {
      @apply min-w-min;
   }
}
</style>
