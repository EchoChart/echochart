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

/**@type {CustomTableProps} */
const props = defineProps({
   columns: {
      default: () => []
   },
   mapClass: {
      default: null
   },
   filters: {
      default: () => ({})
   },
   rowActions: {
      type: Array,
      default: () => []
   },
   useMeta: {
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

   watch(() => meta.value.filters, _throttle(onMeta, 500), { deep: true });

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

const selection = defineModel('selection');

const values = defineModel('value');

const tableValue = computed(() => {
   return values.value?.length > 0 || !loading.value
      ? values.value?.filter?.(
           (v) =>
              !tableProps.value?.frozenValue?.some(
                 (f) => _get(f, tableProps.value.dataKey) === _get(v, tableProps.value.dataKey)
              )
        )
      : new Array(tableProps.value?.rows);
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
            class: 'custom-table__header'
         },
         footer: {
            class: 'custom-table__footer'
         }
      }"
      v-model:filters="filterInput"
      v-model:expanded-rows="meta.expandedRows"
      v-model:expanded-row-groups="meta.expandedRowGroups"
      v-model:multi-sort-meta="meta.multiSortMeta"
      v-model:selection="selection"
      @page="(value) => onMeta(value)"
      @sort="(value) => onMeta(value)"
      v-bind="tableProps"
      selection-mode="radioButton"
      :value="tableValue"
      class="custom-table"
   >
      <template #expansion="slotProps">
         <span class="custom-table__expansion" v-bind="{ ...slotProps, loading }" />
      </template>
      <template #empty>
         <span class="custom-table__no-data" v-text="$t('no_data_found')" />
      </template>
      <template v-for="slot in _keys($slots)" #[slot]="slotProps" :key="`slot_${slot}`">
         <slot v-bind="slotProps" :name="slot" :key="`slot_${slot}`" />
      </template>
      <Column
         v-if="tableProps.selectionMode"
         :selectionMode="tableProps.selectionMode"
         class="custom-table__column--header"
      />
      <Column
         v-if="$slots.expansion && (tableProps?.frozenValue?.length || tableValue?.length)"
         field="_expansion"
         expander
         class="custom-table__column--expander"
      />
      <Column
         class="custom-table__column"
         v-for="(column, i) in columns"
         :key="'column_' + (column?.field ? column?.field + i : i) || i"
         showClearButton
         :data-type="DATA_TYPES[meta?.filters?.[column?.field]?.dataType]"
         :showFilterOperator="column?.field?.split?.('.')?.length > 1 ? false : true"
         :showFilterMenu="!!meta?.filters?.[`${column?.field}`]"
         v-bind="column"
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
                  meta?.filters?.[`${column?.field}`]?.constraints?.some?.(
                     ({ value }) => !_isNil(value)
                  ) || !_isNil(meta?.filters?.[column?.field]?.value)
                     ? `custom-table__filter-icon ${PrimeIcons.FILTER_FILL}`
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
               <Skeleton v-if="loading && !_has(body?.data, body.field)" :height="'2rem'" />
               <div
                  v-else
                  class="custom-table__cell"
                  :title="_get(body?.data, body.field)"
                  v-text="_get(body?.data, body.field)"
               />
            </slot>
         </template>
      </Column>
      <Column
         v-if="
            (actions._data?.length && (tableProps?.frozenValue?.length || tableValue?.length)) ||
            $slots.table_actions
         "
         field="_actions"
         :key="'table_action'"
         :style="
            actions._data?.length &&
            `min-width: ${actions._data?.length * 4}rem !important;
            max-width: ${actions._data?.length * 4}rem !important`
         "
      >
         <template #body="body">
            <slot name="table_actions">
               <ActionButtons :body :items="actions._data" />
            </slot>
         </template>
      </Column>
   </DataTable>
</template>
<style lang="scss">
.custom-table {
   &__header {
      @apply empty:hidden;
   }

   &__footer {
      @apply empty:hidden;
   }

   &__expansion {
      @apply z-10 relative;
   }

   &__no-data {
      @apply text-center;
   }

   &__column {
      @apply min-w-32;
      &--header {
         @apply min-w-[3rem] max-w-[3rem] w-[3rem];
      }

      &--expander {
         @apply min-w-[4rem] !max-w-[4rem] !w-[4rem] !important;
      }
   }

   &__filter-icon {
      @apply text-primary;
   }

   &__cell {
      @apply truncate;
   }
}

.p-datatable {
   &-tbody tr {
      td[rowspan] {
         @apply align-baseline;
      }
   }
   &-mask.p-overlay-mask {
      @apply bg-[rgba(250,250,250,0.1)];
   }
   &-row-expansion {
      @apply relative;
   }
}
</style>
