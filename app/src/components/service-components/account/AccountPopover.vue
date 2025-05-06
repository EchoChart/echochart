<script setup>
const accountMenu = ref();

const authStore = useAuthStore();
const { changeCurrentTenant } = authStore;
const { user, branches, currentTenant } = storeToRefs(authStore);

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
               <AvatarPlaceholder
                  :alt="user?.user_metadata?.display_name"
                  class="!w-24 aspect-square rounded-[var(--content-border-radius)] overflow-hidden"
                  :src="user?.user_metadata?.avatar_url"
                  :placeholder="user.user_metadata?.display_name || user?.email"
               />
               <p
                  v-if="user.user_metadata?.display_name"
                  v-text="user.user_metadata?.display_name"
               />
               <p v-if="user.email" v-text="user.email" class="text-sm" />
            </div>
            <span class="empty:hidden p-4" id="sidebar-end">
               <Select
                  v-if="branches?.length > 0"
                  fluid=""
                  size="small"
                  :label="$t('branch')"
                  :model-value="currentTenant._data"
                  @change="(e) => changeCurrentTenant(e.value)"
                  optionLabel="display_name"
                  :options="branches._data"
               />
            </span>
         </template>

         <template #item="{ item, props, hasSubmenu }">
            <span
               :class="{
                  '!text-primary-emphasis hover:!text-current': $route.matched.some(
                     ({ name }) => name === item.route.name
                  )
               }"
            >
               <CustomLink v-if="!hasSubmenu" :to="item.route" v-slot="{ navigate }">
                  <button @click="navigate" v-bind="props.action">
                     <span class="p-tieredmenu-item-icon !text-inherit" :class="item.icon" />
                     <span class="ml-2" v-text="item.label" />
                  </button>
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
