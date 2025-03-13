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
      display_name TEXT NOT NULL,
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

-- Products Table
CREATE TABLE
   IF NOT EXISTS public.products (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
      tenant_id UUID REFERENCES public.tenants (id) ON DELETE CASCADE,
      display_name TEXT UNIQUE NOT NULL,
      brand TEXT,
      description TEXT,
      created_at TIMESTAMP DEFAULT NOW (),
      CONSTRAINT unique_product_display_name UNIQUE (tenant_id, display_name)
   );
CREATE INDEX products_display_name_idx ON public.products (display_name);
CREATE INDEX products_display_name_composite_idx ON public.products (display_name, id);
CREATE INDEX products_created_at_idx ON public.products (created_at);

CREATE OR REPLACE VIEW public.product_brands AS
SELECT DISTINCT brand as display_name FROM public.products;

-- Product Categories Table
CREATE TABLE
   IF NOT EXISTS public.product_category (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
      display_name TEXT NOT NULL,
      description TEXT,
      created_at TIMESTAMP DEFAULT NOW (),
      parent_id UUID REFERENCES public.product_category (id) ON DELETE CASCADE
   );
CREATE INDEX product_category_display_name_idx ON public.product_category (display_name);
CREATE INDEX product_category_created_at_idx ON public.product_category (created_at);

-- Product Category Table (relationship)
CREATE TABLE
   IF NOT EXISTS public.product_categories (
      product_id UUID NOT NULL REFERENCES public.products (id) ON DELETE CASCADE,
      category_id UUID NOT NULL REFERENCES public.product_category (id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT NOW (),
      PRIMARY KEY (product_id, category_id)
   );
CREATE INDEX product_categories_product_id_idx ON public.product_categories (product_id);
CREATE INDEX product_categories_category_id_idx ON public.product_categories (category_id);

-- Tenant Stocks Table
CREATE TABLE IF NOT EXISTS public.stocks (
   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
   tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
   product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
   serial_number TEXT UNIQUE,
   barcode TEXT,
   quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0), -- Prevents division by zero
   used INTEGER NOT NULL DEFAULT 0 CHECK (used >= 0), -- Ensures valid values
   available INTEGER GENERATED ALWAYS AS 
      (CASE WHEN quantity >= used THEN quantity - used ELSE 0 END) STORED, -- Prevents negative stock
   cost NUMERIC(10,2) NOT NULL CHECK (cost >= 0), -- Ensures cost is never negative
   unit_cost NUMERIC(10,2) GENERATED ALWAYS AS 
      (CASE WHEN quantity > 0 AND cost > 0 THEN cost / quantity ELSE 0 END) STORED, -- Prevents division by zero
   currency_code CHAR(3) NOT NULL DEFAULT 'TRY' CHECK (currency_code ~ '^[A-Z]{3}$'), -- Ensures valid 3-letter currency code
   vendor TEXT,
   details TEXT,
   created_at TIMESTAMPTZ DEFAULT NOW(),

   -- Additional data integrity constraints
   CHECK (quantity >= used) -- Ensures you can't use more than you have
);

-- Indexes for performance optimization
CREATE INDEX idx_stocks_tenant_id ON public.stocks(tenant_id);
CREATE INDEX idx_stocks_product_id ON public.stocks(product_id);
CREATE INDEX idx_stocks_serial_number ON public.stocks(serial_number);
CREATE INDEX idx_stocks_barcode ON public.stocks(barcode);
CREATE INDEX idx_stocks_created_at ON public.stocks(created_at DESC);
CREATE INDEX idx_stocks_display_name ON public.stocks (tenant_id, product_id);

CREATE
OR REPLACE VIEW public.stock_view
WITH
   (security_invoker = true) AS
SELECT
   s.*,
   p.display_name,
   p.brand
FROM
   public.stocks s
   JOIN public.products p ON s.product_id = p.id;

CREATE OR REPLACE VIEW public.stock_vendors AS
SELECT DISTINCT vendor as display_name FROM public.stocks;
   
CREATE OR REPLACE VIEW public.stock_vendor_stats AS
SELECT 
  vendor,
  p.id as product_id,
  COUNT(*) AS total_products,
  SUM(quantity) AS total_quantity,
  SUM(available) AS total_available,
  SUM(used) AS total_used,
  SUM(cost) AS total_cost,
  ROUND(AVG(cost)::NUMERIC(10,2), 2) AS average_cost,
  ROUND(AVG(unit_cost)::NUMERIC(10,2), 2) AS average_unit_cost
FROM 
  public.products p
JOIN
  public.stocks s on s.product_id = p.id
GROUP BY 
  vendor, p.id;

CREATE OR REPLACE VIEW public.stock_product_stats AS
SELECT
   p.display_name,
   p.brand,
   SUM(s.quantity) AS total_quantity,
   SUM(s.available) AS available_quantity,
   SUM(s.used) AS used_quantity,
   SUM(s.cost) AS total_cost,
   ROUND(AVG(unit_cost)::NUMERIC(10,2), 2) AS average_unit_cost
FROM
   public.products p
JOIN
  public.stocks s ON s.product_id = p.id
GROUP BY
   p.display_name, p.brand;

-- Clients Table
CREATE TABLE
   IF NOT EXISTS public.clients (
      id UUID UNIQUE DEFAULT gen_random_uuid (),
      identity_number TEXT UNIQUE NOT NULL,
      display_name TEXT NOT NULL,
      email TEXT UNIQUE,
      phone TEXT UNIQUE,
      nationality TEXT,
      tenant_id UUID NOT NULL REFERENCES public.tenants (id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT NOW (),
      PRIMARY KEY (identity_number)
   );
CREATE INDEX clients_tenant_id_idx ON public.clients (tenant_id);
CREATE INDEX clients_created_at_idx ON public.clients (created_at);
CREATE INDEX clients_display_name_idx ON public.clients (display_name);

-- Clients Addresses(addresses table relationship)
CREATE TABLE
   IF NOT EXISTS public.clients_addresses (
      client_id UUID NOT NULL REFERENCES public.clients (id) ON DELETE CASCADE,
      address_id UUID NOT NULL REFERENCES public.addresses (id) ON DELETE CASCADE,
      PRIMARY KEY (client_id, address_id)
   );
CREATE INDEX clients_addresses_client_id_idx ON public.clients_addresses (client_id);
CREATE INDEX clients_addresses_address_id_idx ON public.clients_addresses (address_id);