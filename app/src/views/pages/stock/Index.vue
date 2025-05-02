<script setup>
const { routes } = useLayout();
const menuRoute = computed(() => routes.value.find((item) => item.route?.name == 'stock'));
const dialogRef = inject('dialogRef', false);
</script>
<template>
   <div class="card p-0 flex flex-col gap-4">
      <RouteMenuBar v-if="dialogRef" :route="menuRoute" />
      <CustomRouteView class="flex-1" />
   </div>
</template>
