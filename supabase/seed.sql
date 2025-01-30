WITH
   resource_groups AS (
      SELECT
         *
      FROM
         (
            VALUES
               ('public.tenants', 'branches')
             , ('public.users', 'users')
             , ('public.tenants_users', 'users')
             , ('public.roles', 'roles')
             , ('public.user_roles', 'roles')
             , ('public.role_permissions', 'roles')
         ) AS t (resource_name, group_name)
   )
 , commands AS (
      SELECT
         enumlabel AS command
      FROM
         pg_enum
      WHERE
         enumtypid = 'permission_command'::regtype
   )
INSERT INTO
   public.permissions (resource_name, group_name, command, kind)
SELECT
   resource_groups.resource_name
 , resource_groups.group_name
 , commands.command::permission_command
 , CASE
      WHEN commands.command = 'select' THEN 'read'::permission_kind
      WHEN commands.command = 'insert' THEN 'create'::permission_kind
      WHEN commands.command IN ('update', 'delete') THEN 'modify'::permission_kind
   END
FROM
   resource_groups
   CROSS JOIN commands;

-- Consolidated INSERT INTO public.tenants
INSERT INTO
   public.tenants (display_name)
VALUES
   ('bade-gop')
 , ('bade-gop-sarigol')
 , ('bade-avcilar');