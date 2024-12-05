<script setup>
const { routes, breakpoints } = useLayout();
const tabs = computed(() => routes.value.find((item) => item.route?.name == 'account')?.items);

const dialogRef = inject('dialogRef', null);
const mounted = useMounted();
</script>
<template>
    <div class="card flex flex-col gap-4">
        <Teleport v-if="mounted" to="#page-toolbar" defer :disabled="!breakpoints.lg || dialogRef">
            <MenuBar v-if="mounted" :model="tabs" :breakpoint="'0px'">
                <template #item="{ item, props, hasSubmenu }">
                    <span
                        :class="{
                            '!text-primary-emphasis hover:!text-current': $route.matched.some(
                                ({ name }) => name === item.route?.name
                            )
                        }"
                    >
                        <CustomLink v-if="!hasSubmenu" :to="item.route" class="p-menubar-item-link">
                            <span class="p-menubar-item-icon !text-inherit" :class="item.icon" />
                            <span class="p-menubar-item-label" v-text="$t(item.label)" />
                        </CustomLink>
                        <div v-else v-ripple v-bind="props.action">
                            <span :class="item.icon" />
                            <span v-text="$t(item.label)" />
                            <span v-if="hasSubmenu" class="pi pi-fw pi-angle-down" />
                        </div>
                    </span>
                </template>
            </MenuBar>
        </Teleport>
        <RouteViewAnimated class="flex-1" />
    </div>
</template>
