// app/src/lib/supabase.ts

import { CustomTableMetaEvent } from '@/components/ui/custom-table/CustomTable.vue';
import { app } from '@/main';
import { clientPersister, queryClient } from '@/plugins/tanstack-query';
import { FilterOperatorOptions } from '@primevue/core';
import { createClient, SupabaseClientOptions } from '@supabase/supabase-js';
import axios, { AxiosHeaders } from 'axios';

// Define types
type FilterMode = {
   [key: string]: (value: any, field: string) => string | null;
};

type FilterConfig = {
   operator: FilterOperatorOptions['AND'] | FilterOperatorOptions['OR'];
   dataType?: string;
   matchMode: string;
   value: any;
   constraints?: Array<{ matchMode: string; value: any }>;
};

type Filters = Record<string, FilterConfig>;

type FilterModes = {
   [key: FilterOperatorOptions['AND'] | FilterOperatorOptions['OR']]: FilterMode;
};

// FilterModes configuration
const FilterModes: FilterModes = {
   [FilterOperator.OR]: {
      ['websearch']: (value, field) => `${field}.wfts.${value}`,
      ['plain']: (value, field) => `${field}.plfts.${value}`,
      ['phrase']: (value, field) => `${field}.phfts.${value}`,
      [FilterMatchMode.STARTS_WITH]: (value, field) => `${field}.ilike.${value}*`,
      [FilterMatchMode.CONTAINS]: (value, field) => `${field}.ilike.*${value}*`,
      [FilterMatchMode.NOT_CONTAINS]: (value, field) => `${field}.not.ilike.*${value}`,
      [FilterMatchMode.ENDS_WITH]: (value, field) => `${field}.ilike.*${value}`,
      [FilterMatchMode.EQUALS]: (value, field) => `${field}.eq.${value}`,
      [FilterMatchMode.NOT_EQUALS]: (value, field) => `${field}.neq.${value}`,
      [FilterMatchMode.IN]: (value, field) => `${field}.in.(${value.join(',')})`,
      [FilterMatchMode.LESS_THAN]: (value, field) => `${field}.lt.${value}`,
      [FilterMatchMode.LESS_THAN_OR_EQUAL_TO]: (value, field) => `${field}.lte.${value}`,
      [FilterMatchMode.GREATER_THAN]: (value, field) => `${field}.gt.${value}`,
      [FilterMatchMode.GREATER_THAN_OR_EQUAL_TO]: (value, field) => `${field}.gte.${value}`,
      [FilterMatchMode.BETWEEN]: (value, field) =>
         value.length === 2 ? `and(${field}.gte.${value[0]},${field}.lte.${value[1]})` : null,
      [FilterMatchMode.DATE_IS]: (value, field) => {
         const date = useDateFormat(Date.parse(value), 'YYYY-MM-DD').value;
         return `and(${field}.gte.${date}T00:00:00.000,${field}.lte.${date}T23:59:59.999)`;
      },
      [FilterMatchMode.DATE_IS_NOT]: (value, field) => {
         const date = useDateFormat(Date.parse(value), 'YYYY-MM-DD').value;
         return `and(${field}.lte.${date}T00:00:00.000,${field}.gt.${date}T23:59:59.999)`;
      },
      [FilterMatchMode.DATE_BEFORE]: (value, field) =>
         `${field}.lt.${useDateFormat(Date.parse(value), 'YYYY-MM-DD').value}`,
      [FilterMatchMode.DATE_AFTER]: (value, field) =>
         `${field}.gt.${useDateFormat(Date.parse(value), 'YYYY-MM-DD').value}`
   },
   [FilterOperator.AND]: {
      ['websearch']: (value, field) => `${field}=wfts.${value}`,
      ['plain']: (value, field) => `${field}=plfts.${value}`,
      ['phrase']: (value, field) => `${field}=phfts.${value}`,
      [FilterMatchMode.STARTS_WITH]: (value, field) => `${field}=ilike.${value}*`,
      [FilterMatchMode.CONTAINS]: (value, field) => `${field}=ilike.*${value}*`,
      [FilterMatchMode.NOT_CONTAINS]: (value, field) => `${field}=not.ilike.*${value}`,
      [FilterMatchMode.ENDS_WITH]: (value, field) => `${field}=ilike.*${value}`,
      [FilterMatchMode.EQUALS]: (value, field) => `${field}=eq.${value}`,
      [FilterMatchMode.NOT_EQUALS]: (value, field) => `${field}=neq.${value}`,
      [FilterMatchMode.IN]: (value, field) => `${field}=in.(${value.join(',')})`,
      [FilterMatchMode.LESS_THAN]: (value, field) => `${field}=lt.${value}`,
      [FilterMatchMode.LESS_THAN_OR_EQUAL_TO]: (value, field) => `${field}=lte.${value}`,
      [FilterMatchMode.GREATER_THAN]: (value, field) => `${field}=gt.${value}`,
      [FilterMatchMode.GREATER_THAN_OR_EQUAL_TO]: (value, field) => `${field}=gte.${value}`,
      [FilterMatchMode.BETWEEN]: (value, field) =>
         value.length === 2 ? `${field}=gte.${value[0]}&${field}=lte.${value[1]}` : null,
      [FilterMatchMode.DATE_IS]: (value, field) => {
         const date = useDateFormat(Date.parse(value), 'YYYY-MM-DD').value;
         return `${field}=gte.${date}T00:00:00.000&${field}=lte.${date}T23:59:59.999`;
      },
      [FilterMatchMode.DATE_IS_NOT]: (value, field) => {
         const date = useDateFormat(Date.parse(value), 'YYYY-MM-DD').value;
         return `${field}=lte.${date}T00:00:00.000&${field}=gt.${date}T23:59:59.999`;
      },
      [FilterMatchMode.DATE_BEFORE]: (value, field) =>
         `${field}=lt.${useDateFormat(Date.parse(value), 'YYYY-MM-DD').value}`,
      [FilterMatchMode.DATE_AFTER]: (value, field) =>
         `${field}=gt.${useDateFormat(Date.parse(value), 'YYYY-MM-DD').value}`
   }
};

