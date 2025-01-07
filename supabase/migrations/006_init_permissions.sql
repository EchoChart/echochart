ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.tenants_users ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

GRANT usage ON SCHEMA "private" TO supabase_auth_admin;

GRANT
EXECUTE ON FUNCTION private.custom_access_token_hook TO supabase_auth_admin;

GRANT ALL ON TABLE public.tenants_users TO supabase_auth_admin;

-- GRANT ALL ON TABLE public.roles TO supabase_auth_admin;
-- GRANT ALL ON TABLE public.user_roles TO supabase_auth_admin;
-- GRANT ALL ON TABLE public.role_permissions TO supabase_auth_admin;
-- GRANT ALL ON TABLE public.permissions TO supabase_auth_admin;
CREATE POLICY allow_select_permissions ON public.permissions FOR
SELECT
   TO authenticated USING (TRUE);

-- CREATE POLICY allow_select_roles ON public.roles FOR
-- SELECT
--    TO authenticated USING (TRUE);
-- CREATE POLICY allow_select_role_permissions ON public.role_permissions FOR
-- SELECT
--    TO authenticated USING (TRUE);
-- CREATE POLICY allow_select_user_roles ON public.user_roles FOR
-- SELECT
--    TO authenticated USING (TRUE);
CREATE POLICY "Allow auth admin to read tenant users" ON public.tenants_users FOR
SELECT
   TO supabase_auth_admin USING (TRUE);

DO $$
DECLARE
    t_name text;   -- Variable to hold the name of the table
    t_schema text; -- Variable to hold the schema of the table
BEGIN
    -- Loop through all tables in the public schema that have a 'tenant_id' column
    FOR t_schema, t_name IN
        SELECT table_schema, table_name
        FROM information_schema.columns
        WHERE column_name = 'tenant_id'  -- Filter for tables containing the 'tenant_id' column
    LOOP
        -- Enable Row-Level Security (RLS) on the table
        EXECUTE format('ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY;', t_schema, t_name);

        -- Drop existing policies if they exist to avoid conflicts when reapplying policies
      --   EXECUTE format('DROP POLICY IF EXISTS restrict_to_user_tenants ON %I.%I;', t_schema, t_name);
        EXECUTE format('DROP POLICY IF EXISTS restrict_to_current_tenant ON %I.%I;', t_schema, t_name);

        -- Create a policy to restrict access based on the current tenant
        EXECUTE format('
            CREATE POLICY restrict_to_current_tenant ON %I.%I
            AS RESTRICTIVE
            FOR ALL TO authenticated
            USING (
                tenant_id = (SELECT auth.tenant_id())
            )
            WITH CHECK (
                tenant_id = (SELECT auth.tenant_id())
            );', t_schema, t_name);

        -- Enforce the Row-Level Security policy to ensure strict access control
        EXECUTE format('ALTER TABLE %I.%I FORCE ROW LEVEL SECURITY;', t_schema, t_name);

        -- Log a success message indicating that RLS and policies were applied to the table
        RAISE NOTICE 'RLS enabled and policy applied for table: %', t_name;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

DROP POLICY IF EXISTS restrict_to_user_tenants ON public.tenants;

CREATE POLICY restrict_to_user_tenants ON public.tenants AS RESTRICTIVE FOR ALL TO authenticated USING (id = ANY (auth.allowed_tenants ()))
WITH
   CHECK (id = ANY (auth.allowed_tenants ()));

-- Create a row-level security policy named 'restrict_to_tenant_users' on the 'users' table
DROP POLICY IF EXISTS restrict_to_tenant_users ON public.users;

CREATE POLICY "restrict_to_tenant_users" ON public.users TO authenticated USING (
   EXISTS (
      SELECT
         1
      FROM
         tenants_users tu
      WHERE
         tu.user_id = public.users.id
         AND tu.tenant_id = (
            SELECT
               auth.tenant_id () AS tenant_id
         )
   )
)
WITH
   CHECK (
      EXISTS (
         SELECT
            1
         FROM
            tenants_users tu
         WHERE
            tu.user_id = public.users.id
            AND tu.tenant_id = ANY (auth.allowed_tenants ())
      )
   );