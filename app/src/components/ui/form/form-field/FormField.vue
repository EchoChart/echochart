<script setup>
defineOptions({
   inheritAttrs: false
});

const props = defineProps({
   loading: {
      type: Boolean,
      default: false
   },
   reverse: {
      type: Boolean,
      default: false
   },
   error: {
      type: [String, Boolean],
      default: null
   }
});
const routeLoading = inject('routeLoading', false);
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

const id = attrs.id || useId() || _kebabCase(attrs.label);

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
   props.reverse && 'form_field__header--reverse',
   _has(attrs, 'fluid') && 'form_field__header--fluid'
]);

const inputClass = computed(() => [
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
            v-if="!!attrs.label || $slots.label || $slots.actions || _size(error) >= 60"
            class="form_field__header"
            :class="headerClass"
         >
            <slot name="label" :for="id" :id="`label-${id}`" :title="_startCase(attrs.label)">
               <label
                  v-if="!!attrs.label"
                  :for="id"
                  :id="`label-${id}`"
                  v-text="_startCase(attrs.label)"
                  :title="_startCase(attrs.label)"
                  class="form_field__header__label"
                  :pt="{
                     text: { class: 'truncate' }
                  }"
               />
            </slot>

            <slot name="actions" />

            <ErrorBadge v-if="_size(error) >= 60" :error="error" />
         </div>
      </slot>

      <BlockUI
         :blocked="$attrs.readonly === true"
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
               :tabindex="$attrs.readonly ? -1 : $attrs.tabindex"
               v-bind="_omit(attrs, ['class'])"
               :class="inputClass"
               :aria-labelledby="(!!attrs.label && `label-${id}`) || undefined"
               :aria-errormessage="`${id}-errormessage`"
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
            v-if="!!error && _size(error) < 60"
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
      @apply absolute rounded-[inherit] !h-[unset] !w-[unset] !z-10 !left-0 !top-0 !right-0 !bottom-0 opacity-50;
   }
}
</style>
