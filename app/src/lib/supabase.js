import { app } from '@/main';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import axios from 'axios';

const FilterModes = {
   [FilterMatchMode.STARTS_WITH]: (value) => ['like', `${value}*`],
   [FilterMatchMode.CONTAINS]: (value) => ['like', `*${value}*`],
   [FilterMatchMode.NOT_CONTAINS]: (value) => ['not.like', `*${value}*`],
   [FilterMatchMode.ENDS_WITH]: (value) => ['like', `*${value}`],
   [FilterMatchMode.EQUALS]: (value) => ['eq', value],
   [FilterMatchMode.NOT_EQUALS]: (value) => ['neq', value],
   [FilterMatchMode.IN]: (value) => ['in', `(${value.join(',')})`],
   [FilterMatchMode.LESS_THAN]: (value) => ['lt', value],
   [FilterMatchMode.LESS_THAN_OR_EQUAL_TO]: (value) => ['lte', value],
   [FilterMatchMode.GREATER_THAN]: (value) => ['gt', value],
   [FilterMatchMode.GREATER_THAN_OR_EQUAL_TO]: (value) => ['gte', value],
   [FilterMatchMode.BETWEEN]: (value) =>
      value.length === 2 ? ['gte', value[0], 'lte', value[1]] : null,
   [FilterMatchMode.DATE_IS]: (value, field) => {
      const date = useDateFormat(value, 'YYYY-MM-DD').value;
      return `${field}=gte.${date}T00:00:00.000&${field}=lte.${date}T23:59:59.999`;
   },
   [FilterMatchMode.DATE_IS_NOT]: (value, field) => {
      const date = useDateFormat(value, 'YYYY-MM-DD').value;
      return `or=(${field}.lte.${date}T00:00:00.000,and(${field}.gt.${date}T23:59:59.999))`;
   },
   [FilterMatchMode.DATE_BEFORE]: (value) => ['lte', useDateFormat(value, 'YYYY-MM-DD').value],
   [FilterMatchMode.DATE_AFTER]: (value) => ['gte', useDateFormat(value, 'YYYY-MM-DD').value]
};

// Convert filters to Supabase query format
const getFilterQuery = (filters) => {
   if (_isNil(filters) || _size(filters) <= 0) return '';

   return _toPairs(filters)
      .reduce((acc, [field, { constraints }]) => {
         const filterParts = constraints
            ?.map(({ matchMode, value }) => {
               const filterMode = FilterModes[matchMode];
               if (!filterMode) {
                  console.warn(`Unsupported matchMode: ${matchMode}`);
                  return null; // Skip unsupported matchModes
               }
               if (_isNil(value)) return null;

               const filterParts = filterMode(value, field);

               if (!filterParts || filterParts.includes(null)) {
                  return null; // Skip invalid filters
               }
               return `${_isArray(filterParts) ? `${field}=${filterParts.join`.`}` : filterParts}`;
            })
            .filter(Boolean); // Remove null/invalid entries
         if (filterParts?.length) {
            acc.push(filterParts.join('&'));
         }
         return acc;
      }, [])
      .join('&');
};

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

const memo = _memoize(() => ({}));

const options = {
   global: {
      fetch: async (url, options) => {
         if (options?.headers?.has?.('meta')) {
            const { filters, first, rows, multiSortMeta } = JSON.parse(
               options.headers?.get?.('meta')
            );
            const filterQuery = getFilterQuery(filters);
            if (_size(filterQuery) > 0) {
               url += `&${filterQuery}`;
            }
            if (!_isNil(first)) {
               url += `&offset=${first}`;
            }
            if (!_isNil(rows)) {
               url += `&limit=${rows}`;
            }

            if (_size(multiSortMeta) > 0) {
               const orderFilters =
                  '&order=' +
                  multiSortMeta.reduce((acc, { field, order }) => {
                     acc.push(`${field}.${order < 0 ? 'desc' : 'asc'}`);
                     return acc;
                  }, []).join`,`;

               url += orderFilters;
            }
            options?.headers?.delete('meta');
         }

         if (memo.cache.has(url)) return memo.cache.get(url);

         if (options.method === 'DELETE' && !options.headers.has('x-delete-confirmed')) {
            await handleDelete(options);
         }

         const { currentTenant } = useAuthStore();
         if (currentTenant?.display_name) {
            options?.headers?.set?.('x-tenant', currentTenant?.display_name);
         }

         if (currentTenant?.id && !_isNil(options.body) && !_isArray(JSON.parse(options.body)))
            options.body = JSON.stringify({
               tenant_id: currentTenant?.id,
               ...JSON.parse(options.body)
            });

         const promise = axios({
            url,
            method: options?.method,
            headers: options?.headers,
            data: options.body ? JSON.parse(options.body) : undefined
         })
            .then((response) => ({
               ok: true,
               status: response.status,
               json: async () => response.data,
               text: async () => JSON.stringify(response.data),
               headers: new Headers(response.headers) // Mimic fetch-like headers
            }))
            .catch((error) => ({
               ok: false,
               status: error.response?.status || 500,
               json: async () => error.response?.data,
               text: async () => JSON.stringify(error.response?.data),
               headers: new Headers(error.response?.headers || {})
            }));

         memo.cache.set(url, promise);

         const cacheTime = options?.headers?.get?.('prefer')?.startsWith?.('count')
            ? 1000 * 10
            : 1000;

         promise.finally(
            () => memo.cache.has(url) && _delay(() => memo.cache.delete(url), cacheTime)
         );

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
