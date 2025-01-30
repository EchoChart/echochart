<script setup>
import Collection from '@/lib/Collection';
import { isVNode } from 'vue';
const { currentTenant } = storeToRefs(useAuthStore());

defineOptions({
   inheritAttrs: false
});
const props = defineProps({
   rowActions: {
      type: Array,
      default: () => []
   }
});
const emit = defineEmits(['meta']);
const attrs = useAttrs();
const dialogRef = inject('dialogRef', null);

const stateStorage = !dialogRef?.value ? 'local' : 'session';

const stateKey = !dialogRef?.value
   ? 'dt-' + [attrs?.stateKey, currentTenant?.value?.display_name]?.filter(Boolean).join('-')
   : _uniqueId('dt-');

!!dialogRef?.value && sessionStorage.removeItem(stateKey);

onUnmounted(() => !!dialogRef?.value && sessionStorage.removeItem(stateKey));

const routeLoading = inject('routeLoading', false);
const loading = computed(() => {
   if (!_isNil(attrs?.loading)) {
      return attrs?.loading;
   }
   return routeLoading.value;
});
const actions = new Collection(props.rowActions);

const meta = (dialogRef?.value ? useSessionStorage : useLocalStorage)?.(
   stateKey,
   {
      expandedRows: {},
      rows: _get(attrs, 'rows', 5),
      multiSortMeta: [{ field: 'created_at', order: -1 }],
      filters: attrs?.columns
         ?.filter?.(({ field, filter }) => !!filter && !!field)
         ?.reduce?.((acc, { field, filter }) => _set(acc, field, filter), {})
   },
   { mergeDefaults: true, writeDefaults: true }
);

const tableProps = computed(() => ({
   dataKey: 'id',
   reorderableColumns: true,
   paginator: true,
   filterDisplay: 'menu',
   sortMode: 'multiple',
   removableSort: true,
   lazy: true,
   rowsPerPageOptions: [1, 5, 10],
   paginatorTemplate:
      'FirstPageLink PrevPageLink PageLinks NextPageLink RowsPerPageDropdown CurrentPageReport',
   resizableColumns: true,
   showGridlines: true,
   loading: loading.value,
   stateStorage,
   ...meta.value,
   ...attrs,
   stateKey
}));

const onMeta = (value) => emit('meta', value);

onMeta(meta.value);
</script>
<template>
   <DataTable
      :pt="{
         header: {
            class: 'empty:hidden'
         },
         footer: {
            class: 'empty:hidden'
         }
      }"
      v-model:filters="meta.filters"
      @filter="(value) => onMeta(value)"
      @page="(value) => onMeta(value)"
      @sort="(value) => onMeta(value)"
      v-bind="tableProps"
      :value="tableProps?.value?.length ? tableProps?.value : new Array(tableProps?.rows)"
   >
      <template #expansion="slotProps">
         <span name="expansion" v-bind="{ ...slotProps, loading }" />
      </template>
      <template #empty> <span v-text="$t('no_data_found')" /> </template>
      <Column
         v-if="$slots.expansion"
         field="_expansion"
         :reorderableColumn="false"
         expander
         headerStyle="width: 3rem"
         style="width: 5rem !important"
      />
      <Column
         v-for="(column, i) in tableProps?.columns"
         :key="'column_' + (column?.field + i) || i"
         v-bind="column"
         :showFilterOperator="false"
         :showFilterMenu="_has(tableProps, `filters.${column.field}`)"
         :header="$slots[`${_snakeCase(column?.field)}_header`] ? undefined : column?.header"
         :footer="$slots[`${_snakeCase(column?.field)}_footer`] ? undefined : column?.footer"
      >
         <template
            v-for="slot in _keys($slots)
               .filter(
                  (key) =>
                     !key.endsWith('body') &&
                     !key.endsWith('filter') &&
                     key.startsWith(`${_snakeCase(column?.field)}_`)
               )
               .map((key) => key.replace(`${_snakeCase(column?.field)}_`, ''))"
            #[slot]="slotProps"
            :key="`${_snakeCase(column?.field)}_slot_${slot}`"
         >
            <slot
               v-if="_has($slots, `${_snakeCase(column?.field)}_${slot}`)"
               :name="`${_snakeCase(column?.field)}_${slot}`"
               v-bind="_merge(column, _omitBy(slotProps, isVNode))"
            />
         </template>

         <template #filtericon="slotProps">
            <IconField
               :class="[
                  slotProps.class,
                  _get(meta?.filters, `${column.field}.constraints`, []).some(
                     ({ value }) => !_isNil(value)
                  )
                     ? `text-primary ${PrimeIcons.FILTER_FILL}`
                     : PrimeIcons.FILTER
               ]"
            />
         </template>
         <template #filter="slotProps" v-if="`${_snakeCase(column?.field)}_filter`">
            <slot :name="`${_snakeCase(slotProps?.field)}_filter`" v-bind="slotProps">
               <FormField fluid v-if="slotProps?.filterModel">
                  <template v-slot="inputProps">
                     <DatePicker
                        v-if="
                           column.dataType === 'date' ||
                           [
                              FilterMatchMode.DATE_IS,
                              FilterMatchMode.DATE_IS_NOT,
                              FilterMatchMode.DATE_BEFORE,
                              FilterMatchMode.DATE_AFTER
                           ].includes(slotProps.filterModel.matchMode)
                        "
                        :selectionMode="'single'"
                        v-bind="inputProps"
                        v-model="slotProps.filterModel.value"
                        dateFormat="dd/mm/yy"
                        placeholder="dd/mm/yyyy"
                     />
                     <InputNumber
                        v-else-if="column.dataType === 'numeric'"
                        v-bind="inputProps"
                        v-model="slotProps.filterModel.value"
                        @keydown.enter="slotProps.filterCallback"
                     />
                     <InputText
                        v-else
                        v-bind="inputProps"
                        type="text"
                        v-model="slotProps.filterModel.value"
                        @keydown.enter="slotProps.filterCallback"
                     />
                  </template>
               </FormField>
            </slot>
         </template>
         <template v-if="!column.expander" #body="body">
            <slot :name="`${_snakeCase(body?.field)}_body`" v-bind="body">
               <Skeleton
                  v-if="loading && !tableProps?.value?.length"
                  :height="
                     actions._data?.length > 0 && tableProps?.value?.length > 0
                        ? '2.5rem'
                        : '1.5rem'
                  "
               />
               <span v-else v-text="_get(body?.data, body.field)" />
            </slot>
         </template>
      </Column>
      <Column
         v-if="actions._data?.length && tableProps?.value?.length"
         field="_actions"
         :header="i18n.t('actions')"
         :key="'table_action'"
      >
         <template #body="body">
            <slot name="table_actions">
               <ActionSpeedDial
                  :model="
                     actions._data?.map((item) => ({
                        ...item,
                        visible: item?.visible?.bind?.(undefined, body) || item?.visible,
                        command: item?.command?.bind?.(undefined, body)
                     }))
                  "
               />
            </slot>
         </template>
      </Column>

      <template
         v-for="slot in _keys($slots)?.filter((key) => !key.includes('_'))"
         #[slot]="slotProps"
         :key="`slot_${slot}`"
      >
         <slot :name="slot" v-bind="slotProps" />
      </template>
   </DataTable>
</template>
<style lang="scss">
.p-datatable-mask.p-overlay-mask {
   background-color: rgba($color: #000, $alpha: 0.2);
}
</style>
