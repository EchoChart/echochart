<script setup>
const { layoutState, routes, breakpoints, resetSidebar } = useLayout();

const mobileSidebarListener = _debounce(() => {
   if (breakpoints.isSmaller('sm')) {
      if (layoutState.sidebarMode !== 'overlay') {
         layoutState.sidebarModeDesktop = layoutState.sidebarMode;
         layoutState.sidebarMode = 'overlay';
      }
      return;
   }
   if (!breakpoints.current().value.includes('sm')) {
      return;
   }
   if (layoutState.sidebarModeDesktop) {
      layoutState.sidebarMode = layoutState.sidebarModeDesktop;
   }
}, 250);

const outsideClickListener = ref(null);

function bindOutsideClickListener() {
   if (!outsideClickListener.value) {
      outsideClickListener.value = (event) => {
         if (isOutsideClicked(event)) {
            resetSidebar();
         }
      };
      document.addEventListener('click', outsideClickListener.value);
   }
}

function unbindOutsideClickListener() {
   if (outsideClickListener.value) {
      document.removeEventListener('click', outsideClickListener.value);
      outsideClickListener.value = null;
   }
}

function isOutsideClicked(event) {
   const sidebarEl = document.querySelector('.layout-sidebar');
   const topbarEl = document.querySelector('.layout-sidebar-button');

   return !(
      sidebarEl?.isSameNode(event.target) ||
      sidebarEl?.contains(event.target) ||
      topbarEl?.isSameNode(event.target) ||
      topbarEl?.contains(event.target)
   );
}

useResizeObserver(document.body, mobileSidebarListener);

watch(
   () => [layoutState.sidebarActive, layoutState.sidebarMode],
   ([sidebarActive, sidebarMode]) => {
      if (sidebarActive && sidebarMode === 'overlay') {
         bindOutsideClickListener();
      } else {
         unbindOutsideClickListener();
      }
   },
   { immediate: true }
);

onUnmounted(() => {
   unbindOutsideClickListener();
});
</script>

<template>
   <PanelMenu
      class="layout-menu"
      v-model:expandedKeys="layoutState.activeMenuItem"
      :model="routes"
      multiple
   >
      <template #item="{ item, active, hasSubmenu }">
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
               class="p-panelmenu-header-link flex items-center !gap-4 !p-4"
               :title="$t(item.label)"
            >
               <span
                  v-if="item.icon"
                  class="p-panelmenu-header-icon !text-xl !text-inherit"
                  :class="item.icon"
               />
               <span
                  class="p-panelmenu-header-label flex-1 !truncate"
                  v-if="item.label"
                  v-text="$t(item.label)"
               />
            </CustomLink>
            <div
               v-ripple
               v-else
               class="p-panelmenu-header-link flex items-center !gap-4 !p-4"
               :title="$t(item.label)"
               @click.prevent
            >
               <span
                  v-if="item.icon"
                  class="p-panelmenu-header-icon !text-xl !text-inherit"
                  :class="item.icon"
               />
               <span
                  class="p-panelmenu-header-label flex-1 !truncate"
                  v-if="item.label"
                  v-text="$t(item.label)"
               />
               <span
                  :class="[
                     {
                        'rotate-90': active
                     },
                     PrimeIcons.ANGLE_RIGHT
                  ]"
                  class="!text-inherit transition-transform duration-300"
               />
            </div>
         </span>
      </template>
   </PanelMenu>
</template>
