<script setup>
import Collection from '@/lib/Collection';
import { isVNode } from 'vue';

const DATA_TYPES = {
   numeric: 'numeric',
   decimal: 'numeric',
   date: 'date'
};

defineOptions({
   inheritAttrs: false
});
const props = defineProps({
   rowActions: {
      type: Array,
      default: () => []
   },
   filters: {
      type: Object,
      default: () => ({})
   },
   useMeta: {
      type: Boolean,
      default: true
   }
});
const emit = defineEmits(['meta', 'update:filters']);
const attrs = useAttrs();
const dialogRef = inject('dialogRef', null);

function useMetaStorage() {
   const stateStorage = !dialogRef?.value && props.useMeta != false ? 'local' : 'session';
   const stateKey = stateStorage == 'local' ? 'dt-' + attrs?.stateKey : _uniqueId('dt-');

   const meta = (stateStorage == 'local' ? useLocalStorage : useSessionStorage)?.(
      stateKey,
      {
         expandedRows: {},
         expandedRowGroups: [],
         rows: _defaultTo(attrs?.rows, 5),
         multiSortMeta: __.chain(attrs?.columns)
            .filter(({ field, sortOrder }) => !!field && !!sortOrder)
            .sortBy(({ sortOrder }) => sortOrder.index || 0)
            .map(({ field, sortOrder }) => ({ field, order: sortOrder.value }))
            .value()
      },
      { mergeDefaults: true, writeDefaults: true }
   );

   meta.value.filters = _merge(props.filters, meta.value.filters);

   const onMeta = (value = meta.value) => {
      _merge(meta.value, { ...value, filters: filterInput.value });
      emit('meta', meta.value);
   };

   watch(
      () => props.filters,
      _throttle(() => onMeta(), 500),
      { deep: true }
   );

   if (stateStorage == 'session') sessionStorage.removeItem(stateKey);

   onUnmounted(() => stateStorage == 'session' && sessionStorage.removeItem(stateKey));

   return {
      stateStorage,
      stateKey,
      meta,
      onMeta
   };
}

const { meta, stateStorage, stateKey, onMeta } = useMetaStorage();

const routeLoading = inject('routeLoading', false);
const loading = computed(() => {
   if (!_isNil(attrs?.loading)) {
      return attrs?.loading;
   }
   return routeLoading.value;
});
const actions = new Collection(props.rowActions);

