-- enable explain
alter role authenticator
set pgrst.db_plan_enabled to 'true';

-- reload the config
notify pgrst, 'reload config';

INSERT INTO
   public.permission (resource_name, group_name, command, kind, bypass, throws_error, resource_condition)
VALUES
   -- tenant
   ('public.tenant', 'branch', 'select', 'read', FALSE, FALSE, NULL),
--    ('public.tenant', 'branch', 'insert', 'create', FALSE, FALSE, NULL),
   ('public.tenant', 'branch', 'update', 'modify', FALSE, FALSE, NULL),
--    ('public.tenant', 'branch', 'delete', 'modify', FALSE, FALSE, NULL),
   --
   --
   -- user   
   ('public.user', 'user', 'select', 'read', FALSE, FALSE, NULL),
   ('public.user', 'user', 'insert', 'create', FALSE, FALSE, NULL),
   ('public.user', 'user', 'update', 'modify', FALSE, FALSE, NULL),
   ('public.user', 'user', 'delete', 'modify', FALSE, FALSE, NULL),
   --
   --
   -- tenant_user   
   ('public.tenant_user', 'user', 'select', 'read', TRUE, FALSE, NULL),
   ('public.tenant_user', 'user', 'insert', 'create', FALSE, FALSE, NULL),
   ('public.tenant_user', 'user', 'update', 'modify', FALSE, FALSE, NULL),
   ('public.tenant_user', 'user', 'delete', 'modify', FALSE, FALSE, NULL),
   --
   --
   -- tenant_owner   
   ('public.tenant_owner', 'user', 'select', 'read', TRUE, FALSE, NULL),
   -- ('public.tenant_user', 'user', 'insert', 'create', FALSE, FALSE, NULL),
   -- ('public.tenant_user', 'user', 'update', 'modify', FALSE, FALSE, NULL),
   -- ('public.tenant_user', 'user', 'delete', 'modify', FALSE, FALSE, NULL),
   --
   --
   -- role   
   ('public.role', 'role', 'select', 'read', FALSE, FALSE, NULL),
   ('public.role', 'role', 'insert', 'create', FALSE, FALSE, NULL),
   ('public.role', 'role', 'update', 'modify', FALSE, FALSE, NULL),
   ('public.role', 'role', 'delete', 'modify', FALSE, FALSE, NULL),
   --
   --
   -- user_role 
   ('public.user_role', 'role', 'select', 'read', TRUE, FALSE, NULL),
   ('public.user_role', 'role', 'insert', 'create', FALSE, FALSE, 'EXISTS (SELECT 1 FROM public.role r WHERE r.id = role_id AND r.tenant_id IS NOT NULL)'),
   ('public.user_role', 'role', 'update', 'modify', FALSE, FALSE, 'EXISTS (SELECT 1 FROM public.role r WHERE r.id = role_id AND r.tenant_id IS NOT NULL)'),
   ('public.user_role', 'role', 'delete', 'modify', FALSE, FALSE, 'EXISTS (SELECT 1 FROM public.role r WHERE r.id = role_id AND r.tenant_id IS NOT NULL)'),
   --
   --
   -- role_permission   
   ('public.role_permission', 'role', 'select', 'read', TRUE, FALSE, NULL),
   ('public.role_permission', 'role', 'insert', 'create', FALSE, FALSE, 'EXISTS (SELECT 1 FROM public.role r WHERE r.id = role_id AND r.tenant_id IS NOT NULL)'),
   ('public.role_permission', 'role', 'update', 'modify', FALSE, FALSE, 'EXISTS (SELECT 1 FROM public.role r WHERE r.id = role_id AND r.tenant_id IS NOT NULL)'),
   ('public.role_permission', 'role', 'delete', 'modify', FALSE, FALSE, 'EXISTS (SELECT 1 FROM public.role r WHERE r.id = role_id AND r.tenant_id IS NOT NULL)'),
   --
   --
   -- product_category
   ('public.product_category', 'product', 'select', 'read', TRUE, FALSE, NULL),
   -- ('public.product_category', 'product', 'insert', 'create', FALSE, FALSE, NULL),
   -- ('public.product_category', 'product', 'update', 'modify', FALSE, FALSE, NULL),
   -- ('public.product_category', 'product', 'delete', 'modify', FALSE, FALSE, NULL),
   --
   --
   -- product
   ('public.product', 'product', 'select', 'read', TRUE, FALSE, NULL),
   ('public.product', 'product', 'insert', 'create', FALSE, FALSE, NULL),
   ('public.product', 'product', 'update', 'modify', FALSE, FALSE, NULL),
   ('public.product', 'product', 'delete', 'modify', FALSE, FALSE, NULL),
   --
   --
   -- product_categories
   ('public.product_categories', 'product', 'select', 'read', TRUE, FALSE, NULL),
   ('public.product_categories', 'product', 'insert', 'create', FALSE, FALSE, NULL),
   ('public.product_categories', 'product', 'update', 'modify', FALSE, FALSE, NULL),
   ('public.product_categories', 'product', 'delete', 'modify', FALSE, FALSE, NULL),
   --
   --
   -- stock
   ('public.stock', 'stock', 'select', 'read', FALSE, FALSE, NULL),
   ('public.stock', 'stock', 'insert', 'create', FALSE, FALSE, NULL),
   ('public.stock', 'stock', 'update', 'modify', FALSE, FALSE, NULL),
   ('public.stock', 'stock', 'delete', 'modify', FALSE, FALSE, NULL),
   --
   --
   -- client
   ('public.client', 'client', 'select', 'read', FALSE, FALSE, NULL),
   ('public.client', 'client', 'insert', 'create', FALSE, FALSE, NULL),
   ('public.client', 'client', 'update', 'modify', FALSE, FALSE, NULL),
   ('public.client', 'client', 'delete', 'modify', FALSE, FALSE, NULL),
   --
   --
   -- address
   ('public.address', 'address', 'select', 'read', FALSE, FALSE, NULL),
   ('public.address', 'address', 'insert', 'create', FALSE, FALSE, NULL),
   ('public.address', 'address', 'update', 'modify', FALSE, FALSE, NULL),
   ('public.address', 'address', 'delete', 'modify', FALSE, FALSE, NULL),
   --
   --
   -- client_address
   ('public.client_address', 'client', 'select', 'read', FALSE, FALSE, NULL),
   ('public.client_address', 'client', 'insert', 'create', FALSE, FALSE, NULL),
   ('public.client_address', 'client', 'update', 'modify', FALSE, FALSE, NULL),
   ('public.client_address', 'client', 'delete', 'modify', FALSE, FALSE, NULL);

