<script setup>
const { layoutState } = useLayout();
const { currentTenant } = storeToRefs(useAuthStore());

const containerClass = computed(() => {
   return {
      [`layout-${layoutState.sidebarMode}`]: layoutState.sidebarMode,
      'layout-sidebar-inactive': !layoutState.sidebarActive
   };
});
</script>

<template>
   <div class="layout-wrapper" :class="containerClass">
      <RouterView v-slot="{ Component }" name="layout-topbar">
         <Transition
            appear
            enter-active-class="animate-fadeinup animate-fill-forwards animate-ease-out animate-duration-[var(--transition-duration)]"
            leave-active-class="animate-fadeoutup animate-fill-forwards animate-ease-in animate-duration-[var(--transition-duration)]"
            mode="out-in"
         >
            <header v-if="Component" class="layout-topbar" :key="currentTenant?.display_name">
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
               enter-active-class="animate-fadeinleft animate-fill-forwards animate-ease-out animate-duration-[var(--transition-duration)]"
               leave-active-class="animate-fadeoutleft animate-fill-forwards animate-ease-in animate-duration-[var(--transition-duration)]"
               mode="out-in"
            >
               <aside v-if="Component" class="layout-sidebar" :key="currentTenant?.display_name">
                  <span class="empty:hidden p-4" id="sidebar-start" />
                  <Suspense>
                     <component :is="Component" />
                  </Suspense>
               </aside>
            </Transition>
         </RouterView>
         <main class="layout-main">
            <RouterView v-slot="{ Component }" name="page-header">
               <div
                  v-if="Component"
                  :key="currentTenant?.display_name"
                  class="card p-4 mb-4 flex flex-wrap justify-center lg:justify-between gap-2 sticky top-0 shadow-md z-10"
               >
                  <Suspense>
                     <component :is="Component" />
                  </Suspense>
                  <span class="ms-auto my-auto" id="page-toolbar" />
               </div>
            </RouterView>

            <CustomRouteView :key="currentTenant?.display_name" />

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
            enter-active-class="animate-fadeindown animate-fill-forwards animate-ease-out animate-duration-[var(--transition-duration)]"
            leave-active-class="animate-fadeoutdown animate-fill-forwards animate-ease-in animate-duration-[var(--transition-duration)]"
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
