-- Tenants
CREATE TABLE IF NOT EXISTS
   public.tenants (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid ()
    , display_name TEXT NOT NULL UNIQUE
    , phone TEXT UNIQUE
    , email TEXT UNIQUE
    , created_at TIMESTAMP DEFAULT NOW()
    , updated_at TIMESTAMP
    , parent_id UUID REFERENCES public.tenants (id) ON DELETE CASCADE
   );

-- Users
CREATE TABLE IF NOT EXISTS
   public.users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid ()
    , display_name TEXT
    , avatar_url TEXT
    , email TEXT NOT NULL UNIQUE
    , phone TEXT UNIQUE
    , created_at TIMESTAMP DEFAULT NOW()
    , updated_at TIMESTAMP
   );

-- Tenant Users
CREATE TABLE IF NOT EXISTS
   public.tenants_users (
      id UUID UNIQUE DEFAULT gen_random_uuid ()
    , tenant_id UUID NOT NULL REFERENCES public.tenants (id) ON DELETE CASCADE
    , user_id UUID NOT NULL REFERENCES public.users (id) ON DELETE CASCADE
    , PRIMARY KEY (tenant_id, user_id)
   );

-- Addresses
CREATE TABLE IF NOT EXISTS
   public.addresses (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid ()
    , display_name TEXT NOT NULL UNIQUE
    , country TEXT NOT NULL
    , province TEXT NOT NULL
    , district TEXT
    , neighborhood TEXT
    , street TEXT
    , avenue TEXT
    , building_number TEXT
    , floor_number TEXT
    , door_number TEXT
    , postal_code TEXT CHECK (postal_code ~ '^\d{5}$')
    , phone TEXT
    , tenant_id UUID NOT NULL REFERENCES public.tenants (id) ON DELETE CASCADE
   );

-- App Permissions
CREATE TABLE IF NOT EXISTS
   public.permissions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid ()
    , resource_name permission_resource NOT NULL
    , command permission_command NOT NULL
    , description TEXT
    , error_message TEXT
    , throws_error BOOLEAN DEFAULT FALSE
    , created_at TIMESTAMP DEFAULT NOW()
    , updated_at TIMESTAMP
   );

-- Roles
CREATE TABLE IF NOT EXISTS
   public.roles (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid ()
    , display_name TEXT NOT NULL
    , created_at TIMESTAMP DEFAULT NOW()
    , updated_at TIMESTAMP
    , is_default BOOLEAN DEFAULT FALSE
    , tenant_id UUID NOT NULL REFERENCES public.tenants (id) ON DELETE CASCADE
   );

-- Permissions
CREATE TABLE IF NOT EXISTS
   public.role_permissions (
      id UUID UNIQUE DEFAULT gen_random_uuid ()
    , role_id UUID NOT NULL REFERENCES public.roles (id) ON DELETE CASCADE
    , permission_id UUID NOT NULL REFERENCES public.permissions (id) ON DELETE CASCADE
    , created_at TIMESTAMP DEFAULT NOW()
    , PRIMARY KEY (permission_id, role_id)
   );

-- User Roles
CREATE TABLE IF NOT EXISTS
   public.user_roles (
      id UUID UNIQUE DEFAULT gen_random_uuid ()
    , user_id UUID NOT NULL REFERENCES public.users (id) ON DELETE CASCADE
    , role_id UUID NOT NULL REFERENCES public.roles (id) ON DELETE CASCADE
    , created_at TIMESTAMP DEFAULT NOW()
    , is_default BOOLEAN DEFAULT FALSE
    , PRIMARY KEY (user_id, role_id)
   );