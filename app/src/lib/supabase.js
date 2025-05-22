/**
 * @file This file is responsible for configuring and creating an instance of Supabase with custom fetch behavior.
 *
 * It includes functions to handle different types of filter conditions, date formatting, confirmation dialogs for delete actions,
 * and memoization for caching API requests. The main purpose is to provide a flexible and secure way to interact with the database
 * through the Supabase client.
 */

import { app } from '@/main';
import { clientPersister, queryClient } from '@/plugins/tanstack-query';
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
   // Check if the filters object is nil or has no properties
   if (_isNil(filters) || _size(filters) <= 0) return '';

   /**
    * Reducer function to process each filter and generate query parts.
    *
    * @param {Object} filters - The filter configuration object.
    * @returns {Array} An array of filter parts or null if any part is invalid.
    */
   const reducerFn = (filters) => {
      /**
       * Helper function to get the filter parts based on field, dataType, operator, and matchMode.
       *
       * @param {Object} options - The options object containing field, dataType, operator, matchMode, value, and constraints.
       * @returns {Array|null} An array of filter parts or null if any part is invalid.
       */
      function getFilterParts({ field, dataType = 'text', operator, matchMode, value }) {
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
         let filterParts = filterMode(value, field, operator, dataType);

         // Return null if filter parts are invalid
         if (!filterParts || filterParts.includes(null)) {
            return null;
         }

         return filterParts;
      }

      // Process each key-value pair in the filters object
      return _toPairs(filters).reduce(
         (acc, [field, { operator, dataType, matchMode, value, constraints }]) => {
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

/**
 * @function handleDeleteDialog
 * Handles the delete action, including confirming with the user and preventing deletion if not confirmed.
 *
 * @param {Object} options - The fetch options object.
 * @returns {Promise<boolean>} A promise that resolves to true if deletion is confirmed, otherwise false.
 */
const handleDeleteDialog = async (options) => {
   if (_toUpper(options.method) !== 'DELETE' || options.headers.has('x-delete-confirmed')) return;

   return await new Promise((resolve, reject) => {
      const item = JSON.parse(decodeURI(options.headers?.get?.('item')));

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

/**
 * @function handleMeta
 * Modifies the URL based on pagination and sorting metadata provided in the headers.
 *
 * @param {string} url - The base URL.
 * @param {Object} options - The fetch options object.
 * @returns {string} The modified URL.
 */
const handleMeta = (url, options) => {
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

   options?.headers?.delete?.('meta');
   return url;
};

/**
 * Configuration object for the Supabase client, including a custom fetch function that handles memoization,
 * global tenant ID addition, and delete confirmation.
 * @type {import('@supabase/supabase-js').SupabaseClientOptions<Extract<keyof Db, "public">>}
 */
const options = {
   auth: {
      detectSessionInUrl: true
   },
   global: {
      fetch: async (url, options) => {
         const { currentTenant } = useAuthStore();
         const body = JSON.parse(options?.body || '{}');

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
            !_includes(url, 'rpc/')
         ) {
            _merge(body, { tenant_id: currentTenant?.id });
            options.body = JSON.stringify(body);
         }

         /**
          * Executes the query using axios and handles the response.
          * @returns {Promise<Object>} - A promise that resolves with the response from the server.
          */
         const queryFn = () =>
            axios({
               url,
               method: options?.method,
               headers: options?.headers,
               data: options.body ? JSON.parse(options.body) : undefined,
               signal: options.signal
            });

         /**@type {URL} */
         const { pathname, searchParams } = URL.parse(url);
         const method = _toUpper(options.method);
         const isDataUpdating =
            _includes(['POST', 'PATCH', 'DELETE', 'PUT'], method) && _startsWith(pathname, '/rest');
         const isDataFetcing = _includes(['GET', 'HEAD'], method) && _startsWith(pathname, '/rest');
         const queryFilters = _fromPairs(searchParams.entries().toArray());
         const queryKey = [pathname, queryFilters, body];
         const staleTime = isDataFetcing ? 1000 * 20 : 1000;
         const gcTime = isDataFetcing ? 1000 * 60 * 60 * 24 : 1000;
         const persister =
            !_isNil(window) && isDataFetcing ? clientPersister.persisterFn : undefined;

         /**
          * Fetches the query using queryClient and handles memoization.
          * @returns {Promise<Object>} - A promise that resolves with the response from the server.
          */
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
               headers: new Headers(response.headers)
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
                     const [, , sourceBody] = queryKey;
                     const targetBody = query?.state?.data?.data;

                     const compareIdsDeep = (source, target, sourceKey, targetKey) => {
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
