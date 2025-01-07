import { createClient, SupabaseClient } from '@supabase/supabase-js';

const tenantURLRegex = /^(?:https?:\/\/)?(?<tenantId>(?!\d+\.\d+\.\d+\.\d+)[a-zA-Z0-9-]+)\./;
export const currentTenant = ref(
   _get(window.location.href.match(tenantURLRegex), 'groups.tenantId', null)
);

/**
 * @type {SupabaseClient<Db>}
 */
export const supabase = import.meta.env.DEV
   ? createClient(
        import.meta.env.VITE_SUPABASE_PROJECT_URL,
        import.meta.env.VITE_SUPABASE_PROJECT_ANON_KEY,
        {
           global: {
              headers: {
                 'x-tenant': currentTenant.value
              }
           }
        }
     )
   : createClient(import.meta.env.SUPABASE_PROJECT_URL, import.meta.env.SUPABASE_PROJECT_ANON_KEY);
