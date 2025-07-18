CREATE TYPE type_permission_command AS ENUM('select', 'insert', 'update', 'delete');

CREATE TYPE type_permission_kind AS ENUM('read', 'create', 'modify');

CREATE DOMAIN valid_permission_resource AS TEXT CHECK (VALUE ~ '^[a-zA-Z_]+(\.[a-zA-Z_]+)?$');

CREATE TYPE type_stock_unit_type AS ENUM('pcs', 'kg', 'gr', 'lbs', 'L', 'mL', 'm', 'm²', 'cm', 'in');

CREATE DOMAIN valid_currency_code AS CHAR(3) CHECK (VALUE ~ '^[A-Z]{3}$');

CREATE DOMAIN valid_record_type AS TEXT CHECK (VALUE IN ('trial', 'sale', 'assemble', 'repair', 'promotion'));

CREATE TYPE type_record_repair_status AS ENUM(
   'pending',
   'approved',
   'rejected',
   'pending_client',
   'pending_service',
   'client_holds_service_bid',
   'client_approved_service_bid',
   'client_rejected_service_bid',
   'done'
);

CREATE DOMAIN valid_record_payment_type AS TEXT CHECK (VALUE IN ('cash', 'credit_card'));

CREATE DOMAIN valid_stock_quantity AS NUMERIC(10, 2) CHECK (
   CASE
      WHEN VALUE >= 0 THEN TRUE
      ELSE FALSE
   END
);

CREATE DOMAIN valid_stock_unit_cost AS NUMERIC(10, 2) CHECK (VALUE >= 0);