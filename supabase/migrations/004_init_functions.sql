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

CREATE
OR REPLACE FUNCTION private.manage_policies () RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
SET
   search_path = '' AS $$
DECLARE
    permission_record RECORD;
    target_resource TEXT;
    target_table TEXT;
    target_schema TEXT;
    kind TEXT;
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

        -- Ensure condition is not NULL or empty
        IF permission_record.resource_condition IS NULL OR trim(permission_record.resource_condition) = '' THEN
            permission_record.resource_condition := 'TRUE'; -- Default condition
        END IF;

        IF permission_record.condition IS NULL OR trim(permission_record.condition) = '' THEN
            permission_record.condition := 'TRUE'; -- Default condition
        END IF;

        -- Construct a dynamic policy name based on the resource and command
        command := permission_record.command;
        kind := permission_record.kind;
        policy_name := command || '_' || target_schema || '_' || target_table;

        -- Handle DELETE operation (drop policy)
        IF TG_OP = 'DELETE' OR TG_OP = 'UPDATE' THEN
            -- Drop the policy if the permission is deleted
            EXECUTE format('DROP POLICY IF EXISTS %I ON %s', policy_name, target_resource);
            RAISE LOG 'Policy "%" dropped for % on command %', policy_name, target_resource, command;
        END IF;

        -- Extract policy error message
        policy_error_message := COALESCE(permission_record.error_message, format('You don''t have permission to %I on %I', kind, permission_record.group_name));

        -- Handle INSERT operation (create policy)
        IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN

            -- Special case for UPDATE: using both USING and WITH CHECK clauses
            IF command = 'update' THEN
                EXECUTE format(
                    'CREATE POLICY %I ON %I.%I FOR %s TO authenticated USING (
                        CASE
                            WHEN (%s AND (SELECT auth.check_permission(%L, %L)))
                            THEN true
                            WHEN (%L = TRUE) THEN
                                public.throw_rls_policy_error(%L)
                        END
                    ) WITH CHECK (
                        CASE
                            WHEN (%s AND (SELECT auth.check_permission(%L, %L)))
                            THEN true
                            WHEN (%L = TRUE) THEN
                                public.throw_rls_policy_error(%L)
                        END
                    )'
                  , policy_name
                  , target_schema
                  , target_table
                  , command
                  , permission_record.resource_condition
                  , target_resource
                  , command
                  -- , permission_record.condition
                  , permission_record.throws_error
                  , policy_error_message
                  , permission_record.resource_condition
                  , target_resource
                  , command
                  -- , permission_record.condition
                  , permission_record.throws_error
                  , policy_error_message
                );
                RAISE LOG 'Policy "%" created for % on %', policy_name, command, target_table;
            ELSE
               -- Determine the appropriate clause (USING or WITH CHECK) based on the command
               IF command IN ('select', 'delete') THEN
                  policy_clause := 'USING';
               ELSE
                  policy_clause := 'WITH CHECK';
               END IF;

                -- Default for SELECT and DELETE
                EXECUTE format(
                    'CREATE POLICY %I ON %I.%I FOR %s TO authenticated %s (
                        CASE
                            WHEN (%s AND (SELECT auth.check_permission(%L, %L)))
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
                  , permission_record.resource_condition
                  , target_resource
                  , command
                  -- , permission_record.condition
                  , permission_record.throws_error
                  , policy_error_message
                );
                RAISE LOG 'Policy "%" created for % on %', policy_name, command, target_table;
            END IF;

        END IF;
    ELSE
        RAISE LOG 'Table "%" does not exist. Skipping policy operation.', target_table;
    END IF;
    RETURN NULL;
END;
$$;

CREATE
OR REPLACE FUNCTION auth.check_permission (p_resource_name TEXT, p_command TEXT) RETURNS BOOLEAN STABLE LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
   roles TEXT[]; -- Holds the user's roles
   permissions JSONB; -- Holds the user's permissions
   result BOOLEAN := FALSE; -- Default to no permission granted
   jwt_claims JSONB; -- Holds the JWT claims
   app_metadata JSONB;
BEGIN
    -- Retrieve JWT claims
    BEGIN
        jwt_claims := COALESCE(
            current_setting('request.jwt.claims', true)::jsonb
          , '{}'::jsonb
        );
         app_metadata := jwt_claims->'app_metadata';
    EXCEPTION
        WHEN others THEN
            -- If JWT claims are not accessible, deny permission
            RETURN FALSE;
    END;

    -- Retrieve roles from JWT claims
    BEGIN
        -- Check if 'roles' exists in 'app_metadata'
        IF app_metadata->'roles' IS NULL THEN
            RETURN FALSE;
        END IF;

        -- Check the type of the 'roles' value before casting

        -- Directly assign 'roles' as TEXT[] if it's an array
        IF jsonb_typeof(app_metadata->'roles') = 'array' THEN
            -- Convert the roles to TEXT[] and handle it directly
            roles := ARRAY(SELECT jsonb_array_elements_text(app_metadata->'roles'));
        ELSE
            RETURN FALSE;
        END IF;
    EXCEPTION
        WHEN others THEN
            RETURN FALSE;
    END;

    -- Retrieve permissions from JWT claims
    BEGIN
        permissions := COALESCE(
            app_metadata->'permissions'
          , '[]'::JSONB
        );
    EXCEPTION
        WHEN others THEN
            RETURN FALSE;
    END;

    -- Check if the user has the required permission
    result := EXISTS (
        SELECT 1
        FROM jsonb_array_elements(permissions) perm
        WHERE perm->>'resource_name' = p_resource_name
        AND perm->>'command' = p_command
    );

    RETURN result;
