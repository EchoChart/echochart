<script setup>
import Collection from '@/lib/Collection';
import Upsert from './Upsert.vue';

defineOptions({
   inheritAttrs: false
});

const attrs = useAttrs();
const router = useRouter();

// Define the columns
const columns = new Collection([
   {
      field: 'display_name',
      sortable: true,
      header: i18n.t('display_name')
   },
   {
      field: 'created_at',
      sortable: true,
      header: i18n.t('created_at')
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
   created_at: {
      operator: FilterOperator.AND,
      constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }],
      dataType: 'date'
   },
   ...attrs.filters
});

const stateKey = 'role';
const rowActions = new Collection([
   {
      label: i18n.t('delete'),
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
      label: i18n.t('edit'),
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
   select: '*, permission(id, kind, group_name)',
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
               <CustomLink v-if="$can('create', 'role')" :to="{ name: 'branch-role-add' }">
                  <template #default="{ navigate }">
                     <Button variant="outlined" :label="$t('add')" @click="navigate" />
                  </template>
               </CustomLink>
            </span>
         </Teleport>
      </template>
      <template #expansion="{ data }">
         <Upsert class="p-0" :data />
      </template>
   </ResourceTable>
</template>
