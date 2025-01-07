<script setup>
const columnSlots = [
   'node',
   'header',
   'footer',
   'editor',
   'filter',
   'filterheader',
   'filterfooter',
   'filterclear',
   'filterapply',
   'loading',
   'rowtoggleicon',
   'roweditoriniticon',
   'roweditorsaveicon',
   'roweditorcancelicon',
   'filtericon',
   'filterclearicon',
   'filterremoveicon',
   'filteraddicon',
   'sorticon',
   'headercheckboxicon',
   'rowreordericon',
   'nodetoggleicon'
];

const props = defineProps({
   columns: {
      type: Array,
      default: () => []
   },
   rowActions: {
      type: Array,
      default: () => []
   }
});

const actions = computed(() => {
   return [...props.rowActions];
});
</script>
<template>
   <DataTable>
      <Column v-bind="column" v-for="(column, i) in props.columns" :key="'column_' + i">
         <template #body="body">
            <slot :name="`${snakeCase(body.field)}_body`" v-bind="body">
               <span v-text="get(body.data, body.field)" />
            </slot>
         </template>
         <template v-for="slot in keys(columnSlots)" #[slot]>
            <slot :name="`${snakeCase(body.field)}_${slot}`" />
         </template>
      </Column>
      <Column v-if="actions?.length > 0" alignFrozen="right" :frozen="true">
         <template #body="body">
            <slot name="table_actions">
               <SpeedDial
                  :transitionDelay="40"
                  direction="left"
                  class="!relative justify-self-start"
                  :pt:list="
                     (item) => ({
                        class: [
                           `absolute right-[125%] !px-4 rounded`,
                           { 'backdrop-blur-[2px]': item?.state?.d_visible }
                        ]
                     })
                  "
                  :buttonProps="{ severity: 'secondary' }"
                  :tooltipOptions="{ position: 'top' }"
                  :model="
                     actions?.map((item) => ({
                        ...item,
                        command: item?.command?.bind?.(undefined, body)
                     }))
                  "
               />
            </slot>
         </template>
      </Column>

      <template v-for="slot in keys($slots)" #[slot]>
         <slot :name="slot" />
      </template>
   </DataTable>
</template>
