<script setup>
/**@type{{items:import('primevue/menuitem').MenuItem[]}}} */
const props = defineProps({
   body: Object,
   items: {
      type: Array,
      required: false
   }
});

const getSeverity = (item) => {
   switch (item?.icon) {
      case PrimeIcons.TRASH:
         return 'danger';
      case PrimeIcons.PENCIL:
         return 'info';
   }
};

const buttons = computed(() => {
   return props.items.map((item) => {
      const pairs = _toPairs(item);
      const transformedPairs = pairs.map(([key, value]) => [
         key,
         typeof value === 'function' ? value(props.body) : value
      ]);
      return _fromPairs(transformedPairs);
   });
});
</script>

<template>
   <div class="custom-table__action-buttons">
      <Button
         v-for="(item, index) in buttons"
         :key="_uniqueId('actionButton' + index)"
         size="small"
         @click="item.command"
         v-tooltip.left="item.label"
         :severity="getSeverity(item)"
         v-bind="item"
         label=""
      />
   </div>
</template>

<style lang="scss">
.custom-table {
   &__action-buttons {
      @apply flex gap-2 items-center min-w-fit;
   }
}
</style>
