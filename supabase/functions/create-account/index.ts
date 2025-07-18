import { corsHeaders } from '../_shared/cors.ts';
import { supabaseAdmin } from '../_shared/supabaseClient.ts';

const service = supabaseAdmin();

Deno.serve(async (req) => {
   try {
      // This is needed if you're planning to invoke your function from a browser.
      if (req.method === 'OPTIONS') {
         return new Response('ok', { headers: corsHeaders });
      }

      const { account, company } = await req.json();

      const {
         data: [tenant]
      } = await service.from('tenant').insert(company).select().throwOnError();

      const { data: userData, error: userError } = await service.auth.admin.createUser({
         ...account,
         email_confirm: true
      });
      if (userError) {
         await service.from('tenant').delete().eq('id', tenant.id);
         throw userError;
      }
      const { user } = userData;

      await service
         .from('tenant_owner')
         .insert({
            tenant_id: tenant.id,
            user_id: user.id
         })
         .throwOnError();

      await service
         .from('tenant_user')
         .insert({
            tenant_id: tenant.id,
            user_id: user.id
         })
         .throwOnError();

      return new Response(JSON.stringify({ user, tenant }), {
         status: 200,
         headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
   } catch (error) {
      return new Response(JSON.stringify(error), {
         status: 500,
         headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
   }
});
