<script setup lang="ts" generic="T = any">
import { Form } from '@/lib/Form';

export interface FormBoxProps {
   legend?: string;
   form?: Form<T>;
   readonly?: boolean;
   invalid?: boolean;
   error?: string | boolean;
   printable?: boolean;
}

defineProps<FormBoxProps>();

const boxElement = ref();
</script>

<template>
   <template v-if="_isNil(legend)">
      <form :invalid="invalid || !!error" class="form_box" @submit.prevent>
         <slot v-bind="$props" />

         <slot name="form-actions" v-bind="$props">
            <div v-if="!readonly" class="form_box__actions-bar">
               <span class="form_box__button-container">
                  <Button
                     :label="$t('save')"
                     class="form_box__button"
                     :disabled="!form?._isChanged"
                     type="submit"
                  />
                  <Button
                     :label="$t('reset')"
                     severity="secondary"
                     class="form_box__button"
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
         :legend="legend"
         :pt="{
            content: {
               class: 'form_box'
            }
         }"
         class="form_box"
         :ref="boxElement"
      >
         <slot />
         <template #legend="slotProps">
            <slot name="header" v-bind="$props">
               <div class="form_box__header-container">
                  <slot name="legend" v-bind="$props">
                     <label v-text="legend" v-bind="slotProps" class="form_box__label" />
                  </slot>
                  <div class="form_box__header-actions">
                     <slot name="actions" />
                  </div>
                  <div class="form_box__header-actions">
                     <PrintElementButton
                        v-if="printable"
                        :element="boxElement"
                        class="form_box__print-button"
                     />
                     <ErrorBadge v-if="error" :error="error" class="form_box__error-badge" />
                  </div>
               </div>
            </slot>
         </template>
      </Fieldset>
   </template>
</template>

<style lang="scss">
.form_box {
   @apply flex-1 flex flex-wrap gap-2 items-start relative;

   &:has(&) {
      @apply gap-4;
   }

   &[invalid='true'] {
      @apply border-[var(--p-button-danger-border-color)];
   }

   &__header {
      &-container {
         @apply flex items-center gap-4;
      }
      &-actions {
         @apply print:!hidden;
      }
   }

   & > .form_box {
      @apply self-start;
   }

   &__actions-bar {
      @apply w-full flex justify-end items-center sticky bottom-0 bg-transparent pointer-events-none print:!hidden;

      & * {
         @apply pointer-events-auto;
      }
   }

   &__button-container {
      @apply flex flex-wrap items-center gap-4 p-4 justify-end rounded-[var(--content-border-radius)] backdrop-blur-sm;
   }

   &__button {
      @apply flex-1 w-48;
   }
}
</style>
