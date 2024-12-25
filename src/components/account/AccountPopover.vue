<script setup>
const { user } = storeToRefs(useAuthStore());
const accountMenu = ref();

const { routes } = useLayout();
const accountMenuItems = computed(() => {
    return routes.value.find((item) => item.route?.name == 'account')?.items;
});
</script>
<template>
    <slot v-if="user" name="button" :toggleFn="accountMenu?.toggle">
        <Button
            type="button"
            title="Account"
            :icon="PrimeIcons.USER"
            rounded
            text
            :label="$attrs.label"
            severity="secondary"
            @click="accountMenu?.toggle"
            aria-haspopup="true"
            aria-controls="account_menu"
        />
    </slot>
    <Popover append-to="#app" ref="accountMenu">
        <TieredMenu id="account_menu" class="!border-0" :model="accountMenuItems">
            <template #start>
                <div v-if="user" class="flex m-4 gap-4 flex-col items-center">
                    <Chip :label="user.display_name" :image="user.avatarUrl" />
                    <small>{{ user.email }}</small>
                </div>
            </template>

            <template #item="{ item, props, hasSubmenu }">
                <span
                    :class="{
                        '!text-primary-emphasis hover:!text-current': $route.matched.some(
                            ({ name }) => name === item.route.name
                        )
                    }"
                >
                    <CustomLink
                        v-if="!hasSubmenu"
                        :to="item.route"
                        v-bind="props.action"
                        class="p-tieredmenu-item-link"
                    >
                        <span class="p-tieredmenu-item-icon !text-inherit" :class="item.icon" />
                        <span class="ml-2" v-text="item.label" />
                    </CustomLink>
                    <div v-bind="props.action" v-else>
                        <span :class="item.icon" />
                        <label class="ml-2" v-text="item.label" />
                        <span v-if="hasSubmenu" :class="PrimeIcons.ANGLE_RIGHT" class="ml-auto" />
                    </div>
                </span>
            </template>
        </TieredMenu>
    </Popover>
</template>
