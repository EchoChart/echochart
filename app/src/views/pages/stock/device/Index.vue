<script setup>
import Collection from '@/lib/Collection';
import Upsert from '../Upsert.vue';

defineOptions({
   inheritAttrs: false
});

const attrs = useAttrs();
const router = useRouter();
const columns = new Collection([
   {
      field: 'display_name',
      sortable: true,
      header: i18n.t('product'),
      sortOrder: { value: -1 }
   },
   {
      field: 'serial_number',
      sortable: true,
      header: i18n.t('serial_number')
   },
   {
      field: 'cost',
      sortable: true,
      header: i18n.t('cost')
   },
   {
      field: 'vendor',
      sortable: true,
      header: i18n.t('vendor')
   },
   {
      field: 'created_at',
      sortable: true,
      header: i18n.t('created_at'),
      sortOrder: { value: -1 }
   }
]);

// Define the filters object
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
   cost: {
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
   created_at: {
      operator: FilterOperator.AND,
      constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }],
      dataType: 'date'
   }
});

const stateKey = 'device';
const rowActions = new Collection([
   {
      label: i18n.t('delete'),
      command: async ({ data }) =>
         await supabase
            .from('stock')
            .delete()
            .eq('id', data?.id)
            .setHeader('item', JSON.stringify(data))
            .throwOnError()
            .then(() => emitter.emit(`${stateKey}-update`, data)),
      icon: PrimeIcons.TRASH
   },
   {
      label: i18n.t('edit'),
      command: async ({ data }) =>
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
   select: '*, product:product!inner(category:product_category!inner(*))',
   columns: columns._data,
   rowActions: rowActions._data,
   ...attrs
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
               >
                  <template #default="{ navigate }">
                     <Button variant="outlined" :label="$t('add')" @click="navigate" />
                  </template>
               </CustomLink>
            </span>
         </Teleport>
      </template>
      <template #expansion="{ data }">
         <Upsert
            :data
            :category="
               data?.product?.category?.map?.(({ display_name }) => display_name).join?.('|')
            "
         />
      </template>
      <template #vendor_filter="{ filterModel }">
         <StockVendorSelect v-model="filterModel.value" />
      </template>
      <template #display_name_body="{ data }">
         <div class="flex flex-col gap-2">
            <span v-text="data?.display_name" />
         </div>
      </template>
   </ResourceTable>
</template>
