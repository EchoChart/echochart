import { corsHeaders } from '../_shared/cors.ts';
import { supabaseAdmin } from '../_shared/supabaseAdminClient.ts';

const supabase = supabaseAdmin();
Deno.serve(async (req) => {
   try {
      // This is needed if you're planning to invoke your function from a browser.
      if (req.method === 'OPTIONS') {
         return new Response('ok', { headers: corsHeaders });
      }

      const { account, company } = await req.json();

      const {
         data: [tenant]
      } = await supabase.from('tenants').insert(company).select().throwOnError();

      const { data: userData, error: userError } = await supabase.auth.admin.createUser({
         ...account,
         email_confirm: true
      });
      if (userError) {
         await supabase.from('tenants').delete().eq('id', tenant.id);
         throw userError;
      }
      const { user } = userData;

      await supabase
         .from('tenants_users')
         .insert({
            tenant_id: tenant.id,
            user_id: user.id
         })
         .throwOnError();

      const {
         data: [role]
      } = await supabase
         .from('roles')
         .insert({
            display_name: 'owner',
            tenant_id: tenant.id,
            is_default: true
         })
         .select()
         .throwOnError();

      await supabase
         .from('user_roles')
         .insert({
            user_id: user.id,
            role_id: role.id,
            is_default: true
         })
         .throwOnError();

      const { data: permissions } = await supabase
         .from('permissions')
         .select('id')
         .filter('resource_name', 'like', '%public.%')
         .throwOnError();

      await supabase
         .from('role_permissions')
         .insert(permissions.map((p: any) => ({ permission_id: p.id, role_id: role.id })))
         .throwOnError();

      return new Response(JSON.stringify({ user, tenant }), {
         status: 200,
         headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
   } catch (error) {
      return new Response(JSON.stringify(error), {
         status: 400,
         headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
   }
});
