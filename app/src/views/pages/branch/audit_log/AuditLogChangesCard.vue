<script setup>
import { detailedDiff } from 'deep-object-diff';

/**
 * @typedef {Tables['audit_log']['Row']} Data
 * @type {{ id: Data['id'], data: Data }} */
const props = defineProps({
   data: {}
});

// Data
const rowData = _get(props.data, 'row_data', {});
const oldData = _get(props.data, 'old_data', {});

const operation = computed(() => _toLower(props.data?.operation));

const diffResult = computed(() =>
   _toLower(operation.value) === 'update' ? detailedDiff(oldData, rowData) : {}
);

const diffEntries = computed(() => {
   if (operation.value === 'insert') {
      return _toPairs(rowData).map(([key, value]) => ({
         key,
         type: 'added',
         oldValue: null,
         newValue: value
      }));
   }

   if (operation.value === 'delete') {
      return _toPairs(oldData).map(([key, value]) => ({
         key,
         type: 'deleted',
         oldValue: value,
         newValue: null
      }));
   }

   // update
   const entries = [];
   for (const [key, value] of _toPairs(diffResult.value.added)) {
      entries.push({ key, type: 'added', oldValue: null, newValue: value });
   }
   for (const [key, value] of _toPairs(diffResult.value.deleted)) {
      entries.push({ key, type: 'deleted', oldValue: value, newValue: null });
   }
   for (const [key, value] of _toPairs(diffResult.value.updated)) {
      entries.push({
         key,
         type: 'updated',
         oldValue: _get(oldData, key),
         newValue: value
      });
   }
   return entries;
});

const hasChanges = computed(() => diffEntries.value.length > 0);

function formatValue(value) {
   if (_isNil(value)) return '—';
   if (typeof value === 'object') return _toString(value);
   return value;
}
</script>

<template>
   <div class="card p-2 flex flex-wrap gap-y-2 gap-x-8" v-if="hasChanges">
      <div v-for="(entry, index) in diffEntries" :key="index">
         <div class="flex gap-2">
            <div class="font-medium text-sm">{{ entry.key }}</div>

            <div class="text-sm flex gap-2 items-center">
               <span v-if="entry.type !== 'added'" class="text-red-500">
                  {{ formatValue(entry.oldValue) }}
               </span>

               <span v-if="entry.type === 'updated'" class="text-gray-400">→</span>

               <span v-if="entry.type !== 'deleted'" class="text-green-600 font-semibold">
                  {{ formatValue(entry.newValue) }}
               </span>
            </div>
         </div>
      </div>
   </div>

   <div class="card p-2" v-else>
      <Panel header="No changes detected. Showing full data snapshot:">
         <pre>{{ JSON.stringify(rowData || oldData, null, 2) }}</pre>
      </Panel>
   </div>
</template>
