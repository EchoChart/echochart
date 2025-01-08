CREATE
OR REPLACE FUNCTION "public"."throw_rls_policy_error" ("message" TEXT) RETURNS "pg_catalog"."bool"
SET
   "search_path" = '' AS $BODY$
DECLARE
  error_message text;
BEGIN
    error_message := 'access_denied';
    IF message IS NOT NULL THEN
      error_message := error_message || ': ' || message;
    END IF;
    RAISE EXCEPTION '%', error_message USING ERRCODE = '42501';
    RETURN false;
END;
$BODY$ LANGUAGE plpgsql STABLE COST 100;

-- Create or replace the handle_new_user function
CREATE
OR REPLACE FUNCTION private.handle_new_user () RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
SET
   search_path = '' AS $$
DECLARE
    tenant_id UUID;
    user_id UUID;
BEGIN
    BEGIN
        -- Insert into the users table
        INSERT INTO public.users (id, display_name, avatar_url, email, phone)
        VALUES (
            NEW.id
          , COALESCE(NEW.raw_user_meta_data->>'display_name', NULL)
          , COALESCE(NEW.raw_user_meta_data->>'avatar_url', NULL)
          , NEW.email
          , NEW.phone
        ) RETURNING id INTO user_id;

    EXCEPTION WHEN others THEN
        RAISE EXCEPTION 'Failed to insert new user: %', SQLERRM;
    END;

    RETURN NEW;
END;
$$;

-- Create or replace the handle_update_user function
CREATE
OR REPLACE FUNCTION private.handle_update_user () RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
SET
   search_path = '' AS $$
DECLARE
    user_id UUID;
BEGIN
    BEGIN
        -- Update the users table
        UPDATE public.users
        SET
            display_name = COALESCE(NEW.raw_user_meta_data->>'display_name', NULL)
          , avatar_url = COALESCE(NEW.raw_user_meta_data->>'avatar_url', NULL)
          , email = NEW.email
          , phone = NEW.phone
          , updated_at = now() -- optional: keep track of the update time
        WHERE id = NEW.id
        RETURNING id INTO user_id;

        -- Check if the user ID was updated
        IF NOT FOUND THEN
            RAISE EXCEPTION 'User with id % does not exist in public.users', NEW.id;
        END IF;

    EXCEPTION WHEN others THEN
        RAISE EXCEPTION 'Failed to update user: %', SQLERRM;
    END;

    RETURN NEW;
END;
$$;

-- Create or replace the handle_user_delete function
CREATE
OR REPLACE FUNCTION private.handle_user_delete () RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
SET
   search_path = '' AS $$
BEGIN
    BEGIN
    -- Delete the profile from the users table
    DELETE FROM public.users
    WHERE id = OLD.id;

    EXCEPTION WHEN others THEN
        RAISE EXCEPTION 'Failed to delete user: %', SQLERRM;
    END;

  RETURN OLD;
END;
$$;

-- Function that checks user has the exact permission for resource
CREATE
OR REPLACE FUNCTION auth.check_permission (p_resource_name TEXT, p_command TEXT) RETURNS BOOLEAN AS $$
BEGIN
    -- Check if the current user has the required permissions
    RETURN EXISTS (
        SELECT 1
        FROM public.role_permissions role_permission
        JOIN public.roles role ON role_permission.role_id = role.id
        JOIN public.user_roles user_role ON user_role.role_id = role.id
        JOIN public.permissions permission ON permission.id = role_permission.permission_id
        WHERE
            permission.resource_name = p_resource_name -- Match the resource name
            AND permission.command = p_command::permission_command         -- Match the command
            AND role_permission.permission_id = permission.id -- Ensure permission exists in role_permission
            AND (SELECT auth.uid()) = user_role.user_id -- Check if current user is associated with the role
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger function to handle policy changes based on permissions changes
CREATE
OR REPLACE FUNCTION private.manage_policies () RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
SET
   search_path = '' AS $$
DECLARE
    permission_record RECORD;
    target_resource TEXT;
    target_table TEXT;
    target_schema TEXT;
    command TEXT;
    policy_name TEXT;
    policy_clause TEXT;
    policy_error_message TEXT;
BEGIN
    -- Determine command based on trigger type
    IF TG_OP = 'INSERT' THEN
        -- Handle policy creation for new role_permissions
        permission_record := NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Handle policy update for existing role_permissions
        permission_record := NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- Handle policy deletion for removed role_permissions
        permission_record := OLD;
    END IF;

    target_resource := permission_record.resource_name;

    -- Extract the schema and table name (e.g., 'public.users')
    target_schema := split_part(target_resource, '.', 1);
    target_table := split_part(target_resource, '.', 2);


    -- Check if the table exists
    IF EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = target_schema
        AND table_name = target_table
    ) THEN
        -- Extract the command (e.g., 'select', 'insert', 'update', 'delete')
        command := permission_record.command;

        -- Construct a dynamic policy name based on the resource and command
        policy_name := target_schema || '_' || target_table || '_' || command;

        -- Handle DELETE operation (drop policy)
        IF TG_OP = 'DELETE' OR TG_OP = 'UPDATE' THEN
            -- Drop the policy if the permission is deleted
            EXECUTE format('DROP POLICY IF EXISTS %I ON %s', policy_name, target_resource);
            RAISE LOG 'Policy "%" dropped for % on command %', policy_name, target_resource, command;
        END IF;

        -- Extract policy error message
        policy_error_message := COALESCE(permission_record.error_message, format('You don''t have permission to %L %L', command, target_table));

        -- Handle INSERT operation (create policy)
        IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN

            -- Determine the appropriate clause (USING or WITH CHECK) based on the command
            IF command IN ('select', 'delete') THEN
                policy_clause := 'USING';
            ELSE
                policy_clause := 'WITH CHECK';
            END IF;

            -- Create a new policy for command
            EXECUTE format(
                'CREATE POLICY %I ON %I.%I FOR %s TO authenticated %s (
                    CASE
                        WHEN (auth.check_permission(%L, %L))
                        THEN true
                        WHEN (%L = TRUE) THEN
                            public.throw_rls_policy_error(%L)
                    END
                )'
                , policy_name
                , target_schema
                , target_table
                , command
                , policy_clause
                , target_resource
                , command
                , permission_record.throws_error
                , policy_error_message
            );
            RAISE LOG 'Policy "%" created for % on %', policy_name, command, target_table;
        END IF;
    ELSE
        RAISE LOG 'Table "%" does not exist. Skipping policy operation.', target_table;
    END IF;
    RETURN NULL;