INSERT INTO
   public.tenant (display_name)
VALUES
   ('bade-gop'),
   ('bade-gop-sarigol'),
   ('bade-avcilar');

INSERT INTO
   public.role (display_name)
VALUES
    ('owner');

INSERT INTO public.role_permission (role_id, permission_id)
SELECT 
    (SELECT id FROM public.role WHERE display_name = 'owner' AND tenant_id IS NULL), 
    id 
FROM public.permission;

CREATE OR REPLACE FUNCTION private.assign_owner_role()
RETURNS TRIGGER SECURITY DEFINER 
SET
   search_path = '' AS $$
BEGIN
    INSERT INTO public.user_role (user_id, role_id)
    VALUES (NEW.user_id, (SELECT id FROM public.role WHERE display_name = 'owner' AND tenant_id IS NULL));
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_tenant_owners_insert
AFTER INSERT ON public.tenant_owner
FOR EACH ROW EXECUTE FUNCTION private.assign_owner_role();

-- Insert Categories with parent-child relationships
INSERT INTO public.product_category (display_name, description, parent_id, created_at)
VALUES 
    ('device', 'Devices to assist hearing impairment', NULL, NOW() - (random() * interval '10 years')),
    ('spare part', 'Components for hearing aids', NULL, NOW() - (random() * interval '10 years'));
INSERT INTO public.product_category (display_name, description, parent_id, created_at)
VALUES 
    ('battery', 'Device batteries', (SELECT id FROM public.product_category WHERE display_name = 'Spare Part' LIMIT 1), NOW() - (random() * interval '10 years'));

-- Generate Random Products and Assign Categories
DO $$  
DECLARE 
    prod_count INT := 30; -- Generate 30 product
    cat_ids UUID[]; -- Store category IDs
BEGIN 
    -- Fetch category IDs in order of display_name to maintain correct assignment
    SELECT array_agg(id ORDER BY display_name) INTO cat_ids FROM public.product_category;

    -- Generate product data
    WITH product_data AS (
        SELECT 
            i AS row_num, -- Explicit row number for ordering
            CASE 
                WHEN i <= prod_count * 0.50 THEN cat_ids[2]  -- Device
                WHEN i <= prod_count * 0.75  THEN cat_ids[3]  -- Spare Parts
                WHEN i <= prod_count * 1 THEN cat_ids[1]  -- Battery
            END AS assigned_category_id,  
            CASE 
                WHEN i <= prod_count * 0.50 THEN 'Device ' || i
                WHEN i <= prod_count * 0.75 THEN 'Spare Part ' || i
                WHEN i <= prod_count * 1 THEN 'Battery ' || i
            END AS product_name,
            'Brand' || floor(random() * 10 + 1)::int AS brand_name,
            NOW() - (random() * interval '10 years') AS created_at
        FROM generate_series(1, prod_count) i
    ),
    inserted_product AS (
        INSERT INTO public.product (display_name, brand, description, created_at)
        SELECT product_name, brand_name, 'Description for ' || product_name, created_at
        FROM product_data
        RETURNING id -- Return only product ID
    )
    -- Assign row numbers after insertion
    INSERT INTO public.product_categories (product_id, category_id)
    SELECT p.id, d.assigned_category_id 
    FROM (SELECT id, ROW_NUMBER() OVER () AS row_num FROM inserted_product) p
    JOIN product_data d ON p.row_num = d.row_num; -- Correctly map inserted product to its category
END $$;

-- DO $$  
-- DECLARE  
--     tenant UUID := '1fdb4405-8c8c-4d1f-9526-eb0dc0e28c32'; -- Placeholder tenant_id  
-- BEGIN  
--     INSERT INTO public.stock (
--         tenant_id, product_id, quantity, used, unit_cost, currency_code, vendor, serial_number, barcode, details, created_at
--     )  
--     SELECT  
--         tenant,  
--         p.id,  
--         FLOOR(random() * 100 + 1)::INTEGER,  -- Random quantity between 1 and 100  
--         0,  -- `used` starts at 0  
--         ROUND((random() * (500 - 10) + 10)::NUMERIC, 2),  -- Random unit_cost between 10.00 and 500.00  
--         'TRY',  
--         'EROTIC SHOP ' || lpad(floor(random() * 20)::text, 2, '0'),  
--         'SN-' || gen_random_uuid(),  -- Unique serial number  
--         'B-' || gen_random_uuid(),  -- Unique barcode per tenant and product  
--         'Details for tenant product',  
--         NOW() - (random() * interval '10 years')  -- Random timestamp within the last 10 years  
--     FROM public.product p  
--     CROSS JOIN generate_series(1, 13) g;  
-- END $$;