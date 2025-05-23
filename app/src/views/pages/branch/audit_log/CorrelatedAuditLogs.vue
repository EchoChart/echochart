<script setup>
import ResourceDataView from '@/components/service-components/resource-data-view/ResourceDataView.vue';
import { DataView } from 'primevue';

/**
 * @typedef {Views['audit_log_group']['Row']} Data
 * @type {{ id: Data['correlation_id'], data: Data[] }} */
const props = defineProps({
   id: {
      type: String,
      default: null
   },
   data: {
      type: Array,
      default: null
   }
});

const meta = {
   filters: {
      correlation_id: {
         operator: FilterOperator.AND,
         constraints: [{ value: props.id, matchMode: FilterMatchMode.EQUALS }]
      }
   },
   rows: 5,
   multiSortMeta: [{ field: 'id', order: 1 }]
};
</script>

<template>
   <component
      :is="data ? DataView : ResourceDataView"
      :model-value="data ? data : undefined"
      :from="data ? undefined : 'audit_log'"
      :paginator="true"
      paginatorPosition="top"
      :meta
   >
      <template #grid="slotProps">
         <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 overflow-auto">
            <template v-for="(data, index) in slotProps.items" :key="'grid_log_' + data.id + index">
               <LogChangesCard :data />
            </template>
         </div>
      </template>
      <template #list="slotProps">
         <div class="grid grid-cols-1 gap-2">
            <template v-for="(data, index) in slotProps.items" :key="'log_' + data.id + index">
               <LogChangesCard :data />
            </template>
         </div>
      </template>
   </component>
</template>