END;
$$;

-- create a helper functions to use in RLS policies
CREATE
OR REPLACE FUNCTION auth.allowed_tenants () RETURNS UUID[] SECURITY DEFINER AS $BODY$
  SELECT COALESCE(ARRAY_AGG(tenant_id), ARRAY[]::uuid[])
  FROM public.tenants_users
  WHERE user_id = (SELECT auth.uid());
$BODY$ LANGUAGE SQL STABLE COST 100;

-- Create the auth hook function
CREATE
OR REPLACE FUNCTION private.custom_access_token_hook (e jsonb) RETURNS jsonb LANGUAGE plpgsql STABLE
SET
   search_path = '' AS $$
DECLARE
    u_id uuid;
    t_id uuid;
    claims jsonb;
BEGIN
    -- Extract the 'claims' and 'user_id' from the input JSONB (e)
    claims := e->'claims';
    u_id := (e->>'user_id')::uuid;

    -- Check if 'app_metadata' exists in claims, if not, create an empty object
    IF NOT claims ? 'app_metadata' THEN
        claims := jsonb_set(claims, '{app_metadata}', '{}'::jsonb);
    END IF;

    -- Retrieve the first tenant_id for the user from tenants_users
    SELECT COALESCE((SELECT tenant_id
                     FROM public.tenants_users
                     WHERE user_id = u_id
                     LIMIT 1), NULL)
    INTO t_id;

    -- Set the 'tenant_id' in the 'app_metadata' field
    IF t_id IS NOT NULL THEN
        claims := jsonb_set(claims, '{app_metadata,tenant_id}', to_jsonb(t_id));
    END IF;

    -- Update the 'claims' field in the original e JSONB
    e := jsonb_set(e, '{claims}', claims);

    -- Return the modified e
    RETURN e;
END;
$$;

CREATE
OR REPLACE FUNCTION auth.tenant_id () RETURNS UUID SECURITY DEFINER AS $BODY$
DECLARE
   tenant_id UUID := NULL;
   header_tenant TEXT := NULL;
   header_tenant_id UUID := NULL;
BEGIN
    -- Attempt to get tenant_id from JWT claims
    BEGIN
        SELECT COALESCE(
            (NULLIF(current_setting('request.jwt.claims', true), '')::jsonb->'app_metadata'->>'tenant_id')
          , NULL
        )::UUID
        INTO tenant_id;
    -- EXCEPTION
    --     WHEN others THEN
    --         tenant_id := NULL; -- Fallback to NULL if parsing fails
    END;

    -- Attempt to get tenant from headers
    BEGIN
        SELECT COALESCE(
            (NULLIF(current_setting('request.headers', true), '')::jsonb->>'x-tenant')
          , NULL
        )
        INTO header_tenant;
    EXCEPTION
        WHEN others THEN
            header_tenant := NULL; -- Fallback to NULL if parsing fails
    END;

    -- If header_tenant is not null, resolve it to a UUID
    IF header_tenant IS NOT NULL THEN
        SELECT tenant_id
        INTO header_tenant_id
        FROM public.tenants
        WHERE display_name = header_tenant;
    END IF;

    -- Check if header_tenant_id is in allowed tenants
    IF header_tenant_id IS NOT NULL AND header_tenant_id = ANY(auth.allowed_tenants()) THEN
        tenant_id := header_tenant_id;
    END IF;

    -- Return the resolved tenant_id
    RETURN tenant_id;
END;
$BODY$ LANGUAGE plpgsql STABLE COST 100;