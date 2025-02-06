<script setup>
import Collection from '@/lib/Collection';
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
      header: i18n.t('display_name'),
      filter: {
         operator: FilterOperator.AND,
         constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }]
      },
      dataType: 'text'
   },
   {
      field: 'created_at',
      sortable: true,
      header: i18n.t('created_at'),
      filter: {
         operator: FilterOperator.AND,
         constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }]
      },
      dataType: 'date'
   }
]);

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
            .then(() => emitter.emit('roles-update', data)),
      icon: PrimeIcons.TRASH,
      severity: 'red'
   },
   {
      label: i18n.t('edit'),
      command: async ({ data }) =>
         router.push({
            name: 'branch-roles-edit',
            params: { id: data.id },
            query: { showDialog: true }
         }),
      icon: PrimeIcons.PENCIL
   }
]);

const dialogRef = inject('dialogRef', null);

const tableProps = computed(() => ({
   from: 'roles',
   select: '*, permissions(id, kind, group_name)',
   columns: columns,
   rowActions: rowActions._data,
   ...attrs
}));
</script>
<template>
   <div class="card">
      <ResourceTable v-bind="tableProps" :mapClass="Collection">
         <template #header>
            <Teleport v-if="$can('create', 'roles')" to="#page-toolbar" defer :disabled="dialogRef">
               <div class="flex items-center justify-end gap-4">
                  <CustomLink :to="{ name: 'branch-roles-add' }">
                     <template #default="{ navigate }">
                        <Button variant="outlined" :label="$t('add')" @click="navigate" />
                     </template>
                  </CustomLink>
               </div>
            </Teleport>
         </template>
         <template #expansion="{ data }">
            <Upsert :data="data" />
         </template>
      </ResourceTable>
   </div>
</template>
