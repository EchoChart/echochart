<script setup lang="ts">
defineOptions({
   inheritAttrs: false
});

export type FormFieldProps = {
   id?: string;
   tabIndex?: number;
   loading?: boolean;
   reverse?: boolean;
   error?: string | boolean;
   label?: string;
   readonly?: boolean;
};

const props = withDefaults(defineProps<FormFieldProps>(), {
   // default props
});
const routeLoading = inject('routeLoading', false as any);
const isLoading = computed(() => {
   if (!_isNil(props.loading)) {
      return props.loading;
   }
   return routeLoading?.value;
});

const attrs = useAttrs();

const errorMessageElement = ref(null);
const errorTextElement = ref(null);

const errorElStyle = useElementSize(errorMessageElement);

/**@type {String} */
const id = props.id || useId() || _kebabCase(props.label);

const containerClass = computed(() => [
   attrs.class,
   'form_field',
   _has(attrs, 'fluid') && 'form_field--fluid',
   props.reverse && 'form_field--reverse'
]);

const containerStyle = computed(() => ({
   paddingBottom:
      (!!errorElStyle.height?.value && `calc(${_round(errorElStyle.height?.value)}px + 1rem)`) || ''
}));

const headerClass = computed(() => [
   'form_field__header',
   props.reverse && 'form_field__header--reverse',
   _has(attrs, 'fluid') && 'form_field__header--fluid'
]);

const inputClass = computed(() => [
   'form_field__input',
   _has(attrs, 'fluid') && 'form_field__input--fluid',
   props.reverse && 'form_field__input--reverse'
]);

const errorClass = computed(() => ['form_field__error p-message-error']);

onMounted(() => {
   const elementsHasSameId = document.querySelectorAll(`#${id}`);
   if (elementsHasSameId.length > 1) {
      elementsHasSameId.forEach((item) => {
         if (item.nodeName !== 'INPUT') {
            item.removeAttribute('id');
         }
      });
   }
});
</script>

<template>
   <div :class="containerClass" :style="containerStyle">
      <slot name="header" v-bind="{ isLoading, reverse, error, id, errorClass, headerClass }">
         <div
            v-if="!!props.label || $slots.label || $slots.actions || _size(error as string) >= 60"
            class="form_field__header"
            :class="headerClass"
         >
            <slot name="label" :for="id" :id="`label-${id}`" :title="props.label">
               <label
                  v-if="!!props.label"
                  :for="id"
                  :id="`label-${id}`"
                  v-text="props.label"
                  :title="props.label"
                  class="form_field__header-label"
                  :pt="{
                     text: { class: 'truncate' }
                  }"
               />
            </slot>

            <slot name="actions" />

            <slot name="badges" />

            <ErrorBadge v-if="_size(error as string) >= 60" :error="error" />
         </div>
      </slot>

      <BlockUI
         :blocked="readonly === true"
         :pt="{
            root: { class: 'contents' },
            mask: {
               class: '!bg-[transparent]'
            }
         }"
      >
         <Suspense>
            <slot
               :disabled="isLoading"
               :loading="isLoading"
               :id="id"
               :inputId="id"
               :invalid="!!error"
               :tabIndex="readonly ? -1 : tabIndex"
               :aria-labelledby="(!!props.label && `label-${id}`) || undefined"
               :aria-errormessage="`${id}-errormessage`"
               v-bind="_omit(attrs, ['class'])"
               :class="inputClass"
            />
            <template #fallback>
               <Skeleton height="2.5rem" :class="inputClass" v-bind="_omit(attrs, ['class'])" />
            </template>
         </Suspense>
      </BlockUI>

      <slot name="error">
         <Message
            :id="`${id}-errormessage`"
            size="small"
            ref="errorMessageElement"
            v-if="!!error && _size(error as string) < 60"
            severity="error"
            class="form_field__error"
            :class="errorClass"
            :pt="{
               content: { class: '!py-0' },
               text: { class: 'whitespace-pre-line line-clamp-2', ref: errorTextElement }
            }"
            v-tooltip.bottom="{
               value: error,
               pt: {
                  root: {
                     class: 'error-tooltip'
                  },
                  text: 'error-tooltip-text'
               }
            }"
         >
            {{ error }}
         </Message>
      </slot>
      <Skeleton v-if="isLoading" class="form_field__skeleton" />
   </div>
</template>

<style lang="scss">
.form_field {
   @apply flex gap-4 p-2 relative transition-[padding] duration-[var(--transition-duration)];

   &--fluid {
      @apply flex-col justify-center;
   }
   &:not(&--fluid) {
      @apply flex-row items-center;
   }

   &__header {
      @apply flex items-center gap-4 font-medium;
      &--fluid {
         @apply w-full;
      }
      &--reverse {
         @apply order-[1];
      }

      &-label {
         @apply flex-1 first-letter:uppercase;
      }
   }

   &__input {
      @apply min-w-48 md:min-w-fit;
      &--fluid {
         @apply w-full my-auto;
      }
      &--reverse {
         @apply flex-auto;
      }
   }

   &__error {
      @apply absolute bottom-0 left-2 max-w-full capitalize animate-fadeinup animate-duration-[calc(var(--transition-duration)*2)] animate-ease-in-out animate-once;
   }

   &__skeleton {
      @apply absolute rounded-[inherit] !h-[unset] !w-[unset] !min-w-32 !z-10 !left-0 !top-0 !right-0 !bottom-0 opacity-50;
   }
}
</style>
