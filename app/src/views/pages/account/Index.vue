<script setup>
const route = useRoute();
const router = useRouter();
watchEffect(() => {
   if (!route?.query?.showDialog && route.name == 'account') {
      router.replace({ name: 'account-profile' });
   }
});

const { routes } = useLayout();
const menuRoute = computed(() => routes.value.find((item) => item.route?.name == 'account'));
</script>
<template>
   <div class="card flex flex-col gap-4">
      <RouteMenuBar v-if="menuRoute" :route="menuRoute" />
      <CustomRouteView class="flex-1" />
   </div>
</template>