const getFilterQuery = (filters: Filters): string => {
   // Check if the filters object is nil or has no properties
   if (_isNil(filters) || _size(filters) <= 0) return '';
   const reducerFn = (filters: Filters): Array<any> => {
      function getFilterParts({
         field,
         dataType = 'text',
         operator,
         matchMode,
         value
      }: {
         field: string;
         dataType?: string;
         operator: FilterOperatorOptions['AND'] | FilterOperatorOptions['OR'];
         matchMode: string;
         value: any;
      }): string | null {
         // Get the filter mode based on operator and matchMode
         const filterMode = FilterModes[operator][matchMode];

         // Log a warning if the matchMode is unsupported
         if (!filterMode) {
            console.warn(`Unsupported matchMode: ${matchMode}`);
            return null;
         }

         // Return null if value is nil
         if (_isNil(value)) return null;

         // Convert numeric values to numbers and check for safe integers
         if (dataType === 'numeric') {
            value = _toNumber(value);
            if (!_isSafeInteger(value || '')) return null;
         }
         // Convert decimal values to floats and check for NaN
         if (dataType === 'decimal') {
            value = parseFloat(value);
            if (_isNaN(value)) return null;
         }
         // Check for invalid date formats
         if (dataType === 'date' && _isNaN(Date.parse(value))) return null;

         // Return null if the value is an empty array or string
         if ((_isArrayLikeObject(value) || _isString(value)) && _isEmpty(value)) return null;

         // Get the filter parts using the filter mode function
         let filterParts = filterMode(value, field);

         // Return null if filter parts are invalid
         if (!filterParts || filterParts.includes(null)) {
            return null;
         }

         return filterParts;
      }

      // Process each key-value pair in the filters object
      return _toPairs(filters).reduce(
         (acc: Array<any>, [field, { operator, dataType, matchMode, value, constraints }]) => {
            // Replace commas with dots in string values
            if (!_isNil(value) && _isEmpty(value)) return acc;

            // Process the main filter part
            if (!_isNil(matchMode)) {
               const filterParts = getFilterParts({
                  field,
                  dataType,
                  operator,
                  matchMode,
                  value
               });
               if (!filterParts || filterParts.includes(null)) {
                  return acc;
               }

               acc.push(filterParts);
            }
            // Process constraints if any
            if (constraints?.length) {
               constraints?.forEach(({ matchMode, value }) => {
                  const filterParts = getFilterParts({
                     field,
                     dataType,
                     operator,
                     matchMode,
                     value
                  });
                  if (!filterParts || filterParts.includes(null)) {
                     return null;
                  }
                  acc.push(filterParts);
               });
            }
            return acc;
         },
         []
      );
   };

   // Separate filters by OR and AND operators
   const orFilters = _pickBy(filters, ({ operator }) => operator === FilterOperator.OR);
   const andFilters = _pickBy(filters, ({ operator }) => operator !== FilterOperator.OR);

   // Remove global filter from AND filters if it exists
   delete andFilters?.global;
   // Remove global filter from OR filters if it exists
   delete orFilters?.global;

   // Process global filter if it exists
   if (filters.global) {
      const { value, matchMode } = filters.global;

      // Remove the global filter from the main filters object
      delete filters.global;

      // If the global filter has a non-nil and non-empty value, process it
      if (!_isNil(value) && !_isEmpty(value))
         _toPairs(filters).forEach(([field, { dataType }]) => {
            const isNested = field?.split?.('.').length !== 1;
            if (isNested) return;

            let mode = matchMode;

            // Adjust the match mode for numeric and decimal data types
            if (dataType === 'numeric') mode = FilterMatchMode.EQUALS;
            else if (dataType === 'decimal') mode = FilterMatchMode.EQUALS;
            else if (dataType === 'date') mode = FilterMatchMode.DATE_IS;

            const targetFilters = isNested ? andFilters : orFilters;

            // Set the operator to OR
            const operator = FilterOperator.OR;

            // Add the global filter constraints to the appropriate filters object
            targetFilters[field] = {
               ...targetFilters[field],
               dataType,
               operator,
               constraints: [
                  ..._get(targetFilters[field], 'constraints', []),
                  { value, matchMode: mode }
               ]
            };
         });
   }

   // Initialize the query string
   let query = '';
   // Generate the AND filter query and append it to the main query if it exists
   const andFilterQuery = reducerFn(andFilters).join('&');
   if (_size(andFilterQuery) > 0) query += `&${andFilterQuery}`;
   // Generate the OR filter query and append it to the main query if it exists
   const orFilterQuery = reducerFn(orFilters).join(',');
   if (_size(orFilterQuery) > 0) query += `&or=(${orFilterQuery})`;

   // Return the generated query string
   return query;
};

