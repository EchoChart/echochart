<script setup>
const props = defineProps({
    transitionProps: {
        type: Object,
        default: () => ({})
    },
    suspensible: { type: Boolean, default: false }
});

const dialogRef = inject('dialogRef', null);

const isResolved = ref(false);
const isPending = ref(false);
const isFallback = ref(false);

provide('routeResolved', isResolved);
provide('routePending', isPending);
provide('routeFallback', isFallback);

const routeComponent = ref(null);

const onFallback = () => {
    isFallback.value = true;
    isResolved.value = false;
};
const onPending = () => {
    isPending.value = true;
    isResolved.value = false;
};
const onResolve = () => {
    isResolved.value = true;
    isFallback.value = false;
    isPending.value = false;
};
</script>

<template>
    <RouterView v-bind="$attrs" v-slot="{ Component }">
        <template v-if="Component && !dialogRef">
            <slot />
            <Transition
                enter-active-class="animate-fadein animate-duration-[calc(var(--transition-duration) * 0.5]"
                leave-active-class="animate-fadeout animate-duration-[calc(var(--transition-duration) * 0.5]"
                mode="out-in"
                v-bind="props.transitionProps"
            >
                <span
                    :class="{ contents: isPending || isFallback }"
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
        <template v-if="(isPending || isFallback) && !isResolved">
            <component v-if="Component" :is="Component" />
            <Skeleton
                v-else
                class="min-w-full min-h-full duration-[calc(var(--transition-duration)*0.5]"
            />
        </template>
    </RouterView>
</template>
