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
   }
});
</script>

<template>
   <template v-if="_isNil(legend)">
      <form class="form_box" @submit.prevent>
         <slot :readonly :form />

         <slot name="form-actions" :form :readonly :legend>
            <div v-if="!readonly" class="form_box-actions">
               <Button
                  :label="$t('save')"
                  class="flex-[.2] w-48"
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
   <template v-else>
      <Fieldset
         :legend="_startCase(legend)"
         :pt="{
            content: {
               class: 'form_box'
            }
         }"
         class="form_box"
      >
         <slot />
      </Fieldset>
   </template>
</template>
<style lang="scss">
.form_box {
   @apply flex-1 flex flex-wrap gap-2;

   & > .form_box {
      @apply self-start;
   }

   &-actions {
      @apply flex flex-wrap items-center justify-end p-4 gap-4 flex-auto w-full sticky bottom-0 bg-transparent backdrop-blur-lg;
   }

   & .form-field {
      @apply flex-1 min-w-min;
   }
}
</style>
