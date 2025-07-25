<script setup>
import Collection from '@/lib/Collection';
import Upsert from '../Upsert.vue';

defineOptions({
   inheritAttrs: false
});

const { t } = useI18n();

const router = useRouter();
/**@type {ComputedRef<ResourceTableProps['columns']>} */
const columns = computed(() => [
   {
      field: 'display_name',
      sortable: true,
      header: t('stock.device.table.headers.product'),
      sortOrder: { value: -1 }
   },
   {
      field: 'serial_number',
      sortable: true,
      header: t('stock.device.table.headers.serial_number')
   },
   {
      field: 'unit_cost',
      sortable: true,
      header: t('stock.device.table.headers.unit_cost')
   },
   {
      field: 'vendor',
      sortable: true,
      header: t('stock.device.table.headers.vendor')
   },
   {
      field: 'stocked_at',
      sortable: true,
      header: t('stock.device.table.headers.stocked_at'),
      sortOrder: { value: -1 }
   }
]);

// Define the filters object
/**@type {Ref<ResourceTableProps['filters']>} */
const filters = ref({
   global: {
      value: null,
      matchMode: FilterMatchMode.CONTAINS
   },
   'product.category.display_name': {
      operator: FilterOperator.AND,
      constraints: [{ value: 'device', matchMode: FilterMatchMode.EQUALS }]
   },
   display_name: {
      operator: FilterOperator.AND,
      constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }]
   },
   brand: {
      operator: FilterOperator.AND,
      constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }]
   },
   barcode: {
      operator: FilterOperator.AND,
      constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }]
   },
   serial_number: {
      operator: FilterOperator.AND,
      constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }]
   },
   unit_cost: {
      operator: FilterOperator.AND,
      constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }],
      dataType: 'decimal'
   },
   quantity: {
      operator: FilterOperator.AND,
      constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }],
      dataType: 'numeric'
   },
   vendor: {
      operator: FilterOperator.AND,
      constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }]
   },
   stocked_at: {
      operator: FilterOperator.AND,
      constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }],
      dataType: 'date'
   }
});

const stateKey = 'device';
const rowActions = Collection.create([
   {
      label: t('action.delete'),
      command:
         ({ data }) =>
         async () =>
            await supabase
               .from('stock')
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
            router.push({
               name: 'stock-edit',
               params: {
                  id: data.id,
                  category: data?.product?.category
                     ?.map?.(({ display_name }) => display_name)
                     .join?.('|')
               },
               query: { showDialog: true }
            }),
      icon: PrimeIcons.PENCIL
   }
]);

const dialogRef = inject('dialogRef', null);

const tableProps = computed(() => ({
   stateKey,
   from: 'stock_view',
   select:
      'id, display_name, serial_number, unit_cost, vendor, stocked_at, product:product!inner(category:product_category!inner(*))',
   columns: columns.value,
   rowActions: rowActions._data
}));
</script>
<template>
   <ResourceTable v-bind="tableProps" v-model:filters="filters">
      <template #header>
         <Teleport to="#page-toolbar" :disabled="dialogRef">
            <span class="flex-1 flex justify-end gap-4 flex-wrap-reverse">
               <KeywordSearchInput v-model="filters.global.value" />

               <CustomLink
                  v-if="$can('create', 'stock')"
                  :to="{ name: 'stock-add', params: { category: 'device' } }"
                  v-slot="{ navigate }"
               >
                  <Button variant="outlined" :label="$t('action.add')" @click="navigate" />
               </CustomLink>
            </span>
         </Teleport>
      </template>
      <template #expansion="{ data }">
         <Upsert class="p-0" :id="data.id" />
      </template>
      <template #vendor_filter="{ filterModel }">
         <SelectStockVendor v-model="filterModel.value" />
      </template>
   </ResourceTable>
</template>
