<script setup>
import { PRODUCT_CATEGORY_PROPS } from '@/constants/form/product';
import Collection from '@/lib/Collection';
import Upsert from './Upsert.vue';

defineOptions({
   inheritAttrs: false
});

const { t } = useI18n();
const attrs = useAttrs();
const router = useRouter();
/**@type {ComputedRef<ResourceTableProps['columns']>} */
const columns = computed(() => [
   {
      field: 'display_name',
      sortable: true,
      header: t('stock.product.table.headers.product'),
      sortOrder: { value: -1 }
   },
   {
      field: 'brand',
      sortable: true,
      showFilterMatchModes: false,
      showFilterOperator: false,
      showAddButton: false,
      header: t('stock.product.table.headers.brand')
   },
   {
      field: 'categories.display_name',
      showFilterMatchModes: false,
      showFilterOperator: false,
      showAddButton: false,
      header: t('stock.product.table.headers.categories')
   },
   {
      field: 'created_at',
      sortable: true,
      header: t('stock.product.table.headers.created_at'),
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
   display_name: {
      operator: FilterOperator.AND,
      constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }]
   },
   brand: {
      operator: FilterOperator.AND,
      constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }]
   },
   details: {
      operator: FilterOperator.AND,
      constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }]
   },
   'categories.display_name': {
      operator: FilterOperator.AND,
      constraints: [{ value: null, matchMode: FilterMatchMode.IN }]
   },
   created_at: {
      operator: FilterOperator.AND,
      constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }],
      dataType: 'date'
   },
   ...attrs.filters
});

const stateKey = 'product';
const rowActions = Collection.create([
   {
      label: t('action.delete'),
      command:
         ({ data }) =>
         async () =>
            await supabase
               .from('product')
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
               name: 'product-edit',
               params: {
                  id: data.id,
                  categories: data?.product?.categories
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
   from: 'product',
   select: '*, categories:product_category!inner(*)',
   columns: columns.value,
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
                  v-if="$can('create', 'product')"
                  :to="{ name: 'product-add' }"
                  v-slot="{ navigate }"
               >
                  <Button variant="outlined" :label="$t('action.add')" @click="navigate" />
               </CustomLink>
            </span>
         </Teleport>
      </template>
      <template #brand_filter="{ filterModel }">
         <SelectProductBrand v-model="filterModel.value" editable />
      </template>
      <template #categories_display_name_filter="{ filterModel }">
         <SelectProductCategory v-model="filterModel.value" />
      </template>
      <template #categories_display_name_body="{ data }">
         <div class="flex gap-2 flex-wrap justify-center">
            <Tag
               v-for="category in data?.categories"
               :value="$t(`fields.${_snakeCase(category?.display_name || category) || ''}`)"
               size="large"
               :key="category.id"
               v-bind="PRODUCT_CATEGORY_PROPS[category.display_name]"
            />
         </div>
      </template>
      <template #expansion="{ data }">
         <Upsert
            class="p-0"
            :data
            :categories="data?.categories?.map?.(({ display_name }) => display_name).join?.('|')"
         />
      </template>
   </ResourceTable>
</template>
