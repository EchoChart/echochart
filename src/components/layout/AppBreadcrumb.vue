<script setup>
const route = useRoute();

const home = ref({
    meta: { icon: PrimeIcons.HOME },
    path: '/'
});
const breadcrumbItems = computed(() =>
    route.matched
        .filter(({ name, path }) => !_isNil(name) && !_isNil(path))
        .map((route) => {
            const label = route.path.match(/\/([a-zA-Z0-9_-]+)$/)?.[1] || route.name;
            return {
                ...route,
                label: i18n.t(label)
            };
        })
);
</script>

<template>
    <Breadcrumb :home="home" :model="breadcrumbItems">
        <template #item="{ item, props }">
            <CustomLink
                :to="item"
                v-bind="props.action"
                class="text-sm"
                :class="{
                    '!text-primary text-xl': $route.name === item.name
                }"
            >
                <span v-bind="props.icon" v-if="item.meta?.icon" :class="[item.meta?.icon]" />
                <span
                    class="font-semibold lg:block"
                    :class="{
                        hidden: $route.name !== item.name
                    }"
                    v-bind="props.label"
                    v-if="item.label"
                    v-text="item.label"
                />
            </CustomLink>
        </template>
    </Breadcrumb>
</template>
