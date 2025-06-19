<script setup lang="ts" generic="T extends Tables['record']['Row']">
import ResourceTable, {
   ResourceTableProps
} from '@/components/service-components/resource-table/ResourceTable.vue';
import Collection from '@/lib/Collection';
import Upsert from '@/views/pages/record/upsert/index.vue';
import { useI18n } from 'vue-i18n';

defineOptions({
   inheritAttrs: false
});

const attrs = useAttrs();
const router = useRouter();
const route = useRoute();

const { t } = useI18n();

const columns = computed<ResourceTableProps['columns']>(() => [
   {
      field: 'stock.display_name',
      sortable: true,
      header: t('record.table.headers.product')
   },
   {
      field: 'record_type',
      sortable: true,
      showFilterMenu: !route.params.record_type,
      header: t('record.table.headers.record_type')
   },
   {
      field: 'client.display_name',
      sortable: true,
      header: t('record.table.headers.client')
   },
   {
      field: 'quantity',
      sortable: true,
      header: t('record.table.headers.quantity')
   },
   {
      field: 'bid',
      sortable: true,
      header: t('record.table.headers.bid')
   },
   {
      field: 'created_at',
      sortable: true,
      header: t('record.table.headers.created_at')
   }
]);

const filters = ref<ResourceTableProps['filters']>({
   global: {
      value: null,
      matchMode: FilterMatchMode.CONTAINS
   },
   'stock.display_name': {
      operator: FilterOperator.AND,
      constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }]
   },
   'client.record_type': {
      operator: FilterOperator.AND,
      constraints: [{ value: route.params?.record_type, matchMode: FilterMatchMode.STARTS_WITH }]
   },
   record_type: {
      operator: FilterOperator.AND,
      constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }]
   },
   quantity: {
      operator: FilterOperator.AND,
      constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }],
      dataType: 'decimal'
   },
   bid: {
      operator: FilterOperator.AND,
      constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }],
      dataType: 'decimal'
   },
   created_at: {
      operator: FilterOperator.AND,
      constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }],
      dataType: 'date'
   },
   ...(attrs.filters as ResourceTableProps['filters'])
});

const stateKey = 'record';

const rowActions = Collection.create<ResourceTableProps['rowActions']>([
   {
      label: t('action.delete'),
      command:
         ({ data }) =>
         async () =>
            await supabase
               .from('record')
               .delete()
               .eq('id', data?.id)
               .setHeader('item', encodeURI(JSON.stringify(data)))
               .throwOnError()
               .then(() => emitter.emit(`${stateKey}-update`, data)),
      icon: PrimeIcons.TRASH
   },
   {
      label: t('action.edit'),
      command:
         ({ data }) =>
         async () =>
            await router.push({
               name: 'record-edit',
               params: { id: data.id },
               query: { showDialog: 'true' }
            }),
      icon: PrimeIcons.PENCIL
   }
]);

const dialogRef = inject('dialogRef', false);
</script>
<template>
   <component
      :is="ResourceTable<T>"
      :stateKey
      :from="'record'"
      :select="'*,stock:stock_view!inner(display_name), client!inner(display_name)'"
      :columns="columns"
      :rowActions="rowActions._data"
      v-model:filters="filters"
   >
      <template #header>
         <Teleport to="#page-toolbar" :disabled="dialogRef">
            <span class="flex-1 flex justify-end gap-4 flex-wrap-reverse">
               <KeywordSearchInput v-model="filters.global.value" />
               <CustomLink v-if="$can('create', 'record')" :to="{ name: 'record-add' }">
                  <template #default="{ navigate }">
                     <Button variant="outlined" :label="$t('action.add')" @click="navigate" />
                  </template>
               </CustomLink>
            </span>
         </Teleport>
      </template>
      <template #expansion="{ data }">
         <Upsert :id="data.id" class="p-0" />
      </template>
      <template #record_type_body="{ data, field }">
         {{
            ($te('const.record.type.' + _get(data, field)) &&
               $t('const.record.type.' + _get(data, field))) ||
            _get(data, field)
         }}
      </template>
   </component>
</template>
