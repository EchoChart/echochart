CREATE OR REPLACE FUNCTION "public"."throw_rls_policy_error" ("message" TEXT) RETURNS "pg_catalog"."bool"
SET
    "search_path" = '' AS $$
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
$$ LANGUAGE plpgsql STABLE COST 100;

-- Create or replace the handle_new_user function
CREATE OR REPLACE FUNCTION private.handle_new_user () RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
SET
    search_path = '' AS $$
DECLARE
    tenant_id UUID;
    user_id UUID;
BEGIN
    BEGIN
        -- Insert into the user table
        INSERT INTO public.user (id, display_name, avatar_url, email, phone)
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
CREATE OR REPLACE FUNCTION private.handle_update_user () RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
SET
    search_path = '' AS $$
DECLARE
    user_id UUID;
BEGIN
    BEGIN
        -- Update the user table
        UPDATE public.user
        SET
            display_name = COALESCE(NEW.raw_user_meta_data->>'display_name', NULL)
          , avatar_url = COALESCE(NEW.raw_user_meta_data->>'avatar_url', NULL)
          , email = NEW.email
          , phone = NEW.phone
        WHERE id = NEW.id
        RETURNING id INTO user_id;

        -- Check if the user ID was updated
        IF NOT FOUND THEN
            RAISE EXCEPTION 'User with id % does not exist in public.user', NEW.id;
        END IF;

    EXCEPTION WHEN others THEN
        RAISE EXCEPTION 'Failed to update user: %', SQLERRM;
    END;

    RETURN NEW;
END;
$$;

-- Create or replace the handle_user_delete function
CREATE OR REPLACE FUNCTION private.handle_user_delete () RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
SET
    search_path = '' AS $$
BEGIN
    BEGIN
    -- Delete the profile from the user table
    DELETE FROM public.user
    WHERE id = OLD.id;

    EXCEPTION WHEN others THEN
        RAISE EXCEPTION 'Failed to delete user: %', SQLERRM;
    END;

  RETURN OLD;
END;
$$;

CREATE OR REPLACE FUNCTION delete_unreferenced_address () RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
SET
    search_path = '' AS $$
BEGIN
    DELETE FROM public.address
    WHERE id = OLD.address_id
    AND NOT EXISTS (
        SELECT 1 FROM public.client_address WHERE address_id = OLD.address_id
    );
    RETURN OLD;
END;
$$;

CREATE OR REPLACE FUNCTION private.manage_policies () RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
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
        -- Handle policy creation for new role_permission
        permission_record := NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Handle policy update for existing role_permission
        permission_record := NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- Handle policy deletion for removed role_permission
        permission_record := OLD;
    END IF;

    target_resource := permission_record.resource_name;

    -- Extract the schema and table name (e.g., 'public.user')
    target_schema := split_part(target_resource, '.', 1);
    target_table := split_part(target_resource, '.', 2);

    EXECUTE format($f$ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY$f$, target_schema, target_table);


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
            EXECUTE format($f$DROP POLICY IF EXISTS %I ON %s$f$, policy_name, target_resource);
            RAISE LOG 'Policy "%" dropped for % on command %', policy_name, target_resource, command;
        END IF;

        -- Extract policy error message
        policy_error_message := COALESCE(permission_record.error_message, format('You don''t have permission to %I on %I', kind, permission_record.group_name));

        -- Handle INSERT operation (create policy)
        IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN


            -- Special case for UPDATE: using both USING and WITH CHECK clauses
            IF command = 'update' THEN
               IF permission_record.bypass = TRUE THEN
                  EXECUTE format(
                    $f$
                        CREATE POLICY %I ON %I.%I FOR %s TO authenticated
                        USING(true) WITH CHECK (TRUE)
                    $f$
                  , policy_name
                  , target_schema
                  , target_table
                  , command
                  );
               ELSE
                  EXECUTE format(
                     $f$
                        CREATE POLICY %I ON %I.%I FOR %s TO authenticated USING (
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
                        )
                    $f$
                  , policy_name
                  , target_schema
                  , target_table
                  , command
                  , permission_record.resource_condition
                  , target_resource
                  , command
                  , permission_record.throws_error
                  , policy_error_message
                  , permission_record.resource_condition
                  , target_resource
                  , command
                  , permission_record.throws_error
                  , policy_error_message
                  );
                  RAISE LOG 'Policy "%" created for % on %', policy_name, command, target_table;
               END IF;
            ELSE
               -- Determine the appropriate clause (USING or WITH CHECK) based on the command
               IF command IN ('select', 'delete') THEN
                  policy_clause := 'USING';
               ELSE
                  policy_clause := 'WITH CHECK';
               END IF;

               IF permission_record.bypass = TRUE THEN
                  EXECUTE format(
                    $f$
                        CREATE POLICY %I ON %I.%I FOR %s TO authenticated
                        %s (TRUE)
                    $f$
                     , policy_name
                     , target_schema
                     , target_table
                     , command
                     , policy_clause
                  );
               ELSE
                  -- Default for SELECT and DELETE
                  EXECUTE format(
                    $f$
                        CREATE POLICY %I ON %I.%I FOR %s TO authenticated %s (
                        CASE
                                WHEN (%s AND (SELECT auth.check_permission(%L, %L)))
                                THEN true
                                WHEN (%L = TRUE) THEN
                                    public.throw_rls_policy_error(%L)
                        END
                        )
                    $f$
                  , policy_name
                  , target_schema
                  , target_table
                  , command
                  , policy_clause
                  , permission_record.resource_condition
                  , target_resource
                  , command
                  , permission_record.throws_error
                  , policy_error_message
                  );
                  RAISE LOG 'Policy "%" created for % on %', policy_name, command, target_table;
               END IF;
            END IF;

        END IF;
    ELSE
        RAISE LOG 'Table "%" does not exist. Skipping policy operation.', target_table;
    END IF;
    RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION auth.check_permission (p_resource_name TEXT, p_command TEXT) RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER STABLE
