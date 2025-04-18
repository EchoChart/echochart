<script setup>
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
      const pairs = Object.entries(item);
      const transformedPairs = pairs.map(([key, value]) => [
         key,
         typeof value === 'function' ? value(props.body) : value
      ]);
      return Object.fromEntries(transformedPairs);
   });
});
</script>

<template>
   <div class="flex gap-2 items-center min-w-fit">
      <Button
         v-for="(item, index) in buttons"
         :key="_uniqueId('actionButton' + index)"
         size="small"
         @click="item.command"
         v-tooltip="item.label"
         :severity="getSeverity(item)"
         v-bind="item"
         label=""
      />
   </div>
</template>
