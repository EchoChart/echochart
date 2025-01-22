import { app } from '@/main';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import axios from 'axios';

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
         if (options.method === 'DELETE' && !options.headers.has('x-delete-confirmed')) {
            await handleDelete(options);
         }

         const { currentTenant } = useAuthStore();
         if (currentTenant.display_name) {
            options?.headers?.set?.('x-tenant', currentTenant.display_name);
         }

         if (currentTenant.id && !_isNil(options.body) && !_isArray(JSON.parse(options.body)))
            options.body = JSON.stringify({
               tenant_id: currentTenant.id,
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
         promise.finally(
            () =>
               memo.cache.has(url) &&
               _delay(() => memo.cache.delete(url), options.method === 'HEAD' ? 1000 * 60 : 100)
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
