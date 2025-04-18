<script setup>
import Collection from '@/lib/Collection';
import { PRODUCT_CATEGORY_PROPS } from '@/services/models/ProductModel';
import Upsert from './Upsert.vue';

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
      field: 'brand',
      sortable: true,
      showFilterMatchModes: false,
      showFilterOperator: false,
      showAddButton: false,
      header: i18n.t('brand')
   },
   {
      field: 'categories.display_name',
      showFilterMatchModes: false,
      showFilterOperator: false,
      showAddButton: false,
      header: i18n.t('categories')
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
   }
});

const stateKey = 'product';
const rowActions = new Collection([
   {
      label: i18n.t('delete'),
      command:
         ({ data }) =>
         async () =>
            await supabase
               .from('product')
               .delete()
               .eq('id', data?.id)
               .setHeader('item', JSON.stringify(data))
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
                  v-if="$can('create', 'product')"
                  :to="{ name: 'product-add' }"
                  v-slot="{ navigate }"
               >
                  <Button variant="outlined" :label="$t('add')" @click="navigate" />
               </CustomLink>
            </span>
         </Teleport>
      </template>
      <template #brand_filter="{ filterModel }">
         <ProductBrandSelect v-model="filterModel.value" editable />
      </template>
      <template #categories_display_name_filter="{ filterModel }">
         <ProductCategorySelect v-model="filterModel.value" />
      </template>
      <template #categories_display_name_body="{ data }">
         <div class="flex gap-2 flex-wrap justify-center">
            <Tag
               v-for="categories in data?.categories"
               :value="$t(categories.display_name)"
               size="large"
               :key="categories.id"
               v-bind="PRODUCT_CATEGORY_PROPS[categories.display_name]"
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
