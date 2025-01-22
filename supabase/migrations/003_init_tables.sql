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

-- Users table indexes
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
    , created_at TIMESTAMP DEFAULT NOW()
    , updated_at TIMESTAMP
    , tenant_id UUID NOT NULL REFERENCES public.tenants (id) ON DELETE CASCADE
   );

-- App Permissions
CREATE TABLE IF NOT EXISTS
   public.permissions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid ()
    , resource_name permission_resource NOT NULL
    , group_name TEXT NOT NULL
    , command permission_command NOT NULL
    , kind permission_kind NOT NULL
    , condition TEXT
    , resource_condition TEXT
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
      role_id UUID NOT NULL REFERENCES public.roles (id) ON DELETE CASCADE
    , permission_id UUID NOT NULL REFERENCES public.permissions (id) ON DELETE CASCADE
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

-- Tenants Table
CREATE INDEX IF NOT EXISTS idx_tenants_display_name ON public.tenants (display_name);

CREATE INDEX IF NOT EXISTS idx_tenants_phone_email ON public.tenants (phone, email);

CREATE INDEX IF NOT EXISTS idx_tenants_parent_id ON public.tenants (parent_id);

CREATE INDEX IF NOT EXISTS idx_tenants_created_updated_at ON public.tenants (created_at, updated_at);

-- Users Table
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users (email);

CREATE INDEX IF NOT EXISTS idx_users_phone ON public.users (phone);

CREATE INDEX IF NOT EXISTS idx_users_created_updated_at ON public.users (created_at, updated_at);

-- Addresses Table
CREATE INDEX IF NOT EXISTS idx_addresses_tenant_id ON public.addresses (tenant_id);

CREATE INDEX IF NOT EXISTS idx_addresses_country_province ON public.addresses (country, province);

CREATE INDEX IF NOT EXISTS idx_addresses_postal_code ON public.addresses (postal_code);

CREATE INDEX IF NOT EXISTS idx_addresses_created_updated_at ON public.addresses (created_at, updated_at);

-- Roles Table
CREATE INDEX IF NOT EXISTS idx_roles_tenant_id_display_name ON public.roles (tenant_id, display_name);

CREATE INDEX IF NOT EXISTS idx_roles_is_default ON public.roles (is_default);

CREATE INDEX IF NOT EXISTS idx_roles_created_updated_at ON public.roles (created_at, updated_at);

-- User Roles Table
CREATE INDEX IF NOT EXISTS idx_user_roles_user_role ON public.user_roles (user_id, role_id);

CREATE INDEX IF NOT EXISTS idx_user_roles_is_default ON public.user_roles (is_default, created_at);