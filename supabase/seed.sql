-- Grant permission for select on users
INSERT INTO
    public."app_permissions" (resource_name, command)
VALUES
    ('public.users', 'select');

-- Grant permission for insert on users
INSERT INTO
    public."app_permissions" (resource_name, command)
VALUES
    ('public.users', 'insert');

-- Grant permission for update on users
INSERT INTO
    public."app_permissions" (resource_name, command)
VALUES
    ('public.users', 'update');