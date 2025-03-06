INSERT INTO
   public.permissions (resource_name, group_name, command, kind, bypass, throws_error, resource_condition)
VALUES
   -- tenants
   ('public.tenants', 'branches', 'select', 'read', FALSE, FALSE, NULL),
   ('public.tenants', 'branches', 'insert', 'create', FALSE, FALSE, NULL),
   ('public.tenants', 'branches', 'update', 'modify', FALSE, FALSE, NULL),
   ('public.tenants', 'branches', 'delete', 'modify', FALSE, FALSE, NULL),
   --
   --
   -- users   
   ('public.users', 'users', 'select', 'read', FALSE, FALSE, NULL),
   ('public.users', 'users', 'insert', 'create', FALSE, FALSE, NULL),
   ('public.users', 'users', 'update', 'modify', FALSE, FALSE, NULL),
   ('public.users', 'users', 'delete', 'modify', FALSE, FALSE, NULL),
   --
   --
   -- tenants_users   
   ('public.tenants_users', 'users', 'select', 'read', TRUE, FALSE, NULL),
   ('public.tenants_users', 'users', 'insert', 'create', FALSE, FALSE, NULL),
   ('public.tenants_users', 'users', 'update', 'modify', FALSE, FALSE, NULL),
   ('public.tenants_users', 'users', 'delete', 'modify', FALSE, FALSE, NULL),
   --
   --
   -- roles   
   ('public.roles', 'roles', 'select', 'read', FALSE, FALSE, NULL),
   ('public.roles', 'roles', 'insert', 'create', FALSE, FALSE, 'is_default <> TRUE'),
   ('public.roles', 'roles', 'update', 'modify', FALSE, FALSE, 'is_default <> TRUE'),
   ('public.roles', 'roles', 'delete', 'modify', FALSE, FALSE, 'is_default <> TRUE'),
   --
   --
   -- user_roles 
   ('public.user_roles', 'roles', 'select', 'read', TRUE, FALSE, NULL),
   ('public.user_roles', 'roles', 'insert', 'create', FALSE, FALSE, 'EXISTS (SELECT 1 FROM public.roles r WHERE r.id = role_id AND r.is_default <> TRUE)'),
   ('public.user_roles', 'roles', 'update', 'modify', FALSE, FALSE, 'EXISTS (SELECT 1 FROM public.roles r WHERE r.id = role_id AND r.is_default <> TRUE)'),
   ('public.user_roles', 'roles', 'delete', 'modify', FALSE, FALSE, 'EXISTS (SELECT 1 FROM public.roles r WHERE r.id = role_id AND r.is_default <> TRUE)'),
   --
   --
   -- role_permissions   
   ('public.role_permissions', 'roles', 'select', 'read', TRUE, FALSE, NULL),
   ('public.role_permissions', 'roles', 'insert', 'create', FALSE, FALSE, 'EXISTS (SELECT 1 FROM public.roles r WHERE r.id = role_id AND r.is_default <> TRUE)'),
   ('public.role_permissions', 'roles', 'update', 'modify', FALSE, FALSE, 'EXISTS (SELECT 1 FROM public.roles r WHERE r.id = role_id AND r.is_default <> TRUE)'),
   ('public.role_permissions', 'roles', 'delete', 'modify', FALSE, FALSE, 'EXISTS (SELECT 1 FROM public.roles r WHERE r.id = role_id AND r.is_default <> TRUE)'),
   --
   --
   -- product_category
   ('public.product_category', 'products', 'select', 'read', TRUE, FALSE, NULL),
   -- ('public.product_category', 'products', 'insert', 'create', FALSE, FALSE, NULL),
   -- ('public.product_category', 'products', 'update', 'modify', FALSE, FALSE, NULL),
   -- ('public.product_category', 'products', 'delete', 'modify', FALSE, FALSE, NULL),
   --
   --
   -- products
   ('public.products', 'products', 'select', 'read', TRUE, FALSE, NULL),
   ('public.products', 'products', 'insert', 'create', FALSE, FALSE, NULL),
   ('public.products', 'products', 'update', 'modify', FALSE, FALSE, NULL),
   ('public.products', 'products', 'delete', 'modify', FALSE, FALSE, NULL),
   --
   --
   -- product_categories
   ('public.product_categories', 'products', 'select', 'read', TRUE, FALSE, NULL),
   ('public.product_categories', 'products', 'insert', 'create', FALSE, FALSE, NULL),
   ('public.product_categories', 'products', 'update', 'modify', FALSE, FALSE, NULL),
   ('public.product_categories', 'products', 'delete', 'modify', FALSE, FALSE, NULL),
   --
   --
   -- stocks
   ('public.stocks', 'products', 'select', 'read', FALSE, FALSE, NULL),
   ('public.stocks', 'products', 'insert', 'create', FALSE, FALSE, NULL),
   ('public.stocks', 'products', 'update', 'modify', FALSE, FALSE, NULL),
   ('public.stocks', 'products', 'delete', 'modify', FALSE, FALSE, NULL);

INSERT INTO
   public.tenants (display_name)
VALUES
   ('bade-gop'),
   ('bade-gop-sarigol'),
   ('bade-avcilar');

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
    prod_count INT := 30; -- Generate 30 products
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
    inserted_products AS (
        INSERT INTO public.products (display_name, brand, description, created_at)
        SELECT product_name, brand_name, 'Description for ' || product_name, created_at
        FROM product_data
        RETURNING id -- Return only product ID
    )
    -- Assign row numbers after insertion
    INSERT INTO public.product_categories (product_id, category_id)
    SELECT p.id, d.assigned_category_id 
    FROM (SELECT id, ROW_NUMBER() OVER () AS row_num FROM inserted_products) p
    JOIN product_data d ON p.row_num = d.row_num; -- Correctly map inserted product to its category
END $$;

-- DO $$  
-- DECLARE  
--     tenant UUID := '1fdb4405-8c8c-4d1f-9526-eb0dc0e28c32'; -- Placeholder tenant_id  
-- BEGIN  
--     INSERT INTO public.stocks (
--         tenant_id, product_id, quantity, used, cost, currency_code, vendor, serial_number, barcode, details, created_at
--     )  
--     SELECT  
--         tenant,  
--         p.id,  
--         FLOOR(random() * 100 + 1)::INTEGER,  -- Random quantity between 1 and 100  
--         0,  -- `used` starts at 0  
--         ROUND((random() * (500 - 10) + 10)::NUMERIC, 2),  -- Random cost between 10.00 and 500.00  
--         'TRY',  
--         'EROTIC SHOP ' || lpad(floor(random() * 20)::text, 2, '0'),  
--         'SN-' || gen_random_uuid(),  -- Unique serial number  
--         'B-' || gen_random_uuid(),  -- Unique barcode per tenant and product  
--         'Details for tenant product',  
--         NOW() - (random() * interval '10 years')  -- Random timestamp within the last 10 years  
--     FROM public.products p  
--     CROSS JOIN generate_series(1, 13) g;  
-- END $$;

-- enable explain
alter role authenticator
set pgrst.db_plan_enabled to 'true';

-- reload the config
notify pgrst, 'reload config';