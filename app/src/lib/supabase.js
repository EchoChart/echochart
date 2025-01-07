import { createClient, SupabaseClient } from '@supabase/supabase-js';

const tenantURLRegex = /^(?:https?:\/\/)?(?<tenantId>(?!\d+\.\d+\.\d+\.\d+)[a-zA-Z0-9-]+)\./;
export const currentTenant = ref(
   _get(window.location.href.match(tenantURLRegex), 'groups.tenantId', null)
);

const memo = _memoize(() => ({}));
/**
 * @type {SupabaseClient<Db>}
 */
export const supabase = import.meta.env.DEV
   ? createClient(
        import.meta.env.VITE_SUPABASE_PROJECT_URL,
        import.meta.env.VITE_SUPABASE_PROJECT_ANON_KEY,
        {
           global: {
              fetch: (url, options) => {
                 if (memo.cache.has(url)) return memo.cache.get(url);

                 const promise = fetch(url, options);
                 memo.cache.set(url, promise);
                 promise.finally(() => memo.cache.has(url) && memo.cache.delete(url));

                 return promise;
              },
              headers: {
                 'x-tenant': currentTenant.value
              }
           }
        }
     )
   : createClient(import.meta.env.SUPABASE_PROJECT_URL, import.meta.env.SUPABASE_PROJECT_ANON_KEY);
