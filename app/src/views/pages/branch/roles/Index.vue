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
   }
});

const stateKey = 'role';
const rowActions = new Collection([
   {
      label: i18n.t('delete'),
      command: async ({ data }) =>
         await supabase
            .from('roles')
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
   from: 'roles',
   select: '*, permissions(id, kind, group_name)',
   columns: columns._data,
   rowActions: rowActions._data,
   ...attrs
}));
</script>
<template>
   <ResourceTable v-bind="tableProps" v-model:filters="filters" :mapClass="Collection">
      <template #header>
         <Teleport v-if="$can('create', 'roles')" to="#page-toolbar" :disabled="dialogRef">
            <div class="flex items-center justify-end gap-4">
               <CustomLink :to="{ name: 'branch-role-add' }">
                  <template #default="{ navigate }">
                     <Button variant="outlined" :label="$t('add')" @click="navigate" />
                  </template>
               </CustomLink>
            </div>
         </Teleport>
      </template>
      <template #expansion="{ data }">
         <Upsert :data />
      </template>
   </ResourceTable>
</template>
