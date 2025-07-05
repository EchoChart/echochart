<script setup>
const route = useRoute();

const home = ref({
   meta: { icon: PrimeIcons.HOME },
   path: '/'
});
const breadcrumbItems = computed(() =>
   route.matched
      .filter(({ name, path }) => !_isNil(name) && !_isNil(path))
      .map((route, index) => {
         const label = i18n.t(route.meta.label);
         return {
            ...route,
            index,
            label
         };
      })
);
</script>

<template>
   <Breadcrumb :home="home" :model="breadcrumbItems">
      <template #separator> / </template>
      <template #item="{ item, props }">
         <CustomLink
            :to="breadcrumbItems.length - 1 == item.index ? $route : item"
            v-bind="props.action"
            class="breadcrumb__link"
            v-slot="{ navigate, isExactActive }"
         >
            <button
               @click="navigate"
               class="breadcrumb__container"
               :class="{
                  'breadcrumb__link--active': isExactActive
               }"
            >
               <span v-bind="props.icon" v-if="item.meta?.icon" :class="[item.meta?.icon]" />
               <span
                  class="breadcrumb__label"
                  :class="{
                     'breadcrumb__label--hidden': $route.name !== item.name
                  }"
                  v-bind="props.label"
                  v-if="item.label"
                  v-text="item.label"
               />
            </button>
         </CustomLink>
      </template>
   </Breadcrumb>
</template>

<style lang="scss">
.breadcrumb {
   &__container {
      @apply flex items-center gap-2;
   }

   &__link {
      @apply text-sm;
   }

   &__link--active {
      @apply text-primary text-xl !important;
   }

   &__label {
      @apply font-semibold lg:block first-letter:uppercase !important;

      &--hidden {
         @apply hidden;
      }
   }
}
</style>
