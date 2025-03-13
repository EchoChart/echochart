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
      header: i18n.t('client'),
      sortOrder: { value: -1 }
   },
   {
      field: 'identity_number',
      sortable: true,
      header: i18n.t('identity_number')
   },
   {
      field: 'email',
      sortable: true,
      header: i18n.t('email')
   },
   {
      field: 'phone',
      sortable: true,
      header: i18n.t('phone')
   },
   {
      field: 'nationality',
      sortable: true,
      header: i18n.t('nationality')
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
   identity_number: {
      operator: FilterOperator.AND,
      constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }]
   },
   display_name: {
      operator: FilterOperator.AND,
      constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }]
   },
   email: {
      operator: FilterOperator.AND,
      constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }]
   },
   phone: {
      operator: FilterOperator.AND,
      constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }]
   },
   nationality: {
      operator: FilterOperator.AND,
      constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }]
   },
   created_at: {
      operator: FilterOperator.AND,
      constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }],
      dataType: 'date'
   }
});

const stateKey = 'client';
const rowActions = new Collection([
   {
      label: i18n.t('delete'),
      command: async ({ data }) =>
         await supabase
            .from('client')
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
            name: 'client-edit',
            params: {
               id: data.id
            },
            query: { showDialog: true }
         }),
      icon: PrimeIcons.PENCIL
   }
]);

const dialogRef = inject('dialogRef', null);

const tableProps = computed(() => ({
   stateKey,
   from: 'client',
   select: '*',
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

               <CustomLink v-if="$can('create', 'client')" :to="{ name: 'client-add' }">
                  <template #default="{ navigate }">
                     <Button variant="outlined" :label="$t('add')" @click="navigate" />
                  </template>
               </CustomLink>
            </span>
         </Teleport>
      </template>
      <template #expansion="{ data }">
         <Upsert :data />
      </template>
   </ResourceTable>
</template>
