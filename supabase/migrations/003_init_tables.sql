-- Tenants
CREATE TABLE IF NOT EXISTS public.tenant (
   id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
   display_name TEXT NOT NULL,
   phone TEXT UNIQUE,
   email TEXT UNIQUE,
   created_at TIMESTAMPTZ DEFAULT NOW(),
   parent_id UUID REFERENCES public.tenant (id) ON DELETE CASCADE,
   CONSTRAINT unique_tenant_display_name UNIQUE (id, display_name)
);

CREATE INDEX IF NOT EXISTS tenant_display_name_idx ON public.tenant (display_name);

CREATE INDEX IF NOT EXISTS tenant_created_at_idx ON public.tenant (created_at);

-- Users
CREATE TABLE IF NOT EXISTS public.user (
   id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
   metadata JSONB,
   email TEXT NOT NULL UNIQUE,
   phone TEXT UNIQUE,
   created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS user_email_idx ON public.user (email);

CREATE INDEX IF NOT EXISTS user_created_at_idx ON public.user (created_at);

-- Tenant Users
CREATE TABLE IF NOT EXISTS public.tenant_user (
   id UUID UNIQUE DEFAULT gen_random_uuid (),
   user_id UUID NOT NULL REFERENCES public.user (id) ON DELETE CASCADE,
   tenant_id UUID NOT NULL REFERENCES public.tenant (id) ON DELETE CASCADE,
   created_at TIMESTAMPTZ DEFAULT NOW(),
   PRIMARY KEY (tenant_id, user_id)
);

CREATE INDEX IF NOT EXISTS tenant_user_user_id_idx ON public.tenant_user (user_id);

CREATE INDEX IF NOT EXISTS tenant_user_tenant_id_idx ON public.tenant_user (tenant_id);

-- Tenant Owners
CREATE TABLE IF NOT EXISTS public.tenant_owner (
   id UUID UNIQUE DEFAULT gen_random_uuid (),
   user_id UUID NOT NULL REFERENCES public.user (id) ON DELETE CASCADE,
   tenant_id UUID NOT NULL REFERENCES public.tenant (id) ON DELETE CASCADE,
   created_at TIMESTAMPTZ DEFAULT NOW(),
   PRIMARY KEY (tenant_id, user_id)
);

CREATE INDEX IF NOT EXISTS tenant_owner_user_id_idx ON public.tenant_owner (user_id);

CREATE INDEX IF NOT EXISTS tenant_owner_tenant_id_idx ON public.tenant_owner (tenant_id);

-- Addresses
CREATE TABLE IF NOT EXISTS public.address (
   id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
   display_name TEXT NOT NULL,
   country TEXT NOT NULL,
   city TEXT NOT NULL,
   district TEXT NOT NULL,
   details TEXT,
   created_at TIMESTAMPTZ DEFAULT NOW(),
   tenant_id UUID NOT NULL REFERENCES public.tenant (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS address_tenant_id_idx ON public.address (tenant_id);

CREATE INDEX IF NOT EXISTS address_display_name_idx ON public.address (display_name);

CREATE INDEX IF NOT EXISTS address_created_at_idx ON public.address (created_at);

-- App Permissions
CREATE TABLE IF NOT EXISTS public.permission (
   id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
   resource_name PERMISSION_RESOURCE NOT NULL,
   group_name TEXT NOT NULL,
   command PERMISSION_COMMAND NOT NULL,
   kind PERMISSION_KIND NOT NULL,
   condition TEXT,
   resource_condition TEXT DEFAULT 'TRUE',
   details TEXT,
   error_message TEXT,
   throws_error BOOLEAN DEFAULT FALSE,
   bypass BOOLEAN DEFAULT FALSE,
   created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS permission_resource_name_idx ON public.permission (resource_name);

CREATE INDEX IF NOT EXISTS permission_created_at_idx ON public.permission (created_at);

-- Roles
CREATE TABLE IF NOT EXISTS public.role (
   id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
   display_name TEXT NOT NULL,
   created_at TIMESTAMPTZ DEFAULT NOW(),
   tenant_id UUID REFERENCES public.tenant (id) ON DELETE CASCADE,
   CONSTRAINT unique_role_display_name UNIQUE (tenant_id, display_name)
);

CREATE INDEX IF NOT EXISTS role_tenant_id_idx ON public.role (tenant_id);

CREATE INDEX IF NOT EXISTS role_created_at_idx ON public.role (created_at);

-- Role Permissions
CREATE TABLE IF NOT EXISTS public.role_permission (
   id UUID UNIQUE DEFAULT gen_random_uuid (),
   role_id UUID NOT NULL REFERENCES public.role (id) ON DELETE CASCADE,
   permission_id UUID NOT NULL REFERENCES public.permission (id) ON DELETE CASCADE,
   created_at TIMESTAMPTZ DEFAULT NOW(),
   PRIMARY KEY (permission_id, role_id)
);

CREATE INDEX IF NOT EXISTS role_permission_role_id_idx ON public.role_permission (role_id);

CREATE INDEX IF NOT EXISTS role_permission_permission_id_idx ON public.role_permission (permission_id);

-- User Roles
CREATE TABLE IF NOT EXISTS public.user_role (
   id UUID UNIQUE DEFAULT gen_random_uuid (),
   user_id UUID NOT NULL REFERENCES public.user (id) ON DELETE CASCADE,
   role_id UUID NOT NULL REFERENCES public.role (id) ON DELETE CASCADE,
   created_at TIMESTAMPTZ DEFAULT NOW(),
   PRIMARY KEY (user_id, role_id)
);

CREATE INDEX IF NOT EXISTS user_role_user_id_idx ON public.user_role (user_id);

CREATE INDEX IF NOT EXISTS user_role_role_id_idx ON public.user_role (role_id);

-- Products Table
CREATE TABLE IF NOT EXISTS public.product (
   id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
   tenant_id UUID REFERENCES public.tenant (id) ON DELETE CASCADE,
   display_name TEXT UNIQUE NOT NULL,
   brand TEXT,
   details TEXT,
   created_at TIMESTAMPTZ DEFAULT NOW(),
   CONSTRAINT unique_product_display_name UNIQUE (tenant_id, display_name)
);

CREATE INDEX IF NOT EXISTS product_display_name_idx ON public.product (display_name);

CREATE INDEX IF NOT EXISTS product_display_name_composite_idx ON public.product (display_name, id);

CREATE INDEX IF NOT EXISTS product_created_at_idx ON public.product (created_at);

CREATE OR REPLACE VIEW public.product_brands AS
SELECT DISTINCT
   brand AS display_name
FROM
   public.product;

-- Product Categories Table
CREATE TABLE IF NOT EXISTS public.product_category (
   id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
   display_name TEXT NOT NULL,
   details TEXT,
   created_at TIMESTAMPTZ DEFAULT NOW(),
   parent_id UUID REFERENCES public.product_category (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS product_category_display_name_idx ON public.product_category (display_name);

CREATE INDEX IF NOT EXISTS product_category_created_at_idx ON public.product_category (created_at);

-- Product Category Table (relationship)
CREATE TABLE IF NOT EXISTS public.product_categories (
   id UUID UNIQUE DEFAULT gen_random_uuid (),
   product_id UUID NOT NULL REFERENCES public.product (id) ON DELETE CASCADE,
   category_id UUID NOT NULL REFERENCES public.product_category (id) ON DELETE CASCADE,
   created_at TIMESTAMPTZ DEFAULT NOW(),
   PRIMARY KEY (product_id, category_id)
);

CREATE INDEX IF NOT EXISTS product_categories_product_id_idx ON public.product_categories (product_id);

CREATE INDEX IF NOT EXISTS product_categories_category_id_idx ON public.product_categories (category_id);

-- Tenant Stocks Table
CREATE TABLE IF NOT EXISTS public.stock (
   id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
   tenant_id UUID NOT NULL REFERENCES public.tenant (id) ON DELETE CASCADE,
   product_id UUID NOT NULL REFERENCES public.product (id) ON DELETE CASCADE,
   serial_number TEXT UNIQUE,
   barcode TEXT,
   quantity NUMERIC(10, 2) NOT NULL DEFAULT 1 CHECK (quantity > 0),
   unit_type TEXT NOT NULL CHECK (unit_type IN ('pcs', 'kg', 'gr', 'lbs', 'L', 'mL', 'm', 'm²', 'cm', 'in')) DEFAULT 'pcs',
   unit_cost NUMERIC(10, 2) NOT NULL CHECK (unit_cost >= 0),
   unit_discount NUMERIC(10, 2) NOT NULL CHECK (unit_discount <= unit_cost) DEFAULT 0,
   unit_tax NUMERIC(10, 2) NOT NULL DEFAULT 0,
   currency_code CHAR(3) NOT NULL DEFAULT 'TRY' CHECK (currency_code ~ '^[A-Z]{3}$'),
   vendor TEXT,
   details TEXT,
   stocked_at TIMESTAMPTZ DEFAULT NOW(),
   created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_stock_tenant_id ON public.stock (tenant_id);

CREATE INDEX IF NOT EXISTS idx_stock_product_id ON public.stock (product_id);

CREATE INDEX IF NOT EXISTS idx_stock_serial_number ON public.stock (serial_number);

CREATE INDEX IF NOT EXISTS idx_stock_barcode ON public.stock (barcode);

CREATE INDEX IF NOT EXISTS idx_stock_created_at ON public.stock (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_stock_stocked_at ON public.stock (stocked_at DESC);

CREATE INDEX IF NOT EXISTS idx_stock_display_name ON public.stock (tenant_id, product_id);

-- Record Table
CREATE TABLE IF NOT EXISTS public.record (
   id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
   tenant_id UUID NOT NULL REFERENCES public.tenant (id) ON DELETE CASCADE,
   client_id UUID REFERENCES public.client (id) ON DELETE CASCADE,
   stock_id UUID REFERENCES public.stock (id) ON DELETE CASCADE,
   user_id UUID REFERENCES public.user (id) ON DELETE SET NULL,
   record_type TEXT NOT NULL,
   record_status TEXT NOT NULL CHECK (record_status IN ('pending', 'approved', 'rejected', 'client_pending', 'done')),
   amount INTEGER NOT NULL CHECK (amount > 0),
   payment_type TEXT,
   bid NUMERIC(10, 3) DEFAULT 0.000,
   bid_discount NUMERIC(10, 3) DEFAULT 0.000,
   attributes JSONB,
   details TEXT,
   created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE VIEW public.stock_view
WITH
   (security_invoker = TRUE) AS
SELECT
   s.*,
   p.display_name,
   p.brand,
   COALESCE(s.quantity - used.total_used, s.quantity) AS available_quantity,
   (s.unit_cost * s.quantity)::NUMERIC(10, 3) AS total_cost
FROM
   public.stock AS s
   JOIN public.product AS p ON s.product_id = p.id
   LEFT JOIN (
      SELECT
         tenant_id,
         stock_id,
         SUM(amount) AS total_used
      FROM
         public.record
      WHERE
         record_status = 'approved'
      GROUP BY
         tenant_id,
         stock_id
   ) AS used ON s.tenant_id = used.tenant_id
   AND s.id = used.stock_id;

CREATE OR REPLACE VIEW public.stock_vendor AS
SELECT DISTINCT
   vendor AS display_name
FROM
   public.stock_view;

CREATE OR REPLACE VIEW public.stock_vendor_stat AS
SELECT
   vendor,
   p.id AS product_id,
   COUNT(*) AS total_product,
   SUM(quantity) AS total_quantity,
   SUM(unit_cost) AS total_cost,
   ROUND(AVG(unit_cost)::NUMERIC(10, 3), 2) AS average_cost,
   ROUND(AVG(total_cost)::NUMERIC(10, 3), 2) AS average_total_cost
FROM
   public.product AS p
   JOIN public.stock_view AS s ON s.product_id = p.id
GROUP BY
   vendor,
   p.id;

CREATE OR REPLACE VIEW public.stock_product_stat AS
SELECT
   p.display_name,
   p.brand,
   SUM(s.quantity) AS total_quantity,
   SUM(s.unit_cost) AS total_cost,
   ROUND(AVG(total_cost)::NUMERIC(10, 3), 2) AS average_total_cost
FROM
   public.product AS p
   JOIN public.stock_view AS s ON s.product_id = p.id
GROUP BY
   p.display_name,
   p.brand;

-- Clients Table
CREATE TABLE IF NOT EXISTS public.client (
   id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
   national_id TEXT UNIQUE NOT NULL, -- client's national national_id number
   display_name TEXT NOT NULL,
   birth_date DATE NOT NULL,
   gender TEXT CHECK (gender IN ('male', 'female')),
   email TEXT UNIQUE,
   phone TEXT UNIQUE,
   nationality TEXT,
   tenant_id UUID NOT NULL REFERENCES public.tenant (id) ON DELETE CASCADE,
   created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS client_national_id_idx ON public.client (national_id);

CREATE INDEX IF NOT EXISTS client_tenant_id_idx ON public.client (tenant_id);

CREATE INDEX IF NOT EXISTS client_created_at_idx ON public.client (created_at);

CREATE INDEX IF NOT EXISTS client_display_name_idx ON public.client (display_name);

-- Clients Addresses(address table relationship)
CREATE TABLE IF NOT EXISTS public.client_address (
   id UUID UNIQUE DEFAULT gen_random_uuid (),
   client_id UUID NOT NULL REFERENCES public.client (id) ON DELETE CASCADE,
   address_id UUID NOT NULL REFERENCES public.address (id) ON DELETE CASCADE,
   PRIMARY KEY (client_id, address_id),
   created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS client_address_client_id_idx ON public.client_address (client_id);

CREATE INDEX IF NOT EXISTS client_address_address_id_idx ON public.client_address (address_id);

CREATE VIEW public.client_address_view
WITH
   (security_invoker = TRUE) AS
SELECT
   gen_random_uuid () AS id,
   -- Generate a unique ID for the view (optional)
   -- Address fields with prefix
   a.id AS address_id,
   a.display_name AS address_display_name,
   a.country AS address_country,
   a.city AS address_city,
   a.district AS address_district,
   a.details AS address_details,
   a.created_at AS address_created_at,
   a.tenant_id AS address_tenant_id,
   -- Client fields with prefix
   c.id AS client_id,
   c.display_name AS client_display_name,
   c.national_id AS client_national_id,
   c.email AS client_email,
   c.phone AS client_phone,
   c.nationality AS client_nationality,
   c.tenant_id AS client_tenant_id,
   c.created_at AS client_created_at
FROM
   public.client AS c
   JOIN public.client_address AS ca ON c.id = ca.client_id
   JOIN public.address AS a ON a.id = ca.address_id;

-- Configuration table to track which tables have auditing enabled
CREATE TABLE IF NOT EXISTS private.audit_config (
   id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
   table_name TEXT NOT NULL UNIQUE,
   audit_enabled BOOLEAN DEFAULT FALSE,
   created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Main audit log table
CREATE TABLE IF NOT EXISTS public.audit_log (
   id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
   user_id UUID REFERENCES public.user (id),
   reverted_by UUID REFERENCES public.user (id),
   tenant_id UUID REFERENCES public.tenant (id),
   correlation_id TEXT,
   request_id UUID,
   table_schema TEXT NOT NULL,
   table_name TEXT NOT NULL,
   operation TEXT NOT NULL,
   row_data JSONB,
   old_data JSONB,
   created_at TIMESTAMPTZ DEFAULT NOW(),
   reverted BOOLEAN DEFAULT FALSE,
   reverted_at TIMESTAMPTZ DEFAULT NULL
);

CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON public.audit_log (user_id);

CREATE INDEX IF NOT EXISTS idx_audit_log_tenant_id ON public.audit_log (tenant_id);

CREATE INDEX IF NOT EXISTS idx_audit_log_correlation_id ON public.audit_log (correlation_id);

CREATE INDEX IF NOT EXISTS idx_audit_log_operation ON public.audit_log (operation);

CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON public.audit_log (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_log_row_created ON public.audit_log ((row_data ->> 'created_at'))
WHERE
   row_data IS NOT NULL
   AND row_data ->> 'created_at' IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_audit_log_old_created ON public.audit_log ((old_data ->> 'created_at'))
WHERE
   old_data IS NOT NULL
   AND old_data ->> 'created_at' IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_audit_log_row_created ON public.audit_log ((row_data ->> 'id'))
WHERE
   row_data IS NOT NULL
   AND row_data ->> 'id' IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_audit_log_old_created ON public.audit_log ((old_data ->> 'id'))
WHERE
   old_data IS NOT NULL
   AND old_data ->> 'id' IS NOT NULL;

-- Create or replace the view public.audit_log_group
CREATE OR REPLACE VIEW public.audit_log_group
WITH
   (security_invoker = TRUE) AS
SELECT DISTINCT
   ON (correlation_id) id,
   user_id,
   reverted_by,
   tenant_id,
   al.correlation_id,
   al.request_id,
   CASE
      WHEN EXISTS (
         SELECT
            1
         FROM
            public.audit_log al2
         WHERE
            al2.correlation_id = al.correlation_id
            AND al2.operation = 'INSERT'
      )
      AND EXISTS (
         SELECT
            1
         FROM
            public.audit_log al3
         WHERE
            al3.correlation_id = al.correlation_id
            AND al3.operation = 'DELETE'
      ) THEN 'UPDATE' -- Mark as UPDATE if both INSERT and DELETE operations exist
      ELSE operation -- Otherwise, retain the original operation type
   END AS operation,
   table_schema,
   table_name,
   row_data,
   created_at,
   reverted,
   reverted_at
FROM
   public.audit_log al
   -- Order by correlation_id, then by the timestamp of the row data (or current time if not available), and finally by operation type in descending order
ORDER BY
   al.correlation_id,
   COALESCE(
      NULLIF(al.row_data ->> 'created_at', '')::TIMESTAMPTZ,
      NULLIF(al.old_data ->> 'created_at', '')::TIMESTAMPTZ,
      now()::TIMESTAMPTZ
   ) ASC,
   al.operation DESC,
   CASE
      WHEN al.operation = 'DELETE' THEN 0 -- Ensure DELETE operations appear before non-DELETE operations
      ELSE 1
   END;