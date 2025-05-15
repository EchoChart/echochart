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

watch(
   () => errorTextElement.value,
   (e) => console.log(e)
);

const errorElStyle = useElementSize(errorMessageElement);

const id = attrs.id || useId() || _kebabCase(attrs.label);

const containerClass = computed(() => [
   attrs.class,
   'form_field flex gap-4',
   _has(attrs, 'fluid') ? 'flex-col justify-center' : 'flex-row items-center',
   'p-2 relative',
   'transition-[padding] duration-[var(--transition-duration)]'
]);

const containerStyle = computed(() => ({
   paddingBottom:
      (!!errorElStyle.height?.value && `calc(${_round(errorElStyle.height?.value)}px + 1rem)`) || ''
}));

const headerClass = computed(() => [
   props.reverse && 'order-[1]',
   _has(attrs, 'fluid') ? 'w-full' : 'my-auto',
   'font-medium'
]);

const inputClass = computed(() => [
   _has(attrs, 'fluid') ? 'w-full my-auto' : 'flex-auto',
   'min-w-48'
]);

const errorClass = computed(() => [
   'absolute bottom-0 left-0 max-w-full',
   'capitalize p-message-error',
   'animate animate-fadeindown animate-duration-[calc(var(--transition-duration)*2)] animate-ease-in-out animate-once'
]);

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
         <div class="flex items-center justify-start gap-4" :class="headerClass">
            <slot name="label" :for="id" :id="`label-${id}`" :title="_startCase(attrs.label)">
               <label
                  v-if="!!attrs.label"
                  :for="id"
                  :id="`label-${id}`"
                  v-text="_startCase(attrs.label)"
                  :title="_startCase(attrs.label)"
                  class="flex-1"
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
            :class="errorClass"
            :pt="{
               content: { class: '!py-0' },
               text: { class: 'whitespace-pre-line line-clamp-2', ref: errorTextElement }
            }"
            v-tooltip.bottom="{
               value: error,
               pt: {
                  root: {
                     class: 'backdrop-blur-lg'
                  },
                  text: '!bg-red-400 !bg-opacity-20 !border-red-400 border !text-current '
               }
            }"
         >
            {{ error }}
         </Message>
      </slot>
      <Skeleton
         v-if="isLoading"
         class="!absolute rounded-[inherit] !h-[unset] !w-[unset] !z-10 !left-0 !top-0 !right-0 !bottom-0 opacity-50"
      />
   </div>
</template>

<style>
.p-password-fluid {
   width: 100%;
}
</style>
