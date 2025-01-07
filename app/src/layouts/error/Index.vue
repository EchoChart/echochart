<script setup></script>

<template>
   <div class="layout-wrapper">
      <FloatingConfigurator />
      <div class="flex-1 flex bg-surface-50 dark:bg-surface-950">
         <Suspense>
            <router-view />
         </Suspense>
      </div>
   </div>
</template>
