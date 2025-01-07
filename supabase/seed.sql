WITH
   table_names AS (
      SELECT
         UNNEST(
            ARRAY[
               'public.tenants'
             , 'public.users'
             , 'public.tenants_users'
             , 'public.roles'
             , 'public.user_roles'
             , 'public.role_permissions'
            ]
         ) AS resource_name
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
   public."permissions" (resource_name, command)
SELECT
   table_names.resource_name
 , commands.command::permission_command
FROM
   table_names
   CROSS JOIN commands;

INSERT INTO
   public.tenants (display_name)
VALUES
   ('bade-gop');

INSERT INTO
   public.tenants (display_name)
VALUES
   ('bade-gop-sarigol');

INSERT INTO
   public.tenants (display_name)
VALUES
   ('bade-avcilar');