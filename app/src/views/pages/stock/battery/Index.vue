<script setup>
import Collection from '@/lib/Collection';
import Upsert from '../Upsert.vue';
import KeywordSearchInput from '@/components/ui/CustomTable/KeywordSearchInput.vue';

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
      field: 'cost',
      sortable: true,
      header: i18n.t('cost'),
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
      constraints: [{ value: 'battery', matchMode: FilterMatchMode.EQUALS }]
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

const stateKey = 'battery';
const rowActions = new Collection([
   {
      label: i18n.t('delete'),
      command: async ({ data }) =>
         await supabase
            .from('stocks')
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
   datakey: 'id',
   stateKey,
   from: 'stock_view',
   select: '*, product:products!inner(*, category:product_category!inner(*))',
   columns: columns._data,
   rowActions: rowActions._data,
   ...attrs
}));
</script>
<template>
   <ResourceTable v-bind="tableProps" v-model:filters="filters">
      <template #header>
         <div class="flex justify-end gap-4">
            <KeywordSearchInput v-model="filters.global.value" />
            <Teleport v-if="$can('create', 'stocks')" to="#page-toolbar" :disabled="dialogRef">
               <div class="flex items-center justify-end gap-4">
                  <Teleport
                     v-if="$can('create', 'stocks')"
                     to="#page-toolbar"
                     :disabled="dialogRef"
                  >
                     <div class="flex items-center justify-end gap-4">
                        <CustomLink :to="{ name: 'stock-add', params: { category: 'battery' } }">
                           <template #default="{ navigate }">
                              <Button variant="outlined" :label="$t('add')" @click="navigate" />
                           </template>
                        </CustomLink>
                     </div>
                  </Teleport>
               </div>
            </Teleport>
         </div>
      </template>
      <template #expansion="{ data }">
         <Upsert
            class="w-full"
            :data
            :category="
               data?.product?.category?.map?.(({ display_name }) => display_name).join?.('|')
            "
         />
      </template>
   </ResourceTable>
</template>
