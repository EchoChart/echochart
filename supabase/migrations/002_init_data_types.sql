CREATE TYPE permission_command AS ENUM('select', 'insert', 'update', 'delete');

CREATE TYPE permission_kind AS ENUM('read', 'create', 'modify');

CREATE DOMAIN permission_resource AS TEXT CHECK (VALUE ~ '^[a-zA-Z_]+(\.[a-zA-Z_]+)?$');