END;
$$;

CREATE
OR REPLACE FUNCTION auth.check_tenant_id (tenant_id UUID) RETURNS BOOLEAN STABLE LANGUAGE plpgsql SECURITY DEFINER
SET
   search_path = '' AS $$
BEGIN
   RETURN tenant_id = (SELECT auth.tenant_id());
END;
$$;

CREATE
OR REPLACE FUNCTION auth.check_allowed_tenant (tenant_id UUID) RETURNS BOOLEAN STABLE LANGUAGE plpgsql SECURITY DEFINER
SET
   search_path = '' AS $$
BEGIN
   RETURN tenant_id = ANY (auth.allowed_tenants());
END;
$$;

CREATE
OR REPLACE FUNCTION private.custom_access_token_hook (e jsonb) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER STABLE
SET
   search_path = '' AS $$
DECLARE
    u_id UUID;
    t_id UUID;
    claims JSONB;
    roles TEXT[];
    allowed_tenants JSONB;
    permissions JSONB;
BEGIN
    -- Extract 'user_id' from the input JSONB
    u_id := (e->>'user_id')::UUID;
    claims := e->'claims';

    -- Ensure 'app_metadata' exists
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

    -- Add user's roles to the token
    SELECT ARRAY_AGG(role.display_name)
    INTO roles
    FROM public.user_roles ur
    JOIN public.roles role ON role.id = ur.role_id
    WHERE ur.user_id = u_id;

    IF roles IS NOT NULL THEN
        claims := jsonb_set(claims, '{app_metadata,roles}', to_jsonb(roles));
    END IF;

    -- Add user's permissions to the token
    SELECT JSONB_AGG(
        JSONB_BUILD_OBJECT(
            'resource_name', p.resource_name
          , 'command', p.command
        )
    )
    INTO permissions
    FROM public.user_roles ur
    JOIN public.role_permissions rp ON rp.role_id = ur.role_id
    JOIN public.permissions p ON p.id = rp.permission_id
    WHERE ur.user_id = u_id;

    IF permissions IS NOT NULL THEN
        claims := jsonb_set(claims, '{app_metadata,permissions}', permissions);
    END IF;

    -- Add user's tenants to the token
      SELECT JSONB_AGG(
        JSONB_BUILD_OBJECT(
            'id', tenant.id
          , 'display_name', tenant.display_name
        )
      )
      INTO allowed_tenants
      FROM public.tenants_users tu
      JOIN public.tenants tenant ON tenant.id = tu.tenant_id
      WHERE tu.user_id = u_id;

      IF allowed_tenants IS NOT NULL THEN
        claims := jsonb_set(claims, '{app_metadata,allowed_tenants}', to_jsonb(allowed_tenants), true);
      END IF;

    -- Update the 'claims' field in the token
    e := jsonb_set(e, '{claims}', claims);

    RETURN e;
END;
$$;

-- Create a helper function to use in RLS policies
CREATE
OR REPLACE FUNCTION auth.allowed_tenants () RETURNS UUID[] SECURITY DEFINER LANGUAGE plpgsql STABLE
SET
   search_path = '' AS $$
DECLARE
   jwt_claims JSONB;
   app_metadata JSONB;
   allowed_tenants UUID[];
BEGIN
   BEGIN
      -- Attempt to fetch JWT claims
      jwt_claims := COALESCE(
         CURRENT_SETTING('request.jwt.claims', TRUE)::JSONB
       , '{}'::JSONB
      );

      -- Extract app_metadata from JWT claims
      app_metadata := jwt_claims -> 'app_metadata';
   EXCEPTION
      WHEN OTHERS THEN
         -- If JWT claims are not accessible, return an empty UUID array
         RETURN ARRAY[]::UUID[];
   END;

   -- Extract allowed_tenants from app_metadata and convert it to UUID[]
   SELECT ARRAY(
      SELECT (tenant->>'id')::UUID
      FROM JSONB_ARRAY_ELEMENTS(app_metadata -> 'allowed_tenants') AS tenant
   )
   INTO allowed_tenants;

   -- Return the allowed_tenants or an empty UUID array if null
   RETURN COALESCE(allowed_tenants, ARRAY[]::UUID[]);
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
      EXCEPTION
         WHEN others THEN
               tenant_id := NULL; -- Fallback to NULL if parsing fails
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
        SELECT id
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