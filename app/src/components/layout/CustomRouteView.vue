<script setup>
defineOptions({
   inheritAttrs: false
});
const props = defineProps({
   transitionProps: {
      type: Object,
      default: () => ({})
   },
   suspensible: { type: Boolean, default: false }
});

const dialogRef = inject('dialogRef', null);

const route = useRoute();

const isResolved = ref(true);
const isPending = ref(false);
const isFallback = ref(false);
const isLoading = computed(() => isPending.value || isFallback.value);

provide('routeResolved', isResolved);
provide('routePending', isPending);
provide('routeFallback', isFallback);
provide('routeLoading', isLoading);

const routeComponent = ref(null);

const updateRouteStatus = (status) => {
   switch (status) {
      case 'resolve':
         isResolved.value = true;
         isFallback.value = false;
         isPending.value = false;
         break;
      case 'fallback':
         isFallback.value = true;
         isResolved.value = false;
         isPending.value = false;
         break;
      case 'pending':
         isPending.value = true;
         isResolved.value = false;
         isFallback.value = false;
         break;
      default:
         break;
   }
};

watch(
   () => route?.fullPath,
   () => updateRouteStatus('resolve')
);

const onResolve = () => updateRouteStatus('resolve');
const onFallback = () => updateRouteStatus('fallback');
const onPending = () => updateRouteStatus('pending');
</script>

<template>
   <span class="route_view__contents">
      <RouterView v-bind="$attrs" v-slot="{ Component }">
         <template v-if="Component && !dialogRef">
            <slot />
            <Transition
               enter-active-class="route_view__transition--enter"
               leave-active-class="route_view__transition--leave"
               mode="out-in"
               v-bind="props.transitionProps"
            >
               <span
                  :class="{ route_view__contents: isPending || isFallback }"
                  :key="Component?.name || Component?.type"
               >
                  <Suspense
                     :suspensible="props.suspensible"
                     @fallback="onFallback"
                     @pending="onPending"
                     @resolve="onResolve"
                  >
                     <component :is="Component" ref="routeComponent" />
                  </Suspense>
               </span>
            </Transition>
         </template>
      </RouterView>
      <RouterView
         name="skeleton"
         v-slot="{ Component }"
         :key="routeComponent?.name || routeComponent?.type"
      >
         <template v-if="isLoading">
            <component v-if="Component" :is="Component" />
            <Skeleton v-else class="route_view__skeleton" />
         </template>
      </RouterView>
   </span>
</template>

<style lang="scss">
.route_view {
   &__contents {
      @apply contents;
   }

   &__transition--enter {
      @apply animate-fadein animate-duration-[calc(var(--transition-duration)*0.75)];
   }

   &__transition--leave {
      @apply animate-fadeout animate-duration-[calc(var(--transition-duration)*0.75)];
   }

   &__skeleton {
      @apply min-w-full min-h-[25%] duration-[calc(var(--transition-duration)*0.75)];
   }
}
</style>
