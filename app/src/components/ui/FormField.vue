<script setup>
defineOptions({
   inheritAttrs: false
});

const props = defineProps({
   loading: {
      type: Boolean,
      default: null
   },
   reverse: {
      type: Boolean,
      default: false
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

const errorElement = ref(null);

const { height: errorHeight } = useElementSize(errorElement);

const id = attrs.id || useId() || _kebabCase(attrs.label);

const containerClass = computed(() => [
   attrs.class,
   'flex-1 flex flex-wrap gap-2 items-center',
   'mb-auto p-2 relative',
   'transition-[padding] duration-[var(--transition-duration)]'
]);

const containerStyle = computed(() => ({
   paddingBottom: `${_round(errorHeight?.value + 5)}px`
}));

const labelClass = computed(() => [
   props.reverse && 'order-[1]',
   'flex-auto',
   'my-auto',
   'truncate text-surface-900 dark:text-surface-0 font-medium'
]);

const inputClass = computed(() => [
   _has(attrs, 'fluid') ? '!w-full flex-auto' : 'flex-0',
   'min-w-48'
]);

const errorClass = computed(() => [
   'absolute',
   'left-0 bottom-0 mx-2',
   'capitalize text-red-300',
   'animate animate-fadein animate-duration-[var(--transition-duration)] animate-ease-in-out animate-once'
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
      <slot name="label">
         <label
            v-if="!!attrs.label"
            :for="id"
            :id="`label-${id}`"
            :class="labelClass"
            v-text="_startCase(attrs.label)"
            :title="_startCase(attrs.label)"
         />
      </slot>

      <slot
         :disabled="isLoading"
         :id="id"
         :inputId="id"
         :invalid="!!attrs.error"
         v-bind="_omit(attrs, ['class'])"
         :class="inputClass"
         :aria-labelledby="(!!attrs.label && `label-${id}`) || undefined"
         :aria-errormessage="`${id}-errormessage`"
      />

      <slot name="error">
         <Message
            size="small"
            :id="`${id}-errormessage`"
            ref="errorElement"
            v-if="!!attrs.error"
            variant="simple"
            :title="_startCase(attrs.error)"
            severity="danger"
            :class="errorClass"
         >
            {{ attrs.error }}
         </Message>

         <Skeleton
            v-if="isLoading"
            class="!absolute rounded-[inherit] !h-[unset] !w-[unset] !z-10 !left-0 !top-0 !right-0 !bottom-0 opacity-50"
         />
      </slot>
   </div>
</template>

<style>
.p-password-fluid {
   width: 100%;
}
</style>
