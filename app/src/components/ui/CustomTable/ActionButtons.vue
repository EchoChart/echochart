<script setup>
defineProps({
   items: {
      type: Array,
      required: false
   }
});

const { breakpoints } = useLayout();

const getSeverity = (item) => {
   switch (item?.icon) {
      case PrimeIcons.TRASH:
         return 'danger';
      case PrimeIcons.PENCIL:
         return 'info';
   }
};
</script>

<template>
   <div class="flex gap-2 items-center min-w-fit">
      <Button
         v-for="(item, index) in items"
         :key="'actionButton' + index"
         size="small"
         @click="item.command"
         v-tooltip="item.label"
         :severity="getSeverity(item)"
         v-bind="item"
         label=""
      />
   </div>
</template>
