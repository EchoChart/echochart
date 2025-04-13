<script setup>
import { DIALOG_POSITIONS } from '@/constants/router';
import Collection from '@/lib/Collection';
import Upsert from '@/views/pages/address/Upsert.vue';

defineOptions({
   inheritAttrs: false
});

const attrs = useAttrs();
const columns = new Collection([
   {
      field: 'client_display_name',
      sortable: true,
      header: i18n.t('client')
   },
   {
      field: 'address_display_name',
      sortable: true,
      header: i18n.t('address')
   },
   {
      field: 'address_country',
      sortable: true,
      header: i18n.t('country'),
      sortOrder: { value: -1 }
   },
   {
      field: 'address_city',
      sortable: true,
      header: i18n.t('city'),
      sortOrder: { value: -1 }
   },
   {
      field: 'address_district',
      sortable: true,
      header: i18n.t('district'),
      sortOrder: { value: -1 }
   },
   {
      field: 'address_created_at',
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
   client_display_name: {
      operator: FilterOperator.AND,
      constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }]
   },
   client_identity: {
      operator: FilterOperator.AND,
      constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }]
   },
   address_display_name: {
      operator: FilterOperator.AND,
      constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }]
   },
   address_country: {
      operator: FilterOperator.AND,
      constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }]
   },
   address_city: {
      operator: FilterOperator.AND,
      constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }]
   },
   address_district: {
      operator: FilterOperator.AND,
      constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }]
   },
   address_details: {
      operator: FilterOperator.AND,
      constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }]
   },
   ...attrs.filters
});

const stateKey = 'client-address';
const rowActions = new Collection([
   {
      label: i18n.t('delete'),
      command:
         ({ data }) =>
         async () =>
            await supabase
               .from('client_address')
               .delete()
               .eq('address_id', data?.address_id)
               .eq('client_id', data?.client_id)
               .setHeader('item', JSON.stringify(data))
               .throwOnError()
               .then(() => emitter.emit(`${stateKey}-update`, data)),
      icon: PrimeIcons.TRASH
   }
]);

const dialogRef = inject('dialogRef', null);

const tableProps = computed(() => ({
   stateKey,
   from: 'client_address_view',
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

               <CustomLink :to="{ name: 'address-list' }" v-slot="{ navigate }">
                  <Button
                     variant="outlined"
                     :label="$t('manage_addresses')"
                     @click="navigate"
                     severity="info"
                  />
               </CustomLink>
               <RouterLink
                  v-if="$can('create', 'client-address') || $can('modify', 'address')"
                  :to="{
                     name: 'client-manage-address',
                     query: { showDialog: DIALOG_POSITIONS.CENTER }
                  }"
                  v-slot="{ navigate }"
               >
                  <Button variant="outlined" :label="$t('add')" @click="navigate" />
               </RouterLink>
            </span>
         </Teleport>
      </template>
      <template #expansion="{ data }">
         <Upsert class="p-0" :id="data.address_id" />
      </template>
   </ResourceTable>
</template>
