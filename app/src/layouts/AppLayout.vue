<script setup>
import DefaultLayout from '@/layouts/dashboard/Index.vue';
const layout = shallowRef();
const route = useRoute();
watch(
   computed(() => route.meta?.layout),
   async (newLayout) => {
      try {
         const layoutComponent = newLayout && (await import(`@/layouts/${newLayout}/Index.vue`));

         if (route?.meta?.layout === newLayout)
            layout.value = markRaw(layoutComponent?.default || DefaultLayout);
      } catch (error) {
         layout.value = markRaw(DefaultLayout);
      }
   },
   { immediate: true }
);
</script>

<template>
   <component :is="layout">
      <router-view />
   </component>
</template>
