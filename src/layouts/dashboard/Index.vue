<script setup>
const { layoutState } = useLayout();

const containerClass = computed(() => {
    return {
        [`layout-${layoutState.sidebarMode}`]: layoutState.sidebarMode,
        'layout-sidebar-inactive': !layoutState.sidebarActive
    };
});

const { tenantId } = storeToRefs(useTenantStore());
</script>

<template>
    <div class="layout-wrapper" :class="containerClass">
        <RouterView v-slot="{ Component }" name="layout-topbar">
            <Transition
                appear
                enter-active-class="animate-fadeinup animate-duration-[calc(var(--transition-duration)*3)]"
                leave-active-class="animate-fadeoutup animate-duration-[calc(var(--transition-duration)*3)]"
                mode="out-in"
            >
                <header v-if="Component" class="layout-topbar">
                    <Suspense>
                        <component :is="Component" />
                    </Suspense>
                </header>
            </Transition>
        </RouterView>
        <div class="layout-main-container">
            <RouterView v-slot="{ Component }" name="layout-sidebar">
                <Transition
                    appear
                    enter-from-class="absolute translate-x-[-100%] duration-[calc(var(--transition-duration)*3)]"
                    enter-to-class="translate-x-[0] duration-[calc(var(--transition-duration)*3)]"
                    leave-from-class="translate-x-[0] duration-[calc(var(--transition-duration)*3)]"
                    leave-to-class="absolute translate-x-[-100%] duration-[calc(var(--transition-duration)*3)]"
                    mode="out-in"
                >
                    <span v-if="Component">
                        <aside class="layout-sidebar">
                            <span class="empty:hidden" id="sidebar-start" />
                            <Suspense>
                                <component :is="Component" />
                            </Suspense>
                            <span class="empty:hidden" id="sidebar-end">
                                <FormField
                                    fluid
                                    :label="$t('tenant')"
                                    v-slot="slotProps"
                                    class="m-4"
                                >
                                    <Select
                                        v-bind="slotProps"
                                        v-model="tenantId"
                                        optionLabel="display_name"
                                        optionValue="tenantId"
                                        :options="[]"
                                    />
                                </FormField>
                            </span>
                        </aside>
                        <div class="layout-mask animate-fadein" />
                    </span>
                </Transition>
            </RouterView>
            <main class="layout-main">
                <RouterView v-slot="{ Component }" name="page-header">
                    <div
                        v-if="Component"
                        class="card p-4 mb-4 flex flex-wrap justify-center lg:justify-between gap-8 sticky top-0 shadow-md z-10"
                    >
                        <Suspense>
                            <component :is="Component" />
                        </Suspense>
                        <span class="ms-auto my-auto" id="page-toolbar" />
                    </div>
                </RouterView>

                <RouteViewAnimated />

                <RouterView v-slot="{ Component }" name="page-footer">
                    <div v-if="Component" class="p-4">
                        <Suspense>
                            <component :is="Component" />
                        </Suspense>
                    </div>
                </RouterView>
            </main>
        </div>
        <RouterView v-slot="{ Component }" name="layout-footer">
            <Transition
                appear
                enter-active-class="animate-fadeindown animate-duration-[calc(var(--transition-duration)*3)]"
                leave-active-class="animate-fadeoutdown animate-duration-[calc(var(--transition-duration)*3)]"
                mode="out-in"
            >
                <footer v-if="Component" class="layout-footer">
                    <Suspense>
                        <component :is="Component" />
                    </Suspense>
                </footer>
            </Transition>
        </RouterView>
    </div>
</template>
