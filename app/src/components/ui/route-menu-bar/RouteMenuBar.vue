<script setup>
const props = defineProps({
   route: {
      type: Object,
      required: true
   }
});

const mounted = useMounted();
const dialogRef = inject('dialogRef', null);
const tabs = computed(() => props.route?.items);
</script>

<template>
   <Teleport v-if="mounted" to="#page-toolbar" defer :disabled="dialogRef">
      <MenuBar v-if="mounted" :model="tabs" :breakpoint="'0px'">
         <template #item="{ item, props, hasSubmenu }">
            <span
               :class="{
                  route_menu_bar__item:
                     !dialogRef && $route.matched.some(({ name }) => name === item.route?.name)
               }"
            >
               <CustomLink v-if="!hasSubmenu" :to="item.route" v-slot="{ navigate }">
                  <span class="route_menu_bar__link p-menubar-item-link" @click="navigate">
                     <span class="route_menu_bar__icon p-menubar-item-icon" :class="item.icon" />
                     <span
                        class="route_menu_bar__label p-menubar-item-label"
                        v-text="$t(item.label)"
                     />
                  </span>
               </CustomLink>
               <div v-else v-ripple v-bind="props.action">
                  <span :class="item.icon" />
                  <span v-text="$t(item.label)" />
                  <span
                     v-if="hasSubmenu"
                     class="route_menu_bar__submenu-indicator pi pi-fw pi-angle-down"
                  />
               </div>
            </span>
         </template>
      </MenuBar>
   </Teleport>
</template>

<style lang="scss">
.route_menu_bar {
   &__item {
      @apply text-primary-emphasis hover:text-current;
   }

   &__icon {
      @apply text-inherit !important;
   }
}
</style>