const handleDeleteDialog = async (options: RequestInit & Request): Promise<boolean> => {
   if (_toUpper(options.method) !== 'DELETE' || options.headers.has('x-delete-confirmed')) return;
   options.headers.delete('x-delete-confirmed');

   return await new Promise((resolve, reject) => {
      const item = JSON.parse(decodeURI(options.headers?.get?.('item')));

      if (item) options.headers.delete('item');

      return app.config?.globalProperties?.$confirm?.require?.({
         icon: PrimeIcons.EXCLAMATION_TRIANGLE,
         message: `${i18n.t('are_you_sure_you_want_to_delete?')}`,
         header: i18n.t('delete', { name: item?.display_name || item?.name || item?.id }),
         acceptProps: {
            label: i18n.t('yes'),
            outlined: true
         },
         rejectProps: {
            label: i18n.t('no'),
            severity: 'secondary',
            outlined: true
         },
         accept: () => resolve(true),
         reject: () => reject(i18n.t('user_cancelled_action'))
      });
   });
};

const handleMeta = (url: string | URL, options: RequestInit & Request): string | URL => {
   if (!options?.headers?.has?.('meta')) return url;

   const { filters, first, rows, multiSortMeta } = JSON.parse(
      decodeURI(options.headers?.get?.('meta'))
   );
   const filterQuery = getFilterQuery(filters);

   if (_size(filterQuery) > 0) url += `${filterQuery}`;

   if (!_isNil(first)) url += `&offset=${first}`;

   if (!_isNil(rows)) url += `&limit=${rows}`;

   if (_size(multiSortMeta) > 0) {
      const orderFilters =
         '&order=' +
         (multiSortMeta as CustomTableMetaEvent['multiSortMeta'])
            .reduce((acc, { field, order }) => {
               const nestedFormat = (field as string)
                  .split('.')
                  .reverse()
                  .reduce((acc, part) => `${part}${acc ? `(${acc})` : ''}`, '');
               const sortOrder = order < 0 ? 'desc' : 'asc';

               acc.push(`${nestedFormat}.${sortOrder}`);
               return acc;
            }, [])
            .join(',');

      url += orderFilters;
   }

   options?.headers?.delete?.('meta');
   return url;
};

