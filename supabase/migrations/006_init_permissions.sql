ALTER TABLE public.tenant_owner ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.permission ENABLE ROW LEVEL SECURITY;

GRANT usage ON SCHEMA "private" TO supabase_auth_admin;

GRANT
EXECUTE ON FUNCTION private.custom_access_token_hook TO supabase_auth_admin;

CREATE POLICY allow_select_permission ON public.permission FOR
SELECT
  TO authenticated USING (TRUE);

CREATE POLICY "Allow auth admin to read tenant user" ON public.tenant_user FOR
SELECT
  TO supabase_auth_admin USING (TRUE);

DO $$
DECLARE
  t_name text;
  t_schema text;
BEGIN
  -- Loop through all tables in the public schema that have a 'tenant_id' column
  FOR t_schema, t_name IN
    SELECT
      table_schema,
      table_name
    FROM
      information_schema.columns
    WHERE
      column_name = 'tenant_id'
      AND table_schema = 'public'
      AND table_name NOT IN (
        SELECT table_name
        FROM information_schema.views
        WHERE table_schema = 'public'
      )
  LOOP
    -- Enable RLS
    EXECUTE format(
      $f$ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY$f$,
      t_schema,
      t_name
    );

    -- Drop existing policies
    EXECUTE format(
      $f$DROP POLICY IF EXISTS restricts_to_current_tenant ON %I.%I$f$,
      t_schema,
      t_name
    );

    -- SELECT policy
    EXECUTE format(
      $f$CREATE POLICY restrict_selects_to_current_tenant ON %I.%I AS RESTRICTIVE FOR SELECT TO authenticated USING (tenant_id IS NULL OR tenant_id = (SELECT auth.tenant_id()))$f$,
      t_schema,
      t_name
    );

    -- INSERT policy
    EXECUTE format(
      $f$CREATE POLICY restrict_inserts_to_allowed_tenant ON %I.%I AS RESTRICTIVE FOR INSERT TO authenticated WITH CHECK (tenant_id = ANY (auth.allowed_tenant()))$f$,
      t_schema,
      t_name
    );

    -- UPDATE policy
    EXECUTE format(
      $f$CREATE POLICY restrict_updates_to_current_tenant ON %I.%I AS RESTRICTIVE FOR UPDATE TO authenticated USING (tenant_id = ANY (auth.allowed_tenant())) WITH CHECK (tenant_id = ANY (auth.allowed_tenant()))$f$,
      t_schema,
      t_name
    );

    -- DELETE policy
    EXECUTE format(
      $f$CREATE POLICY restrict_deletes_to_current_tenant ON %I.%I AS RESTRICTIVE FOR DELETE TO authenticated USING (tenant_id = (SELECT auth.tenant_id()))$f$,
      t_schema,
      t_name
    );

    -- Enforce RLS
    EXECUTE format(
      $f$ALTER TABLE %I.%I FORCE ROW LEVEL SECURITY$f$,
      t_schema,
      t_name
    );

    RAISE NOTICE $f$RLS enabled and policy applied for table: %$f$, t_name;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Tenant-specific policy
DROP POLICY IF EXISTS restrict_to_user_tenant ON public.tenant;

CREATE POLICY restrict_to_user_tenant ON public.tenant AS RESTRICTIVE FOR ALL TO authenticated USING (id = ANY (auth.allowed_tenant ()))
WITH
  CHECK (id = ANY (auth.allowed_tenant ()));

-- User-specific policy
DROP POLICY IF EXISTS restrict_to_tenant_user ON public.user;

CREATE POLICY "restrict_to_tenant" ON public.user AS RESTRICTIVE TO authenticated USING (
  EXISTS (
    SELECT
      1
    FROM
      tenant_user tu
    WHERE
      tu.user_id = public.user.id
      AND tu.tenant_id = (
        SELECT
          auth.tenant_id ()
      )
  )
)
WITH
  CHECK (
    EXISTS (
      SELECT
        1
      FROM
        tenant_user tu
      WHERE
        tu.user_id = public.user.id
        AND tu.tenant_id = (
          SELECT
            auth.tenant_id ()
        )
    )
  );