const filterInput = computed({
   get: () => props.filters,
   set: (values) => {
      _toPairs(values).forEach(([field, { constraints }]) => {
         if (!meta.value.filters[field]) return;

         _merge(meta.value.filters[field], {
            ...values[field],
            ..._pick(props.filters[field], ['dataType'])
         });

         if (meta.value.filters[field]?.constraints && _isArray(constraints)) {
            _set(meta.value.filters[field], 'constraints', constraints);
         }
      });

      emit('update:filters', meta.value.filters);
   }
});

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
   columnResizeMode: stateStorage === 'local' ? 'fit' : 'expand',
   showGridlines: true,
   loading: loading.value,
   stateStorage,
   rowGroupMode: 'rowspan',
   groupRowsBy: meta.value.multiSortMeta?.map(({ field }) => field),
   ...meta.value,
   ...attrs,
   stateKey
}));
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
      v-model:filters="filterInput"
      v-model:expanded-rows="meta.expandedRows"
      v-model:expanded-row-groups="meta.expandedRowGroups"
      v-model:multi-sort-meta="meta.multiSortMeta"
      @page="(value) => onMeta(value)"
      @sort="(value) => onMeta(value)"
      v-bind="tableProps"
      :value="
         tableProps?.value?.length > 0 || !loading
            ? tableProps?.value?.filter?.(
                 (v) =>
                    !tableProps?.frozenValue?.some(
                       (f) => _get(f, tableProps.dataKey) === _get(v, tableProps.dataKey)
                    )
              )
            : new Array(tableProps?.rows)
      "
   >
      <template #expansion="slotProps">
         <span name="expansion" v-bind="{ ...slotProps, loading }" />
      </template>
      <template #empty> <span v-text="$t('no_data_found')" /> </template>
      <template v-for="slot in _keys($slots)" #[slot]="slotProps" :key="`slot_${slot}`">
         <slot v-bind="slotProps" :name="slot" :key="`slot_${slot}`" />
      </template>
      <Column
         v-if="$slots.expansion && tableProps?.value?.length"
         field="_expansion"
         expander
         class="!min-w-[4rem] !max-w-[4rem] !w-[4rem]"
         style="max-width: 4rem !important; width: 4rem !important"
      />
      <Column
         class="!min-w-32"
         v-for="(column, i) in tableProps?.columns"
         :key="'column_' + (column?.field ? column?.field + i : i) || i"
         showClearButton
         :data-type="DATA_TYPES[meta?.filters?.[column?.field]?.dataType]"
         :showFilterOperator="column?.field?.split?.('.')?.length > 1 ? false : true"
         :showFilterMenu="!!meta?.filters?.[`${column?.field}`]"
         v-bind="column"
         :header="$slots[`${_snakeCase(column?.field)}_header`] ? undefined : column?.header"
         :footer="$slots[`${_snakeCase(column?.field)}_footer`] ? undefined : column?.footer"
         :pt="{
            bodyCell: ({ instance }) =>
               _keys(tableProps.expandedRows).some?.((key) =>
                  $attrs.value?.some?.(
                     (row) =>
                        _get(row, tableProps.dataKey) === key &&
                        _get(instance?.rowData, column?.field) === _get(row, column?.field) &&
                        (tableProps.groupRowsBy?.includes(column?.field) ||
                           tableProps.groupRowsBy === column)
                  )
               )
                  ? {
                       class: 'align-baseline'
                    }
                  : undefined
         }"
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
                  meta?.filters?.[`${column?.field}`]?.constraints?.some?.(
                     ({ value }) => !_isNil(value)
                  ) || !_isNil(meta?.filters?.[column?.field]?.value)
                     ? `text-primary ${PrimeIcons.FILTER_FILL}`
                     : PrimeIcons.FILTER
               ]"
            />
         </template>
         <template #filter="slotProps" v-if="!!meta?.filters?.[column?.field]">
            <slot :name="`${_snakeCase(slotProps?.field)}_filter`" v-bind="slotProps">
               <FormField fluid v-if="slotProps?.filterModel">
                  <template v-slot="inputProps">
                     <DatePicker
                        v-if="
                           meta?.filters?.[column?.field]?.dataType === 'date' ||
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
                        v-else-if="
                           ['numeric', 'decimal'].includes(meta?.filters?.[column?.field]?.dataType)
                        "
                        v-bind="inputProps"
                        v-model="slotProps.filterModel.value"
                        :max-fraction-digits="
                           meta?.filters?.[column?.field]?.dataType === 'decimal' ? 3 : null
                        "
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
         <template v-if="!column.expander && column?.field" #body="body">
            <slot :name="`${_snakeCase(body?.field)}_body`" v-bind="body">
               <Skeleton v-if="loading && !_has(body?.data, body.field)" :height="'2.5rem'" />
               <div
                  v-else
                  class="truncate"
                  :title="_get(body?.data, body.field)"
                  v-text="_get(body?.data, body.field)"
               />
            </slot>
         </template>
      </Column>
      <Column
         v-if="actions._data?.length && tableProps?.value?.length"
         field="_actions"
         :header="i18n.t('actions')"
         :key="'table_action'"
         :style="actions._data?.length && `min-width: ${actions._data?.length * 4}rem`"
      >
         <template #body="body">
            <slot name="table_actions">
               <!-- <ActionSpeedDial
                  :model="
                     actions._data?.map((item) => ({
                        ...item,
                        visible: item?.visible?.bind?.(undefined, body) || item?.visible,
                        command: item?.command?.bind?.(undefined, body)
                     }))
                  "
               /> -->
               <ActionButtons
                  :items="
                     actions._data?.map((item) =>
                        _fromPairs(
                           _toPairs(item).map(([key, value]) => [
                              key,
                              _isFunction(value) ? value(body) : value
                           ])
                        )
                     )
                  "
               />
            </slot>
         </template>
      </Column>
   </DataTable>
</template>
<style lang="scss">
.p-datatable-mask.p-overlay-mask {
   background-color: rgba($color: #aaa, $alpha: 0.1);
}
.p-datatable-row-expansion {
   z-index: 1;
   position: relative;
}
</style>
