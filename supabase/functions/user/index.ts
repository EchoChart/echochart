import lodash from 'npm:lodash';
import { corsHeaders } from '../_shared/cors.ts';
import { supabaseAdmin, supabaseClient } from '../_shared/supabaseClient.ts';
import { withAuthorization } from '../_shared/withAuthorization.ts';

Deno.serve(async (req) => {
   try {
      if (req.method === 'OPTIONS') {
         return new Response('ok', { headers: corsHeaders });
      }

      const service = supabaseAdmin();
      const supabase = supabaseClient({
         global: {
            headers: {
               Authorization: req.headers.get('Authorization')!,
               'x-tenant': req.headers.get('x-tenant')!,
               'x-tenant-id': req.headers.get('x-tenant-id')!
            }
         }
      });

      const tenant_id = req.headers.get('x-tenant-id');

      const getUser = async (req: Request, id: string) =>
         await withAuthorization(req, [['select', 'user']], async () => {
            const { data, error } = await service.auth.admin.getUserById(id!);
            if (error) throw error;
            return new Response(JSON.stringify(data), {
               status: 200,
               headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
         });

      const createUser = async (req: Request) =>
         await withAuthorization(req, [['insert', 'user']], async () => {
            try {
               const body = await req.json();
               const { email, ...rest } = body;

               let user = null;

               const { data } = await service
                  .from('user')
                  .select('*')
                  .eq('email', email!)
                  .maybeSingle();
               user = data;

               if (!data?.id) {
                  const { data } = await service.auth.admin.inviteUserByEmail(email!, {
                     data: {
                        ...rest.user_metadata
                     }
                  });
                  user = data.user;
               }

               await supabase
                  .from('tenant_user')
                  .insert({
                     user_id: user!.id,
                     tenant_id: rest.tenant_id!
                  })
                  .throwOnError();

               return new Response(JSON.stringify(user), {
                  status: 201,
                  headers: {
                     ...corsHeaders,
                     'Access-Control-Allow-Methods': 'POST',
                     'Content-Type': 'application/json'
                  }
               });
            } catch (error) {
               console.error(error);
               return new Response(JSON.stringify(error), {
                  status: 400,
                  headers: { ...corsHeaders, 'Content-Type': 'application/json' }
               });
            }
         });

      const updateUser = async (req: Request, id: string) =>
         await withAuthorization(req, [['update', 'user']], async () => {
            try {
               const body = await req.json();
               const { data, error } = await service.auth.admin.updateUserById(
                  id!,
                  lodash.omit(body, ['role'])
               );
               if (error) throw error;

               return new Response(JSON.stringify(data), {
                  status: 200,
                  headers: {
                     ...corsHeaders,
                     'Access-Control-Allow-Methods': 'PUT',
                     'Content-Type': 'application/json'
                  }
               });
            } catch (error) {
               console.error(error);
               return new Response(JSON.stringify(error), {
                  status: 400,
                  headers: { ...corsHeaders, 'Content-Type': 'application/json' }
               });
            }
         });

      const deleteUser = async (req: Request, id: string) =>
         await withAuthorization(req, [['delete', 'user']], async () => {
            try {
               const { count } = await service
                  .from('tenant_owner')
                  .select('user_id,tenant_id', {
                     count: 'exact',
                     head: true
                  })
                  .filter('user_id', 'eq', id)
                  .filter('tenant_id', 'eq', tenant_id);

               if (count)
                  return new Response(JSON.stringify({ message: 'You cannot delete owner user' }), {
                     status: 403,
                     headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                  });

               await supabase
                  .from('tenant_user')
                  .delete()
                  .filter('user_id', 'eq', id)
                  .filter('tenant_id', 'eq', tenant_id)
                  .throwOnError();

               return new Response(null, {
                  status: 204,
                  headers: {
                     ...corsHeaders,
                     'Access-Control-Allow-Methods': 'DELETE'
                  }
               });
            } catch (error) {
               console.error(error);
               return new Response(JSON.stringify(error), {
                  status: 400,
                  headers: { ...corsHeaders, 'Content-Type': 'application/json' }
               });
            }
         });

      const taskPattern = new URLPattern({ pathname: '/user/:id' });
      const matchingPath = taskPattern.exec(req.url);
      const id = matchingPath ? matchingPath.pathname.groups.id : null;

      switch (true) {
         case id && req.method === 'GET':
            return await getUser(req, id);

         case !id && req.method === 'GET':
            return new Response(JSON.stringify({ message: 'User ID Required' }), {
               status: 405,
               headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });

         case id && req.method === 'PUT':
            return await updateUser(req, id);

         case id && req.method === 'DELETE':
            return await deleteUser(req, id);

         case req.method === 'POST':
            return await createUser(req);
      }

      return new Response(JSON.stringify({ message: `Method ${req.method} Not Allowed` }), {
         status: 405,
         headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
   } catch (error) {
      console.error(error);
      return new Response(JSON.stringify(error), {
         status: 400,
         headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
   }
});
