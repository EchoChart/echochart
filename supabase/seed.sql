INSERT INTO
   public.permissions (resource_name, group_name, command, kind, bypass, throws_error)
VALUES
   -- tenants
   ('public.tenants', 'branches', 'select', 'read', FALSE, FALSE),
   ('public.tenants', 'branches', 'insert', 'create', FALSE, FALSE),
   ('public.tenants', 'branches', 'update', 'modify', FALSE, FALSE),
   ('public.tenants', 'branches', 'delete', 'modify', FALSE, FALSE),
   ('public.users', 'users', 'select', 'read', FALSE, FALSE),
   --
   --
   -- users   
   ('public.users', 'users', 'insert', 'create', FALSE, FALSE),
   ('public.users', 'users', 'update', 'modify', FALSE, FALSE),
   ('public.users', 'users', 'delete', 'modify', FALSE, FALSE),
   --
   --
   -- tenants_users   
   ('public.tenants_users', 'users', 'select', 'read', TRUE, FALSE),
   ('public.tenants_users', 'users', 'insert', 'create', FALSE, FALSE),
   ('public.tenants_users', 'users', 'update', 'modify', FALSE, FALSE),
   ('public.tenants_users', 'users', 'delete', 'modify', FALSE, FALSE),
   ('public.roles', 'roles', 'select', 'read', FALSE, FALSE),
   --
   --
   -- roles   
   ('public.roles', 'roles', 'insert', 'create', FALSE, FALSE),
   ('public.roles', 'roles', 'update', 'modify', FALSE, FALSE),
   ('public.roles', 'roles', 'delete', 'modify', FALSE, FALSE),
   --
   --
   -- user_roles   
   ('public.user_roles', 'roles', 'select', 'read', TRUE, FALSE),
   ('public.user_roles', 'roles', 'insert', 'create', FALSE, FALSE),
   ('public.user_roles', 'roles', 'update', 'modify', FALSE, FALSE),
   ('public.user_roles', 'roles', 'delete', 'modify', FALSE, FALSE),
   --
   --
   -- role_permissions   
   ('public.role_permissions', 'roles', 'select', 'read', TRUE, FALSE),
   ('public.role_permissions', 'roles', 'insert', 'create', FALSE, FALSE),
   ('public.role_permissions', 'roles', 'update', 'modify', FALSE, FALSE),
   ('public.role_permissions', 'roles', 'delete', 'modify', FALSE, FALSE);

INSERT INTO
   public.tenants (display_name)
VALUES
   ('bade-gop'),
   ('bade-gop-sarigol'),
   ('bade-avcilar');