SET
    search_path = '' AS $$
DECLARE
   permission JSONB; -- Holds the user's permission
   jwt_claims JSONB; -- Holds the JWT claims
BEGIN
    -- Retrieve JWT claims
    BEGIN
        jwt_claims := COALESCE(
            current_setting('request.jwt.claims', true)::jsonb
          , '{}'::jsonb
        );
    EXCEPTION
        WHEN others THEN
            -- If JWT claims are not accessible, deny permission
            RETURN FALSE;
    END;

    -- Retrieve permission from JWT claims
    BEGIN
        permission := COALESCE(
            jwt_claims->'app_metadata'->'permission'
          , '[]'::JSONB
        );
    EXCEPTION
        WHEN others THEN
            RETURN FALSE;
    END;

    -- Check if the user has the required permission
    RETURN EXISTS (
        SELECT 1
        FROM jsonb_array_elements(permission) perm
        WHERE perm->>'resource_name' = p_resource_name
        AND perm->>'command' = p_command
    );
END;
$$;

CREATE OR REPLACE FUNCTION auth.check_tenant_id (tenant_id UUID) RETURNS BOOLEAN STABLE LANGUAGE plpgsql SECURITY DEFINER
SET
    search_path = '' AS $$
BEGIN
   RETURN tenant_id = (SELECT auth.tenant_id());
END;
$$;

CREATE OR REPLACE FUNCTION auth.check_allowed_tenant (tenant_id UUID) RETURNS BOOLEAN STABLE LANGUAGE plpgsql SECURITY DEFINER
SET
    search_path = '' AS $$
BEGIN
   RETURN tenant_id = ANY (auth.allowed_tenant());
END;
$$;

CREATE OR REPLACE FUNCTION private.custom_access_token_hook (e JSONB) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER STABLE
SET
    search_path = '' AS $$
DECLARE
    u_id UUID;
    t_id UUID;
    claims JSONB;
    role TEXT[];
    allowed_tenant JSONB;
    user_metadata JSONB;
    permission JSONB;
    current_tenant_id UUID;