const customFetch = async (
   url: string | URL,
   options: RequestInit & Request
): Promise<Response> => {
   const { currentTenant } = useAuthStore();
   const body = JSON.parse((options?.body as string) || '{}');

   url = handleMeta(url, options);

   await handleDeleteDialog(options);

   if (currentTenant?.display_name) {
      options?.headers?.set?.('x-tenant', currentTenant?.display_name);
   }

   if (
      currentTenant?.id &&
      !_isNil(body) &&
      !_isEmpty(body) &&
      !_isArray(body) &&
      !_includes(url as string, 'rpc/')
   ) {
      _merge(body, { tenant_id: currentTenant?.id });
      options.body = JSON.stringify(body) as any;
   }

   const queryFn = () =>
      axios({
         url: url.toString(),
         method: options?.method,
         headers: options?.headers as unknown as AxiosHeaders,
         data: options.body ? JSON.parse(options.body as string) : undefined,
         signal: options.signal
      });

   const { pathname, searchParams } = URL.parse(url);
   const method = _toUpper(options.method);
   const isDataUpdating =
      _includes(['POST', 'PATCH', 'DELETE', 'PUT'], method) && _startsWith(pathname, '/rest');
   const isDataFetcing = _includes(['GET', 'HEAD'], method) && _startsWith(pathname, '/rest');
   const queryFilters = _fromPairs(searchParams.entries().toArray());
   const queryKey = [pathname, queryFilters, body];
   const staleTime = isDataFetcing ? 1000 * 20 : 1000;
   const gcTime = isDataFetcing ? 1000 * 60 * 60 * 24 : 1000;
   const persister = !_isNil(window) && isDataFetcing ? clientPersister.persisterFn : undefined;

   const promise = queryClient
      .fetchQuery({
         queryKey,
         queryFn,
         persister,
         gcTime,
         staleTime
      })
      .then(async (response) => ({
         ...response,
         ok: true,
         status: response.status,
         json: async () => response.data,
         text: async () => JSON.stringify(response.data),
         headers: new Headers(response.headers as HeadersInit)
      }))
      .catch((error) => ({
         ...error,
         ok: false,
         status: error?.response?.status || 500,
         json: async () => error?.response?.data,
         text: async () => JSON.stringify(error?.response?.data),
         headers: new Headers(error?.response?.headers)
      }))
      .finally(async () => {
         if (!isDataUpdating) return;
         await queryClient.invalidateQueries({
            predicate: (query) => {
               const [sourcePath, sourceFilters, sourceBody] = queryKey as any;
               const targetBody = (query?.state?.data as any)?.data;

               _toPairs(sourceFilters).forEach(([key, value]) => {
                  key = _toLower(key);
                  if (!_endsWith(key, 'id')) return;
                  if (_has(sourceBody, key)) return;

                  const filter = _replace(value as any, /.+\./, '');
                  _set(sourceBody, key, filter);
               });

               const compareIdsDeep = (
                  source: any,
                  target: any,
                  sourceKey?: string,
                  targetKey?: string
               ): boolean => {
                  if (_isObject(source)) {
                     return _some(_toPairs(source), ([sourceKey, sourceItem]) => {
                        return compareIdsDeep(sourceItem, target, sourceKey, targetKey);
                     });
                  }

                  if (_isObject(target)) {
                     return _some(_toPairs(target), ([targetKey, targetItem]) => {
                        return compareIdsDeep(source, targetItem, sourceKey, targetKey);
                     });
                  }

                  if (!_endsWith(_toLower(sourceKey), 'id')) return false;
                  if (!_endsWith(_toLower(targetKey), 'id')) return false;
                  return _isEqual(source, target);
               };

               const dataStaled = compareIdsDeep(sourceBody, targetBody);
               return dataStaled;
            }
         });
      });

   return promise;
};

const supabaseOptions: SupabaseClientOptions<'Public'> = {
   auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false
   },
   global: {
      headers: { 'X-Custom-Header': 'MyApp' },
      fetch: customFetch as typeof fetch
   }
};

const env = (import.meta as any).env;

export const supabase = createClient(
   env.VITE_SUPABASE_PROJECT_URL,
   env.VITE_SUPABASE_PROJECT_ANON_KEY,
   supabaseOptions
);
