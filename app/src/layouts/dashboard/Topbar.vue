<script setup>
const { isSignedIn } = storeToRefs(useAuthStore());
const appConfigurator = ref();
const { layoutState, sidebarToggle } = useLayout();

const version = import.meta.env.PACKAGE_VERSION;
</script>

<template>
   <Teleport
      to="#sidebar-start"
      defer
      :disabled="!(layoutState.sidebarActive && layoutState.sidebarMode === 'overlay')"
   >
      <div class="layout-topbar-logo-container">
         <Button
            type="button"
            class="layout-sidebar-button"
            rounded
            text
            aria-label="Sidebar toggle button"
            severity="secondary"
            :icon="PrimeIcons.BARS"
            @click="sidebarToggle"
            v-if="isSignedIn"
         />
         <router-link to="/" class="layout-topbar-logo">
            <span class="flex flex-col">
               <span class="font-mono text-primary text-3xl" v-text="'EchoChart'" />
               <small v-if="version" class="text-xs text-muted-color" v-text="`v${version}`" />
            </span>
         </router-link>
      </div>
   </Teleport>

   <div class="layout-topbar-actions">
      <AccountPopover v-if="isSignedIn" class="mt-auto" />
      <Button
         :aria-label="'App configurator toggle button'"
         :icon="PrimeIcons.PALETTE"
         @click="appConfigurator?.toggle"
         type="button"
         rounded
      />
      <Popover
         class="w-min"
         :pt="{
            content: {
               class: '!p-0'
            }
         }"
         ref="appConfigurator"
      >
         <AppConfigurator />
      </Popover>
   </div>
</template>
