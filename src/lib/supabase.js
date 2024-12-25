import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * @type {SupabaseClient<Db>}
 */
export const supabase = import.meta.env.DEV
    ? createClient(
          import.meta.env.VITE_SUPABASE_PROJECT_URL,
          import.meta.env.VITE_SUPABASE_PROJECT_ANON_KEY
      )
    : createClient(import.meta.env.SUPABASE_PROJECT_URL, import.meta.env.SUPABASE_PROJECT_ANON_KEY);
