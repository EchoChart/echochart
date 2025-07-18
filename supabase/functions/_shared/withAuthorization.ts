import { AnyAbility, createMongoAbility } from 'npm:@casl/ability';
import { User } from 'npm:@supabase/supabase-js';
import { jwtDecode } from 'npm:jwt-decode';
import { corsHeaders } from './cors.ts';
import { Tables } from './database.types.ts';

export async function withAuthorization(
   req: Request,
   required: [string, string][] | ((ability: AnyAbility) => boolean),
   handler: (ability?: AnyAbility, jwt?: any) => Promise<Response>
): Promise<Response> {
   try {
      const token = req.headers.get('Authorization')?.replace('Bearer ', '');
      const jwt = token ? jwtDecode<User>(token) : null;
      const permissions = jwt?.app_metadata?.permission;
      const rules =
         permissions?.map?.(({ command, resource_name }: Tables<'permission'>) => ({
            action: command,
            subject: resource_name?.replace?.('public.', '')
         })) || [];

      if (!token) {
         return new Response(JSON.stringify({ message: 'Unauthorized' }), {
            status: 401,
            headers: corsHeaders
         });
      }

      const ability = createMongoAbility(rules);

      const isAllowed =
         typeof required === 'function'
            ? required(ability)
            : required.some(([[action, subject]]) => ability.cannot(action, subject));

      if (!isAllowed) {
         return new Response(JSON.stringify({ message: 'forbidden' }), {
            status: 403,
            headers: corsHeaders
         });
      }

      return handler(ability, jwt);
   } catch (error) {
      console.error(error);
      return new Response(JSON.stringify(error), {
         status: 500,
         headers: corsHeaders
      });
   }
}
