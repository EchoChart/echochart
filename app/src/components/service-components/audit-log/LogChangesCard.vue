<script setup lang="ts" generic="T = Tables['audit_log']['Update']">
import Collection from '@/lib/Collection';
import { isValidDate, localeDateString } from '@/lib/dayjs';
import { detailedDiff, diff } from 'deep-object-diff';

type Log = Tables['audit_log']['Update'] & {
   changes?: {
      key?: string;
      type?: string;
      oldValue?: any;
      newValue?: any;
   }[];
};

/**
 * @typedef {Tables['audit_log']['Row']} Data
 * @type {{ id: Data['id'], data: Data }} */
const props = defineProps({
   id: {
      type: String,
      default: null
   },
   data: {
      type: Object,
      default: null
   }
});
const { t, te } = useI18n();

// Define a type for auditItemRoutes
interface AuditItemRoutes {
   [key: string]: { name: string };
}

// Initialize auditItemRoutes with the correct type
const auditItemRoutes: AuditItemRoutes = {
   role_id: { name: 'branch-role-edit' },
   role: { name: 'branch-role-edit' },
   user_id: { name: 'branch-user-manage' },
   user: { name: 'branch-user-manage' },
   client_id: { name: 'client-manage' },
   client: { name: 'client-manage' },
   address_id: { name: 'address-edit' },
   address: { name: 'address-edit' },
   record_id: { name: 'record-edit' },
   record: { name: 'record-edit' },
   stock_id: { name: 'stock-edit' },
   stock: { name: 'stock-edit' }
};

const getLogTagProps = (log: Log) => {
   switch (_toLower(log?.operation)) {
      case 'update':
         return { icon: PrimeIcons.SYNC, severity: 'info' };
      case 'delete':
         return { icon: PrimeIcons.MINUS, severity: 'danger' };
      case 'insert':
         return { icon: PrimeIcons.PLUS, severity: 'success' };
      case 'select':
         return { icon: PrimeIcons.PLUS, severity: 'secondary' };
   }
};

const getChanges = (log: Log) => {
   if (!_isObject(log)) return {};

   const omitFn = (value: any, key: string) => {
      if (['id', 'created_at', 'tenant_id'].includes(key)) return true;
      return false;
   };

   const rowData = _omitBy(_get(log, 'row_data', {}) as object, omitFn);
   const oldData = _omitBy(_get(log, 'old_data', {}) as object, omitFn);

   const operation = _toLower(log?.operation);

   if (operation === 'insert') {
      log.changes = _toPairs(rowData).map(([key, value]) => ({
         key,
         type: 'add',
         newValue: value
      }));
      return log;
   }

   if (operation === 'delete') {
      log.changes = _toPairs(oldData).map(([key, value]) => ({
         key,
         type: 'delete',
         oldValue: value
      }));
      return log;
   }

   const diffResult = detailedDiff(oldData, rowData);
   const changes = [];

   for (const [key, value] of _toPairs(diffResult?.added)) {
      changes.push({ key, type: 'add', oldValue: null, newValue: value });
   }
   for (const [key, value] of _toPairs(diffResult?.deleted)) {
      changes.push({ key, type: 'delete', oldValue: value, newValue: null });
   }
   for (const [key, newValue] of _toPairs(diffResult?.updated)) {
      let oldValue = _get(oldData, key);
      if (_isObject(newValue)) {
         oldValue = diff(_merge(_cloneDeep(_get(oldData, key)), newValue), _get(oldData, key));
      }
      changes.push({
         key,
         type: 'update',
         oldValue,
         newValue
      });
   }
   log.changes = changes;
   return log;
};

