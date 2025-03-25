-- Tenants
CREATE TABLE
   IF NOT EXISTS public.tenant (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
      display_name TEXT NOT NULL,
      phone TEXT UNIQUE,
      email TEXT UNIQUE,
      created_at TIMESTAMP DEFAULT NOW (),
      parent_id UUID REFERENCES public.tenant (id) ON DELETE CASCADE,
      CONSTRAINT unique_tenant_display_name UNIQUE (id, display_name)
   );
CREATE INDEX tenant_display_name_idx ON public.tenant (display_name);
CREATE INDEX tenant_created_at_idx ON public.tenant (created_at);

-- Users
CREATE TABLE
   IF NOT EXISTS public.user (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
      display_name TEXT,
      avatar_url TEXT,
      email TEXT NOT NULL UNIQUE,
      phone TEXT UNIQUE,
      created_at TIMESTAMP DEFAULT NOW ()
   );
CREATE INDEX user_email_idx ON public.user (email);
CREATE INDEX user_created_at_idx ON public.user (created_at);

-- Tenant Users
CREATE TABLE
   IF NOT EXISTS public.tenant_user (
      user_id UUID NOT NULL REFERENCES public.user (id) ON DELETE CASCADE,
      tenant_id UUID NOT NULL REFERENCES public.tenant (id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT NOW (),
      PRIMARY KEY (tenant_id, user_id)
   );
CREATE INDEX tenant_user_user_id_idx ON public.tenant_user (user_id);
CREATE INDEX tenant_user_tenant_id_idx ON public.tenant_user (tenant_id);

-- Tenant Owners
CREATE TABLE
   IF NOT EXISTS public.tenant_owner (
      user_id UUID NOT NULL REFERENCES public.user (id) ON DELETE CASCADE,
      tenant_id UUID NOT NULL REFERENCES public.tenant (id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT NOW (),
      PRIMARY KEY (tenant_id, user_id)
   );
CREATE INDEX tenant_owner_user_id_idx ON public.tenant_owner (user_id);
CREATE INDEX tenant_owner_tenant_id_idx ON public.tenant_owner (tenant_id);

-- Addresses
CREATE TABLE
   IF NOT EXISTS public.address (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
      display_name TEXT NOT NULL,
      country TEXT NOT NULL,
      city TEXT NOT NULL,
      district TEXT NOT NULL,
      details TEXT,
      created_at TIMESTAMP DEFAULT NOW (),
      tenant_id UUID NOT NULL REFERENCES public.tenant (id) ON DELETE CASCADE
   );
CREATE INDEX address_tenant_id_idx ON public.address (tenant_id);
CREATE INDEX address_display_name_idx ON public.address (display_name);
CREATE INDEX address_created_at_idx ON public.address (created_at);

-- App Permissions
CREATE TABLE
   IF NOT EXISTS public.permission (
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
CREATE INDEX permission_resource_name_idx ON public.permission (resource_name);
CREATE INDEX permission_created_at_idx ON public.permission (created_at);

-- Roles
CREATE TABLE
   IF NOT EXISTS public.role (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
      display_name TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW (),
      tenant_id UUID REFERENCES public.tenant (id) ON DELETE CASCADE,
      CONSTRAINT unique_role_display_name UNIQUE (tenant_id, display_name)
   );
CREATE INDEX role_tenant_id_idx ON public.role (tenant_id);
CREATE INDEX role_created_at_idx ON public.role (created_at);

-- Role Permissions
CREATE TABLE
   IF NOT EXISTS public.role_permission (
      role_id UUID NOT NULL REFERENCES public.role (id) ON DELETE CASCADE,
      permission_id UUID NOT NULL REFERENCES public.permission (id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT NOW (),
      PRIMARY KEY (permission_id, role_id)
   );
CREATE INDEX role_permission_role_id_idx ON public.role_permission (role_id);
CREATE INDEX role_permission_permission_id_idx ON public.role_permission (permission_id);

-- User Roles
CREATE TABLE
   IF NOT EXISTS public.user_role (
      user_id UUID NOT NULL REFERENCES public.user (id) ON DELETE CASCADE,
      role_id UUID NOT NULL REFERENCES public.role (id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT NOW (),
      PRIMARY KEY (user_id, role_id)
   );
CREATE INDEX user_role_user_id_idx ON public.user_role (user_id);
CREATE INDEX user_role_role_id_idx ON public.user_role (role_id);

-- Products Table
CREATE TABLE
   IF NOT EXISTS public.product (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
      tenant_id UUID REFERENCES public.tenant (id) ON DELETE CASCADE,
      display_name TEXT UNIQUE NOT NULL,
      brand TEXT,
      description TEXT,
      created_at TIMESTAMP DEFAULT NOW (),
      CONSTRAINT unique_product_display_name UNIQUE (tenant_id, display_name)
   );
CREATE INDEX product_display_name_idx ON public.product (display_name);
CREATE INDEX product_display_name_composite_idx ON public.product (display_name, id);
CREATE INDEX product_created_at_idx ON public.product (created_at);

CREATE OR REPLACE VIEW public.product_brands AS
SELECT DISTINCT brand as display_name FROM public.product;

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
      product_id UUID NOT NULL REFERENCES public.product (id) ON DELETE CASCADE,
      category_id UUID NOT NULL REFERENCES public.product_category (id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT NOW (),
      PRIMARY KEY (product_id, category_id)
   );
CREATE INDEX product_categories_product_id_idx ON public.product_categories (product_id);
CREATE INDEX product_categories_category_id_idx ON public.product_categories (category_id);

-- Tenant Stocks Table
CREATE TABLE IF NOT EXISTS public.stock (
   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
   tenant_id UUID NOT NULL REFERENCES public.tenant(id) ON DELETE CASCADE,
   product_id UUID NOT NULL REFERENCES public.product(id) ON DELETE CASCADE,
   serial_number TEXT UNIQUE,
   barcode TEXT,
   quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0), -- Prevents division by zero
   used INTEGER NOT NULL DEFAULT 0 CHECK (used >= 0), -- Ensures valid values
   available INTEGER GENERATED ALWAYS AS 
      (CASE WHEN quantity >= used THEN quantity - used ELSE 0 END) STORED, -- Prevents negative stock
   unit_cost NUMERIC(10,3) NOT NULL CHECK (unit_cost >= 0), -- Ensures unit_cost is never negative
   total_cost NUMERIC(10,3) GENERATED ALWAYS AS 
      (CASE WHEN quantity > 0 AND unit_cost > 0 THEN unit_cost * quantity ELSE 0 END) STORED,
   currency_code CHAR(3) NOT NULL DEFAULT 'TRY' CHECK (currency_code ~ '^[A-Z]{3}$'), -- Ensures valid 3-letter currency code
   vendor TEXT,
   details TEXT,
   created_at TIMESTAMPTZ DEFAULT NOW(),

   -- Additional data integrity constraints
   CHECK (quantity >= used) -- Ensures you can't use more than you have
);

-- Indexes for performance optimization
CREATE INDEX idx_stock_tenant_id ON public.stock(tenant_id);
CREATE INDEX idx_stock_product_id ON public.stock(product_id);
CREATE INDEX idx_stock_serial_number ON public.stock(serial_number);
CREATE INDEX idx_stock_barcode ON public.stock(barcode);
CREATE INDEX idx_stock_created_at ON public.stock(created_at DESC);
CREATE INDEX idx_stock_display_name ON public.stock (tenant_id, product_id);

CREATE
OR REPLACE VIEW public.stock_view
WITH
   (security_invoker = true) AS
SELECT
   s.*,
   p.display_name,
   p.brand
FROM
   public.stock s
   JOIN public.product p ON s.product_id = p.id;

CREATE OR REPLACE VIEW public.stock_vendor AS
SELECT DISTINCT vendor as display_name FROM public.stock;
   
CREATE OR REPLACE VIEW public.stock_vendor_stat AS
SELECT 
  vendor,
  p.id as product_id,
  COUNT(*) AS total_product,
  SUM(quantity) AS total_quantity,
  SUM(available) AS total_available,
  SUM(used) AS total_used,
  SUM(unit_cost) AS total_cost,
  ROUND(AVG(unit_cost)::NUMERIC(10,3), 2) AS average_cost,
  ROUND(AVG(total_cost)::NUMERIC(10,3), 2) AS average_total_cost
FROM 
  public.product p
JOIN
  public.stock s on s.product_id = p.id
GROUP BY 
  vendor, p.id;

CREATE OR REPLACE VIEW public.stock_product_stat AS
SELECT
   p.display_name,
   p.brand,
   SUM(s.quantity) AS total_quantity,
   SUM(s.available) AS available_quantity,
   SUM(s.used) AS used_quantity,
   SUM(s.unit_cost) AS total_cost,
   ROUND(AVG(total_cost)::NUMERIC(10,3), 2) AS average_total_cost
FROM
   public.product p
JOIN
  public.stock s ON s.product_id = p.id
GROUP BY
   p.display_name, p.brand;

-- Clients Table
CREATE TABLE
   IF NOT EXISTS public.client (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
      identity_number TEXT UNIQUE NOT NULL,
      display_name TEXT NOT NULL,
      birth_date DATE NOT NULL,
      gender TEXT CHECK (gender IN ('male', 'female')),
      email TEXT UNIQUE,
      phone TEXT UNIQUE,
      nationality TEXT,
      tenant_id UUID NOT NULL REFERENCES public.tenant (id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT NOW ()
   );
CREATE INDEX client_identity_number_idx ON public.client (identity_number);
CREATE INDEX client_tenant_id_idx ON public.client (tenant_id);
CREATE INDEX client_created_at_idx ON public.client (created_at);
CREATE INDEX client_display_name_idx ON public.client (display_name);

-- Clients Addresses(address table relationship)
CREATE TABLE
   IF NOT EXISTS public.client_address (
      client_id UUID NOT NULL REFERENCES public.client (id) ON DELETE CASCADE,
      address_id UUID NOT NULL REFERENCES public.address (id) ON DELETE CASCADE,
      PRIMARY KEY (client_id, address_id)
   );
CREATE INDEX client_address_client_id_idx ON public.client_address (client_id);
CREATE INDEX client_address_address_id_idx ON public.client_address (address_id);