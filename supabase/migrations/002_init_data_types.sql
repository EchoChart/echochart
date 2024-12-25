CREATE TYPE permission_type AS ENUM('select', 'insert', 'update', 'delete');

CREATE DOMAIN permission_resource AS TEXT CHECK (VALUE ~ '^[a-zA-Z_]+(\.[a-zA-Z_]+)?$');
