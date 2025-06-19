<script setup>
import Collection from '@/lib/Collection';
import Upsert from './Upsert.vue';

defineOptions({
   inheritAttrs: false
});

const attrs = useAttrs();
const router = useRouter();
const { t } = useI18n();

// console.log(
//    await supabase.functions.invoke(`users/b89581f9-5ddf-414d-b768-143dcfaa6f5d`, {
//       body: { user_metadata: { display_name: 'akifff' } },
//       method: 'PUT'
//    })
// );

// Define the columns
/**@type {ComputedRef<ResourceTableProps['columns']>} */
const columns = computed(() => [
   {
      field: 'display_name',
      sortable: true,
      header: t('role.table.headers.name')
   },
   {
      field: 'created_at',
      sortable: true,
      header: t('role.table.headers.created_at')
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
   created_at: {
      operator: FilterOperator.AND,
      constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }],
      dataType: 'date'
   },
   ...attrs.filters
});

const stateKey = 'role';
const rowActions = Collection.create([
   {
      label: t('action.delete'),
      command:
         ({ data }) =>
         async () =>
            await supabase
               .from('role')
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
               name: 'branch-role-edit',
               params: { id: data.id },
               query: { showDialog: true }
            }),
      icon: PrimeIcons.PENCIL
   }
]);

const dialogRef = inject('dialogRef', null);

const tableProps = computed(() => ({
   stateKey,
   from: 'role',
   select: '*, permission(id, kind, group_name, resource_name)',
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
               <CustomLink v-if="$can('create', 'role')" :to="{ name: 'branch-role-add' }">
                  <template #default="{ navigate }">
                     <Button variant="outlined" :label="$t('action.add')" @click="navigate" />
                  </template>
               </CustomLink>
            </span>
         </Teleport>
      </template>
      <template #expansion="{ data }">
         <Upsert class="p-0" :id="data.id" />
      </template>
   </ResourceTable>
</template>
