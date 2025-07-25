<script setup lang="ts" generic="T extends Tables['user']['Row']">
import ResourceTable, {
   ResourceTableProps
} from '@/components/service-components/resource-table/ResourceTable.vue';
import Collection from '@/lib/Collection';
import { useI18n } from 'vue-i18n';
import Upsert from './upsert/Index.vue';

defineOptions({
   inheritAttrs: false
});

const attrs = useAttrs();
const router = useRouter();

const { t } = useI18n();

const columns = computed<ResourceTableProps['columns']>(() => [
   {
      field: 'user_metadata.display_name',
      filterField: 'user_metadata->>display_name',
      sortField: 'user_metadata->>display_name',
      sortable: true,
      header: t('user.table.headers.name')
   },
   {
      field: 'email',
      sortable: true,
      header: t('user.table.headers.email')
   },
   {
      field: 'created_at',
      sortable: true,
      header: t('user.table.headers.created_at')
   }
]);

const filters = ref<ResourceTableProps['filters']>({
   global: {
      value: null,
      matchMode: FilterMatchMode.CONTAINS
   },
   email: {
      operator: FilterOperator.AND,
      constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }]
   },
   'user_metadata->>display_name': {
      operator: FilterOperator.AND,
      constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }]
   },
   created_at: {
      operator: FilterOperator.AND,
      constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }],
      dataType: 'date'
   },
   ...(attrs.filters as ResourceTableProps['filters'])
});

const stateKey = 'user';

const rowActions = Collection.create<ResourceTableProps['rowActions']>([
   {
      label: t('action.delete'),
      command:
         ({ data }) =>
         async () => {
            const { error } = await supabase.functions.invoke(`user/${data.id}`, {
               method: 'DELETE'
            });
            if (error) throw error;
            emitter.emit('user-update');
         },
      icon: PrimeIcons.TRASH
   },
   {
      label: t('action.edit'),
      command:
         ({ data }) =>
         async () =>
            await router.push({
               name: 'branch-user-manage',
               params: { id: data.id },
               query: { showDialog: 'true' }
            }),
      icon: PrimeIcons.PENCIL
   }
]);

const dialogRef = inject('dialogRef', false);
</script>
<template>
   <component
      :is="ResourceTable<T>"
      :stateKey
      :from="'user'"
      :select="'*, role(*,permission(*))'"
      :columns="columns"
      :rowActions="rowActions._data"
      v-model:filters="filters"
   >
      <template #header>
         <Teleport to="#page-toolbar" :disabled="dialogRef">
            <span class="flex-1 flex justify-end gap-4 flex-wrap-reverse">
               <KeywordSearchInput v-model="filters.global.value" />
               <CustomLink v-if="$can('create', 'user')" :to="{ name: 'branch-user-manage' }">
                  <template #default="{ navigate }">
                     <Button variant="outlined" :label="$t('action.add')" @click="navigate" />
                  </template>
               </CustomLink>
            </span>
         </Teleport>
      </template>
      <template #expansion="{ data }">
         <Upsert :id="data.id" class="p-0" />
      </template>
   </component>
</template>
