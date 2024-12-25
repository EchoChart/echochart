ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.tenants_users ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.app_permissions ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY allow_select_roles ON public.roles FOR
SELECT
    TO authenticated USING (TRUE);

CREATE POLICY allow_select_app_permissions ON public.app_permissions FOR
SELECT
    TO authenticated USING (TRUE);

CREATE POLICY allow_select_permissions ON public.permissions FOR
SELECT
    TO authenticated USING (TRUE);

CREATE POLICY allow_select_user_roles ON public.user_roles FOR
SELECT
    TO authenticated USING (TRUE);

GRANT usage ON SCHEMA public TO supabase_auth_admin;

GRANT
EXECUTE ON FUNCTION public.custom_access_token_hook TO supabase_auth_admin;

GRANT ALL ON TABLE public.tenants_users TO supabase_auth_admin;

CREATE POLICY "Allow auth admin to read tenant users" ON public.tenants_users FOR
SELECT
    TO supabase_auth_admin USING (TRUE);

REVOKE
EXECUTE ON FUNCTION public.custom_access_token_hook
FROM
    authenticated
  , anon
  , public;

DO $$
DECLARE
    t_name text;
BEGIN
    -- Loop through all tables in the public schema that have a 'tenant_id' column
    FOR t_name IN
        SELECT table_name
        FROM information_schema.columns
        WHERE column_name = 'tenant_id'  -- Filter tables with 'tenant_id' column
          AND table_schema = 'public'    -- Assuming tables are in 'public' schema
    LOOP
        -- Enable RLS on the table
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t_name);
        -- Create the SELECT policy using tenant_id check
        EXECUTE format('
            CREATE POLICY restrict_to_tenant ON public.%I AS RESTRICTIVE
            FOR ALL TO authenticated
            USING (
                CASE
                    WHEN (( SELECT auth.tenant_id() AS t_id) = tenant_id) THEN
                        true
                    ELSE
                        false
                END )
            WITH CHECK (
                CASE
                    WHEN (( SELECT auth.tenant_id() AS t_id) = tenant_id) THEN
                        true
                    ELSE
                        false
                END
            )', t_name);
        -- Enforce the RLS policy
        EXECUTE format('ALTER TABLE public.%I FORCE ROW LEVEL SECURITY', t_name);
        -- Log the success message
        RAISE NOTICE 'RLS enabled and policy applied for table: %', t_name;
    END LOOP;
END;
$$ LANGUAGE plpgsql;