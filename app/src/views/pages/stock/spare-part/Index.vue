<script setup>
import Collection from '@/lib/Collection';
import Upsert from '../Upsert.vue';

defineOptions({
   inheritAttrs: false
});

const attrs = useAttrs();
const router = useRouter();

// Define the columns without filters
const columns = new Collection([
   {
      field: 'display_name',
      sortable: true,
      header: i18n.t('product'),
      sortOrder: { value: -1 }
   },
   {
      field: 'unit_cost',
      sortable: true,
      header: i18n.t('unit_cost'),
      dataType: 'numeric'
   },
   {
      field: 'quantity',
      sortable: true,
      header: i18n.t('quantity'),
      dataType: 'numeric'
   },
   {
      field: 'vendor',
      sortable: true,
      header: i18n.t('vendor')
   },
   {
      field: 'stocked_at',
      sortable: true,
      header: i18n.t('stocked_at'),
      sortOrder: { value: -1 }
   }
]);

const filters = ref({
   global: {
      value: null,
      matchMode: FilterMatchMode.CONTAINS
   },
   'product.category.display_name': {
      operator: FilterOperator.AND,
      constraints: [{ value: 'spare part', matchMode: FilterMatchMode.EQUALS }]
   },
   display_name: {
      operator: FilterOperator.AND,
      constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }]
   },
   ['brand']: {
      operator: FilterOperator.AND,
      constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }]
   },
   ['barcode']: {
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

const stateKey = 'spare-part';
const rowActions = new Collection([
   {
      label: i18n.t('delete'),
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
      label: i18n.t('edit'),
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
   select: '*, product:product!inner(*, category:product_category!inner(*))',
   columns: columns._data,
   rowActions: rowActions._data,
   ...attrs
}));
</script>
<template>
   <ResourceTable v-bind="tableProps" v-model:filters="filters">
      <template #header>
         <Teleport v-if="$can('create', 'stock')" to="#page-toolbar" :disabled="dialogRef">
            <span class="flex-1 flex justify-end gap-4 flex-wrap-reverse">
               <KeywordSearchInput v-model="filters.global.value" />

               <CustomLink
                  :to="{ name: 'stock-add', params: { category: 'spare part' } }"
                  v-slot="{ navigate }"
               >
                  <Button variant="outlined" :label="$t('add')" @click="navigate" />
               </CustomLink>
            </span>
         </Teleport>
      </template>
      <template #expansion="{ data }">
         <Upsert
            class="p-0"
            :data
            :category="
               data?.product?.category?.map?.(({ display_name }) => display_name).join?.('|')
            "
         />
      </template>
      <template #vendor_filter="{ filterModel }">
         <SelectStockVendor v-model="filterModel.value" />
      </template>
   </ResourceTable>
</template>