function formatValue(value: any, indentSize = 0): any {
   if (_isNil(value)) return '—';

   if (_isString(value) && isValidDate({ value })) {
      return localeDateString({ value });
   }

   // Turn object to yaml like format
   if (_isObject(value) && !_isNil(value)) {
      const indent = '\t'.repeat(indentSize);
      if (_isArray(value)) {
         return (
            value.map((item) => indent + formatValue(item, indentSize + 1)).join('\n') +
            '\t'.repeat(indentSize - 1)
         );
      }

      const entries = _keys(value).map((key) => {
         const currentValue = _get(value, key);
         const formattedValue = formatValue(currentValue, indentSize + 1);
         const formattedKey = te('fields.' + key) ? t('fields.' + key) : key;

         if (_isString(currentValue) && isValidDate({ value: currentValue })) {
            return `${indent}\n${indent}${formattedKey}: ${localeDateString({ value: currentValue })}`;
         }

         if (_isBoolean(currentValue)) {
            const booleanValue = currentValue ? '✅' : '⛔';
            return `${indent}\n${indent}${formattedKey}: ${booleanValue}`;
         }
         if (formattedValue !== '—')
            return `${indent}\n${indent}${formattedKey}: ${formattedValue}`;
      });

      return entries.join('');
   }

   return te('fields.' + value) ? t('fields.' + value) : value;
}

const log = Collection.create(getChanges(props.data));

if (props.id) {
   await supabase
      .from('audit_log')
      .select('*')
      .or(`id.eq.${props.id},correlation_id.eq.${props.id}`)
      .maybeSingle()
      .then((res) => {
         log._setDefaults(getChanges(res.data))._reset();
      });
}
</script>

<template>
   <Panel class="audit_card__panel">
      <template #header>
         <div class="audit_card__header">
            <span v-text="$t('fields.' + log?.table_name || '')" />
            <CustomLink
               v-if="
                  !log.reverted_at &&
                  log.operation !== 'DELETE' &&
                  !!auditItemRoutes[log.table_name] &&
                  !!(log.row_data as any)?.id
               "
               :to="{
                  ...auditItemRoutes[log.table_name],
                  params: { id: (log.row_data as any)?.id },
                  query: { showDialog: 'center' }
               }"
               v-slot="{ navigate }"
            >
               <Button
                  size="small"
                  variant="outlined"
                  severity="info"
                  :icon="PrimeIcons.SEARCH"
                  @click="navigate"
               />
            </CustomLink>
         </div>
      </template>
      <template #icons>
         <Tag v-bind="getLogTagProps(log?._data)" />
      </template>
      <div class="audit_card__changes-container" v-if="_size(log.changes) > 0">
         <div v-for="(entry, i) in log?.changes" :key="log?.id + i" class="audit_card__change-item">
            <span class="audit_card__key" v-text="$t('fields.' + entry?.key || '')" />

            <div class="audit_card__value-container">
               <span v-if="entry?.type !== 'add'" class="audit_card__old-value">
                  <pre v-text="_trim(formatValue(entry?.oldValue))" />
               </span>
               <span
                  v-if="entry?.type !== 'delete'"
                  severity="success"
                  class="audit_card__new-value"
               >
                  <pre v-text="_trim(formatValue(entry?.newValue))" />
               </span>
               <CustomLink
                  v-if="
                     !log.reverted_at &&
                     (log.operation !== 'INSERT' || entry?.type !== 'delete') &&
                     !!auditItemRoutes[entry.key] &&
                     _endsWith(entry.key, '_id') &&
                     !!entry?.newValue
                  "
                  :to="{
                     ...auditItemRoutes[entry.key],
                     params: { id: entry.newValue },
                     query: { showDialog: 'center' }
                  }"
                  v-slot="{ navigate }"
               >
                  <Button
                     size="small"
                     variant="outlined"
                     severity="info"
                     :icon="PrimeIcons.SEARCH"
                     @click="navigate"
                  />
               </CustomLink>
            </div>
         </div>
      </div>
      <span v-else v-text="$t('audit_log.no_changes_detected')" class="audit_card__no-changes" />
   </Panel>
</template>

<style lang="scss">
.audit_card {
   &__header {
      @apply flex items-center gap-4;
   }

   &__changes-container {
      @apply flex gap-x-8 gap-y-4 flex-wrap;
   }

   &__change-item {
      @apply flex items-center gap-2 overflow-auto;
   }

   &__key {
      @apply font-medium text-sm;
   }

   &__value-container {
      @apply flex items-center flex-wrap gap-1 text-sm;
   }

   &__old-value {
      @apply text-red-500;
   }

   &__new-value {
      @apply font-semibold text-green-500;
   }
}
</style>
