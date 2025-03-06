/**
 * @file This file is responsible for configuring and creating an instance of Supabase with custom fetch behavior.
 *
 * It includes functions to handle different types of filter conditions, date formatting, confirmation dialogs for delete actions,
 * and memoization for caching API requests. The main purpose is to provide a flexible and secure way to interact with the database
 * through the Supabase client.
 */

import { app } from '@/main';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import axios from 'axios';

/**
 * @constant FilterModes
 * @type {Object}
 * Defines how different filter conditions are translated into API query strings.
 */
const FilterModes = {
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

/**
 * @function getFilterQuery
 * Generates a query string based on the given filters.
 *
 * @param {Object} filters - The filter configuration object.
 * @returns {string} The generated query string or an empty string if no valid filters are provided.
 */
const getFilterQuery = (filters) => {
   if (_isNil(filters) || _size(filters) <= 0) return '';

   function reducerFn(filters) {
      function getFilterParts({ field, dataType = 'text', operator, matchMode, value }) {
         const filterMode = FilterModes[operator][matchMode];

         if (!filterMode) {
            console.warn(`Unsupported matchMode: ${matchMode}`);
            return null;
         }
         if (_isNil(value) || _isEmpty(value)) return null;

         if (dataType === 'numeric') {
            value = _toNumber(value);
            if (!_isSafeInteger(value || '')) return null;
         }
         if (dataType === 'decimal') {
            value = parseFloat(value);
            if (_isNaN(value)) return null;
         }
         if (dataType === 'date' && _isNaN(Date.parse(value))) return null;

         let filterParts = filterMode(value, field, operator, dataType);

         if (!filterParts || filterParts.includes(null)) {
            return null;
         }

         return filterParts;
      }

      return _toPairs(filters).reduce(
         (acc, [field, { operator, dataType, matchMode, value, constraints }]) => {
            if (_isString(value)) value = value?.replace?.(/,/g, '.');

            if (!_isNil(value) && _isEmpty(value)) return acc;

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
                  return acc.push(filterParts);
               });
            }
            return acc;
         },
         []
      );
   }

   const orFilters = _pickBy(filters, ({ operator }) => operator === FilterOperator.OR);
   const andFilters = _pickBy(filters, ({ operator }) => operator !== FilterOperator.OR);

   delete andFilters?.global;
   delete orFilters?.global;

   if (filters.global) {
      const { value, matchMode } = filters.global;

      delete filters.global;

      if (!_isNil(value) && !_isEmpty(value))
         _toPairs(filters).forEach(([field, { dataType }]) => {
            const isNested = field?.split?.('.').length !== 1;
            if (isNested) return;

            let mode = matchMode;

            if (dataType === 'numeric') mode = FilterMatchMode.EQUALS;
            else if (dataType === 'decimal') mode = FilterMatchMode.EQUALS;
            else if (dataType === 'date') mode = FilterMatchMode.DATE_IS;

            const targetFilters = isNested ? andFilters : orFilters;

            const operator = FilterOperator.OR;

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

   let query = '';
   const andFilterQuery = reducerFn(andFilters).join('&');
   const orFilterQuery = reducerFn(orFilters).join(',');
   if (_size(andFilterQuery) > 0) query += `&${andFilterQuery}`;
   if (_size(orFilterQuery) > 0) query += `&or=(${orFilterQuery})`;

   return query;
};

/**
 * @function handleDelete
 * Handles the delete action, including confirming with the user and preventing deletion if not confirmed.
 *
 * @param {Object} options - The fetch options object.
 * @returns {Promise<boolean>} A promise that resolves to true if deletion is confirmed, otherwise false.
 */
const handleDelete = async (options) => {
   const confirmed = new Promise((resolve) => {
      const item = JSON.parse(options.headers?.get?.('item'));

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
         reject: () => resolve(false)
      });
   });
   if ((await confirmed) === false) {
      throw new Error(i18n.t('user_cancelled_action'));
   }
};

/**
 * @function handleMeta
 * Modifies the URL based on pagination and sorting metadata provided in the headers.
 *
 * @param {string} url - The base URL.
 * @param {Object} options - The fetch options object.
 * @returns {string} The modified URL.
 */
const handleMeta = (url, options) => {
   const { filters, first, rows, multiSortMeta } = JSON.parse(options.headers?.get?.('meta'));
   const filterQuery = getFilterQuery(filters);

   if (_size(filterQuery) > 0) url += `${filterQuery}`;

   if (!_isNil(first)) url += `&offset=${first}`;

   if (!_isNil(rows)) url += `&limit=${rows}`;

   if (_size(multiSortMeta) > 0) {
      const orderFilters =
         '&order=' +
         multiSortMeta
            .reduce((acc, { field, order }) => {
               const nestedFormat = field
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

   options?.headers?.delete('meta');
   return url;
};

/**
 * @constant memo
 * A memoization utility to cache API requests for a certain amount of time.
 */
const memo = _memoize(() => ({}));

/**
 * @type {Object}
 * Configuration object for the Supabase client, including a custom fetch function that handles memoization,
 * global tenant ID addition, and delete confirmation.
 */
const options = {
   auth: {
      detectSessionInUrl: true
   },
   global: {
      fetch: async (url, options) => {
         if (options?.headers?.has?.('meta')) {
            url = handleMeta(url, options);
         }

         if (memo.cache.has(url)) return memo.cache.get(url);

         if (options.method === 'DELETE' && !options.headers.has('x-delete-confirmed')) {
            await handleDelete(options);
         }

         const { currentTenant } = useAuthStore();

         if (currentTenant?.display_name) {
            options?.headers?.set?.('x-tenant', currentTenant?.display_name);
         }

         const body = JSON.parse(options?.body || '{}');
         if (currentTenant?.id && !_isNil(body) && !_isEmpty(body) && !_isArray(body))
            options.body = JSON.stringify({
               tenant_id: currentTenant?.id,
               ...body
            });

         const cacheTime = 1000;

         const promise = axios({
            url,
            method: options?.method,
            headers: options?.headers,
            data: options.body ? JSON.parse(options.body) : undefined,
            signal: options.signal
         })
            .then((response) => ({
               ok: true,
               status: response.status,
               json: async () => response.data,
               text: async () => JSON.stringify(response.data),
               headers: new Headers(response.headers)
            }))
            .catch((error) => {
               memo.cache.delete(url);
               return {
                  ok: false,
                  status: error.response?.status || 500,
                  json: async () => error.response?.data,
                  text: async () => JSON.stringify(error.response?.data),
                  headers: new Headers(error.response?.headers || {}),
                  ...error
               };
            })
            .finally(() => memo.cache.has(url) && _delay(() => memo.cache.delete(url), cacheTime));

         memo.cache.set(url, promise);

         return promise;
      }
   }
};

/**
 * @type {SupabaseClient<Db>}
 */
export const supabase = import.meta.env.DEV
   ? createClient(
        import.meta.env.VITE_SUPABASE_PROJECT_URL,
        import.meta.env.VITE_SUPABASE_PROJECT_ANON_KEY,
        options
     )
   : createClient(
        import.meta.env.SUPABASE_PROJECT_URL,
        import.meta.env.SUPABASE_PROJECT_ANON_KEY,
        options
     );
