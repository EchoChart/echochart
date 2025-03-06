-- Tenants
CREATE TABLE
   IF NOT EXISTS public.tenants (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
      display_name TEXT NOT NULL,
      phone TEXT UNIQUE,
      email TEXT UNIQUE,
      created_at TIMESTAMP DEFAULT NOW (),
      parent_id UUID REFERENCES public.tenants (id) ON DELETE CASCADE,
      CONSTRAINT unique_tenant_display_name UNIQUE (id, display_name)
   );
CREATE INDEX tenants_display_name_idx ON public.tenants (display_name);
CREATE INDEX tenants_created_at_idx ON public.tenants (created_at);

-- Users
CREATE TABLE
   IF NOT EXISTS public.users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
      display_name TEXT,
      avatar_url TEXT,
      email TEXT NOT NULL UNIQUE,
      phone TEXT UNIQUE,
      created_at TIMESTAMP DEFAULT NOW ()
   );
CREATE INDEX users_email_idx ON public.users (email);
CREATE INDEX users_created_at_idx ON public.users (created_at);

-- Tenant Users
CREATE TABLE
   IF NOT EXISTS public.tenants_users (
      user_id UUID NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
      tenant_id UUID NOT NULL REFERENCES public.tenants (id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT NOW (),
      PRIMARY KEY (tenant_id, user_id)
   );
CREATE INDEX tenants_users_user_id_idx ON public.tenants_users (user_id);
CREATE INDEX tenants_users_tenant_id_idx ON public.tenants_users (tenant_id);

-- Addresses
CREATE TABLE
   IF NOT EXISTS public.addresses (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
      display_name TEXT NOT NULL UNIQUE,
      country TEXT NOT NULL,
      province TEXT NOT NULL,
      district TEXT,
      neighborhood TEXT,
      street TEXT,
      avenue TEXT,
      building_number TEXT,
      floor_number TEXT,
      door_number TEXT,
      postal_code TEXT,
      phone TEXT,
      created_at TIMESTAMP DEFAULT NOW (),
      tenant_id UUID NOT NULL REFERENCES public.tenants (id) ON DELETE CASCADE
   );
CREATE INDEX addresses_tenant_id_idx ON public.addresses (tenant_id);
CREATE INDEX addresses_display_name_idx ON public.addresses (display_name);
CREATE INDEX addresses_created_at_idx ON public.addresses (created_at);

-- App Permissions
CREATE TABLE
   IF NOT EXISTS public.permissions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
      resource_name permission_resource NOT NULL,
      group_name TEXT NOT NULL,
      command permission_command NOT NULL,
      kind permission_kind NOT NULL,
      condition TEXT,
      resource_condition TEXT DEFAULT 'TRUE',
      description TEXT,
      error_message TEXT,
      throws_error BOOLEAN DEFAULT FALSE,
      bypass BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT NOW ()
   );
CREATE INDEX permissions_resource_name_idx ON public.permissions (resource_name);
CREATE INDEX permissions_created_at_idx ON public.permissions (created_at);

-- Roles
CREATE TABLE
   IF NOT EXISTS public.roles (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
      display_name TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW (),
      is_default BOOLEAN DEFAULT FALSE,
      tenant_id UUID REFERENCES public.tenants (id) ON DELETE CASCADE,
      CONSTRAINT unique_role_display_name UNIQUE (tenant_id, display_name)
   );
CREATE INDEX roles_tenant_id_idx ON public.roles (tenant_id);
CREATE INDEX roles_created_at_idx ON public.roles (created_at);

-- Role Permissions
CREATE TABLE
   IF NOT EXISTS public.role_permissions (
      role_id UUID NOT NULL REFERENCES public.roles (id) ON DELETE CASCADE,
      permission_id UUID NOT NULL REFERENCES public.permissions (id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT NOW (),
      PRIMARY KEY (permission_id, role_id)
   );
CREATE INDEX role_permissions_role_id_idx ON public.role_permissions (role_id);
CREATE INDEX role_permissions_permission_id_idx ON public.role_permissions (permission_id);

-- User Roles
CREATE TABLE
   IF NOT EXISTS public.user_roles (
      user_id UUID NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
      role_id UUID NOT NULL REFERENCES public.roles (id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT NOW (),
      PRIMARY KEY (user_id, role_id)
   );
CREATE INDEX user_roles_user_id_idx ON public.user_roles (user_id);
CREATE INDEX user_roles_role_id_idx ON public.user_roles (role_id);

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