BEGIN
    -- Extract 'user_id' from the input JSONB
    u_id := (e->>'user_id')::UUID;
    claims := e->'claims';

    -- Ensure 'app_metadata' exists
    IF NOT claims ? 'app_metadata' THEN
        claims := jsonb_set(claims, '{app_metadata}', '{}'::JSONB);
    END IF;

    -- Retrieve user_metadata from claims or auth.users if it's missing
    user_metadata := claims->'user_metadata';

    -- Add user's tenant to the token
   SELECT COALESCE(
      jsonb_agg(jsonb_build_object('id', t.id, 'display_name', t.display_name))
   , '[]'::jsonb
   )
   INTO allowed_tenant
   FROM public.tenant_user tu
   JOIN public.tenant t ON t.id = tu.tenant_id
   WHERE user_id = u_id;

    IF allowed_tenant IS NOT NULL THEN
        -- Properly convert UUID[] to JSONB before using jsonb_set
        claims := jsonb_set(claims, '{app_metadata,allowed_tenant}', to_jsonb(allowed_tenant), true);
    END IF;

   -- Retrieve tenant ID from auth.users.user_metadata or fallback to the first allowed tenant
   SELECT user_metadata->>'current_tenant_id' INTO current_tenant_id;

   -- Check if current_tenant_id is not in allowed_tenant and set the first available one
   IF current_tenant_id IS NULL OR current_tenant_id NOT IN (SELECT (value->>'id')::UUID FROM jsonb_array_elements(allowed_tenant)) THEN
      SELECT (value->>'id')::UUID
      INTO current_tenant_id
      FROM jsonb_array_elements(allowed_tenant)
      LIMIT 1;
   END IF;

    -- Set the 'current_tenant_id' in the 'app_metadata' field
    IF current_tenant_id IS NOT NULL THEN
        claims := jsonb_set(claims, '{app_metadata,current_tenant_id}', to_jsonb(current_tenant_id), true);
    END IF;

    -- Add user's role to the token
    SELECT ARRAY_AGG(role.display_name)
    INTO role
    FROM public.user_role ur
    JOIN public.role role ON role.id = ur.role_id
    WHERE ur.user_id = u_id;

    IF role IS NOT NULL THEN
        claims := jsonb_set(claims, '{app_metadata,role}', to_jsonb(role), true);
    END IF;

    -- Add user's permission to the token
    SELECT JSONB_AGG(
        JSONB_BUILD_OBJECT(
            'resource_name', p.resource_name
          , 'command', p.command
        )
    )
    INTO permission
    FROM public.user_role ur
    JOIN public.role r ON r.id = ur.role_id
    JOIN public.role_permission rp ON rp.role_id = ur.role_id
    JOIN public.permission p ON p.id = rp.permission_id
    WHERE ur.user_id = u_id 
        AND ( r.tenant_id = current_tenant_id 
            OR ( r.tenant_id IS NULL 
                AND EXISTS( SELECT 1 from public.tenant_owner WHERE user_id = u_id AND tenant_id = current_tenant_id)
            )
        );

    IF permission IS NOT NULL THEN
        claims := jsonb_set(claims, '{app_metadata,permission}', permission, true);
    END IF;

    -- Update the 'claims' field in the token
    e := jsonb_set(e, '{claims}', claims, true);

    RETURN e;
END;
$$;

-- Create a helper function to use in RLS policies
CREATE OR REPLACE FUNCTION auth.allowed_tenant () RETURNS UUID[] SECURITY DEFINER LANGUAGE plpgsql STABLE
SET
    search_path = '' AS $$
DECLARE
   jwt_claims JSONB;
   app_metadata JSONB;
   allowed_tenant UUID[];
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

   -- Extract allowed_tenant from app_metadata and convert it to UUID[]
   SELECT ARRAY(
      SELECT (tenant->>'id')::UUID
      FROM JSONB_ARRAY_ELEMENTS(app_metadata -> 'allowed_tenant') AS tenant
   )
   INTO allowed_tenant;

   -- Return the allowed_tenant or an empty UUID array if null
   RETURN COALESCE(allowed_tenant, ARRAY[]::UUID[]);
END;
$$;

CREATE OR REPLACE FUNCTION auth.tenant_id () RETURNS UUID SECURITY DEFINER AS $$
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
        FROM public.tenant
        WHERE display_name = header_tenant;
    END IF;

    -- Check if header_tenant_id is in allowed tenant
    IF header_tenant_id IS NOT NULL AND header_tenant_id = ANY(auth.allowed_tenant()) THEN
        tenant_id := header_tenant_id;
    END IF;

    -- Return the resolved tenant_id
    RETURN tenant_id;
END;
$$ LANGUAGE plpgsql STABLE COST 100;
