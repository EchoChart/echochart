<script setup>
import Collection from '@/lib/Collection';
import CorrelatedAuditLogs from './CorrelatedAuditLogs.vue';

defineOptions({
   inheritAttrs: false
});

const attrs = useAttrs();

// Define the columns
const columns = new Collection([
   { field: 'table_name', header: i18n.t('resource'), sortable: true, showFilterMenu: false },
   {
      field: 'operation',
      header: i18n.t('operation'),
      sortable: true,
      showFilterMatchModes: false,
      showFilterOperator: false,
      showAddButton: false
   },
   { field: 'done_by', header: i18n.t('done_by') },
   { field: 'created_at', header: i18n.t('created_at'), sortable: true, sortOrder: { value: -1 } },
   { field: 'reverted_by', header: i18n.t('reverted_by') },
   { field: 'reverted_at', header: i18n.t('reverted_at'), sortable: true }
]);

// Define the filters object
const filters = ref({
   global: {
      value: null,
      matchMode: FilterMatchMode.CONTAINS
   },
   table_name: {
      operator: FilterOperator.AND,
      constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }]
   },
   operation: {
      operator: FilterOperator.AND,
      constraints: [{ value: null, matchMode: FilterMatchMode.IN }]
   },
   reverted_at: {
      operator: FilterOperator.AND,
      constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }],
      dataType: 'date'
   },
   created_at: {
      operator: FilterOperator.AND,
      constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }],
      dataType: 'date'
   },
   ...attrs.filters
});

const stateKey = 'audit_log';
const rowActions = new Collection([
   {
      label: ({ data }) =>
         data.reverted ? i18n.t('already_reverted') : i18n.t('attempt_to_revert'),
      command:
         ({ data }) =>
         async () =>
            await supabase
               .rpc('revert_audit_log', { target_correlation_id: data.correlation_id || data.id })
               .throwOnError()
               .then(() => emitter.emit('audit_log-update')),
      disabled: ({ data }) => data.reverted,
      icon: PrimeIcons.REFRESH
   }
]);

const operations = [
   { value: 'INSERT', label: i18n.t('added'), severity: 'success' },
   { value: 'UPDATE', label: i18n.t('updated'), severity: 'info' },
   { value: 'DELETE', label: i18n.t('deleted'), severity: 'danger' }
];

const getOperationTag = (body) => {
   const tag = _clone(_find(operations, (o) => o.value === _get(body, 'data.operation')));
   if (tag) {
      tag.value = tag?.label;
      return tag;
   }
};

const dialogRef = inject('dialogRef', null);

const tableProps = computed(() => ({
   stateKey,
   from: 'audit_log_group',
   select: '*, done_by:user!user_id(*), reverted_by:user!reverted_by(*)',
   columns: columns._data,
   rowActions: rowActions._data,
   ...attrs
}));
</script>
<template>
   <ResourceTable v-bind="tableProps" v-model:filters="filters" :mapClass="Collection">
      <template #header>
         <Teleport to="#page-toolbar" :disabled="dialogRef">
            <span class="flex-1 flex justify-end gap-4 flex-wrap-reverse">
               <KeywordSearchInput v-model="filters.global.value" />
            </span>
         </Teleport>
      </template>
      <template #operation_body="{ data }">
         <Tag v-if="data" v-bind="getOperationTag({ data })" />
      </template>
      <template #operation_filter="{ filterModel }">
         <SelectAuditOperation v-model="filterModel.value" multiple />
      </template>
      <template #expansion="{ data }">
         <CorrelatedAuditLogs v-if="data" :id="data.correlation_id" />
      </template>
      <template #done_by_body="{ data, field }">
         {{ _get(data, `${field}.display_name`) || _get(data, `${field}.email`) }}
      </template>
      <template #reverted_by_body="{ data, field }">
         {{ _get(data, `${field}.display_name`) || _get(data, `${field}.email`) }}
      </template>
   </ResourceTable>
</template>
