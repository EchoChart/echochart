import { createClient, SupabaseClientOptions } from 'npm:@supabase/supabase-js';
import type { Database } from './database.types.ts';
export const supabaseClient = <
   DB = Database,
   SchemaName extends string & keyof DB = 'public' extends keyof DB ? 'public' : string & keyof DB
>(
   options?: SupabaseClientOptions<SchemaName>
) =>
   createClient<DB, SchemaName>(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
         auth: {
            autoRefreshToken: false,
            persistSession: false
         },
         ...options
      }
   );

export const supabaseAdmin = <
   DB = Database,
   SchemaName extends string & keyof DB = 'public' extends keyof DB ? 'public' : string & keyof DB
>(
   options?: SupabaseClientOptions<SchemaName>
) =>
   createClient<DB, SchemaName>(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
         auth: {
            autoRefreshToken: false,
            persistSession: false
         },
         ...options
      }
   );
