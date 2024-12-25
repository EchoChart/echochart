-- Tenants
CREATE TABLE IF NOT EXISTS
    public.tenants (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid ()
      , display_name TEXT NOT NULL UNIQUE
      , phone TEXT UNIQUE
      , email TEXT UNIQUE
      , created_at TIMESTAMP DEFAULT NOW()
      , updated_at TIMESTAMP
      , parent_id UUID
      , CONSTRAINT fk_parent_id FOREIGN KEY (parent_id) REFERENCES public.tenants (id) ON DELETE CASCADE
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
      , tenant_id UUID NOT NULL
      , CONSTRAINT fk_tenant_id FOREIGN KEY (tenant_id) REFERENCES public.tenants (id) ON DELETE CASCADE
    );

-- Users
CREATE TABLE IF NOT EXISTS
    public.users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid ()
      , display_name TEXT NOT NULL
      , avatar_url TEXT
      , email TEXT NOT NULL UNIQUE
      , phone TEXT UNIQUE
      , created_at TIMESTAMP DEFAULT NOW()
      , updated_at TIMESTAMP
    );

-- Tenant Users
CREATE TABLE IF NOT EXISTS
    public.tenants_users (
        tenant_id UUID NOT NULL REFERENCES public.tenants (id) ON DELETE CASCADE
      , user_id UUID NOT NULL REFERENCES public.users (id) ON DELETE CASCADE
      , PRIMARY KEY (tenant_id, user_id)
    );

-- Roles
CREATE TABLE IF NOT EXISTS
    public.roles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid ()
      , display_name TEXT NOT NULL UNIQUE
      , created_at TIMESTAMP DEFAULT NOW()
      , updated_at TIMESTAMP
      , is_default BOOLEAN DEFAULT FALSE
      , tenant_id UUID NOT NULL
      , CONSTRAINT fk_tenant_id FOREIGN KEY (tenant_id) REFERENCES public.tenants (id) ON DELETE CASCADE
    );

-- App Permissions
CREATE TABLE IF NOT EXISTS
    public.app_permissions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid ()
      , resource_name permission_resource NOT NULL
      , command permission_type NOT NULL
      , description TEXT
      , error_message TEXT
      , throws_error BOOLEAN DEFAULT FALSE
      , created_at TIMESTAMP DEFAULT NOW()
      , updated_at TIMESTAMP
    );

-- Permissions
CREATE TABLE IF NOT EXISTS
    public.permissions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid ()
      , role_id UUID NOT NULL
      , permission_id UUID NOT NULL
      , created_at TIMESTAMP DEFAULT NOW()
      , updated_at TIMESTAMP
      , CONSTRAINT fk_role_id FOREIGN KEY (role_id) REFERENCES public.roles (id) ON DELETE CASCADE
      , CONSTRAINT fk_permission_id FOREIGN KEY (permission_id) REFERENCES public.app_permissions (id) ON DELETE CASCADE
    );

-- User Roles
CREATE TABLE IF NOT EXISTS
    public.user_roles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid ()
      , user_id UUID NOT NULL
      , role_id UUID NOT NULL
      , tenant_id UUID NOT NULL
      , created_at TIMESTAMP DEFAULT NOW()
      , updated_at TIMESTAMP
      , is_default BOOLEAN DEFAULT FALSE
      , CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES public.users (id) ON DELETE CASCADE
      , CONSTRAINT fk_role_id FOREIGN KEY (role_id) REFERENCES public.roles (id) ON DELETE CASCADE
      , CONSTRAINT fk_tenant_id FOREIGN KEY (tenant_id) REFERENCES public.tenants (id) ON DELETE CASCADE
    );