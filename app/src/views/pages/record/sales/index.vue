<script setup lang="ts" generic="T extends Tables['record']['Row']">
import ResourceTable, {
   ResourceTableProps
} from '@/components/service-components/resource-table/ResourceTable.vue';
import Collection from '@/lib/Collection';
import Upsert from '@/views/pages/record/upsert/index.vue';

defineOptions({
   inheritAttrs: false
});

const attrs = useAttrs();
const router = useRouter();

const columns = Collection.create<ResourceTableProps['columns']>([
   {
      field: 'stock.display_name',
      sortable: true,
      header: i18n.t('product')
   },
   {
      field: 'client.display_name',
      sortable: true,
      header: i18n.t('client')
   },
   {
      field: 'quantity',
      sortable: true,
      header: i18n.t('quantity')
   },
   {
      field: 'bid',
      sortable: true,
      header: i18n.t('bid')
   },
   {
      field: 'created_at',
      sortable: true,
      header: i18n.t('created_at')
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
   'client.display_name': {
      operator: FilterOperator.AND,
      constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }]
   },
   record_type: {
      operator: FilterOperator.AND,
      constraints: [{ value: 'sale', matchMode: FilterMatchMode.STARTS_WITH }]
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

const stateKey = 'sales';

const rowActions = Collection.create<ResourceTableProps['rowActions']>([
   {
      label: i18n.t('delete'),
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
      label: i18n.t('edit'),
      command:
         ({ data }) =>
         async () =>
            await router.push({
               name: 'sales-edit',
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
      :columns="columns._data"
      :rowActions="rowActions._data"
      v-model:filters="filters"
   >
      <template #header>
         <Teleport to="#page-toolbar" :disabled="dialogRef">
            <span class="flex-1 flex justify-end gap-4 flex-wrap-reverse">
               <KeywordSearchInput v-model="filters.global.value" />
               <CustomLink v-if="$can('create', 'record')" :to="{ name: 'sales-add' }">
                  <template #default="{ navigate }">
                     <Button variant="outlined" :label="$t('add')" @click="navigate" />
                  </template>
               </CustomLink>
            </span>
         </Teleport>
      </template>
      <template #expansion="{ data }">
         <Upsert :id="data.id" class="p-0" />
      </template>
   </component>
</template>
