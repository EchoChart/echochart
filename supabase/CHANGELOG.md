# Changelog

## [0.11.0-alpha.1](https://github.com/EchoChart/echochart/compare/echochart-supabase-v0.10.0-alpha.1...echochart-supabase-v0.11.0-alpha.1) (2025-05-22)


### Features

* enhance audit logging with request ID tracking ([30d8745](https://github.com/EchoChart/echochart/commit/30d8745e771eb7ed6066c0aa43ec906f36b71e02))
* implement record management with CRUD, validation and routing for sales ([5947df5](https://github.com/EchoChart/echochart/commit/5947df571e226c8591cddead67071341418c0f40))


### Bug Fixes

* add created_at field to client seeding function for accurate timestamps ([a8de518](https://github.com/EchoChart/echochart/commit/a8de5188575fa395cf850f91490629350b80aa33))
* add currency_code and tax fields to record table for improved financial tracking ([65506d9](https://github.com/EchoChart/echochart/commit/65506d943b7a2d3c25f2c85aca81445108419f1f))
* add IF NOT EXISTS to index creation statements in migration script ([0a1056c](https://github.com/EchoChart/echochart/commit/0a1056c7245d4e09e9f460cba0bfd65a04db3a5c))
* add initial tenant entries to seed data for better testing coverage ([992eed9](https://github.com/EchoChart/echochart/commit/992eed90c23c6d7d499f68e616a58b42bc0b69af))
* add service routes and update product category props for service ([e72ff2e](https://github.com/EchoChart/echochart/commit/e72ff2e32d86b47ef4f900feb0a0947026ff833f))
* comment out tenant entries in seed.sql for clarity ([11ed37c](https://github.com/EchoChart/echochart/commit/11ed37c28b6760965514db8a14ba875ac1f9a850))
* correct 'assembly' to 'assemble' in record types and update related SQL constraint ([837b117](https://github.com/EchoChart/echochart/commit/837b11730f9f529065786ba7bad09f53f576787f))
* enhance stock management by adding unit type, discount, and tax fields in Upsert component and database schema ([9429125](https://github.com/EchoChart/echochart/commit/9429125534e9eead1923eef813c7afea32972978))
* enhance stock seeding function with unit_discount and unit_tax fields ([8ee16cd](https://github.com/EchoChart/echochart/commit/8ee16cd6fa816773230af4883af6f3fba6f7c137))
* prevent duplicate role assignment in tenant owner trigger function ([635d71c](https://github.com/EchoChart/echochart/commit/635d71c1a49438a6bb1432020725f5ed71e6af30))
* rename assigned_user_id to user_id for consistency in sales table ([4a740ae](https://github.com/EchoChart/echochart/commit/4a740ae18bdb42fdf6b2c2dc498666566ac3313e))
* rename sales table to record and update references, enhancing record management ([3d22ff6](https://github.com/EchoChart/echochart/commit/3d22ff6bd226216f9bed2a33672a05db30a6c64e))
* rename stock_date to stocked_at in components and SQL migration ([bfc33c6](https://github.com/EchoChart/echochart/commit/bfc33c6e3dec072e2b84be99e87043de3159c854))
* set default values for JSONB fields in user, record, and audit_log tables for better data integrity ([bcb6401](https://github.com/EchoChart/echochart/commit/bcb64011572e9bf2def8b4d84446ceb0944668c5))
* set search_path for validate_record_amount function for consistency ([6b608a1](https://github.com/EchoChart/echochart/commit/6b608a1515e84c94e396c9d33a03fb8828501820))
* standardize index naming conventions across database tables for consistency ([10f0bd2](https://github.com/EchoChart/echochart/commit/10f0bd29acbae5791156fa522348a15320c49996))
* update client seeding to use dynamic data generation for improved randomness ([c14006e](https://github.com/EchoChart/echochart/commit/c14006e876b1f1a40309ed361987aa2b597fec47))
* update column name and increase stock generation range in seed.sql ([f0216f8](https://github.com/EchoChart/echochart/commit/f0216f8a419e46b39cc6389f7217d796f95e3037))
* update display_name value to lowercase in seed data for uniformity ([4a740ae](https://github.com/EchoChart/echochart/commit/4a740ae18bdb42fdf6b2c2dc498666566ac3313e))
* update init_request_id and get_request_id functions to include search_path setting for improved context ([d9f3a3a](https://github.com/EchoChart/echochart/commit/d9f3a3a0b0ea3f239fd9d38c4ddc5f68b3ddedcf))
* update record seeding to include currency_code and tax fields ([8ee6502](https://github.com/EchoChart/echochart/commit/8ee6502d13291e9033b857de8997eea99e5a25fd))
* update record table to use NUMERIC type for amount, bid, and bid_discount for improved precision ([ce25fda](https://github.com/EchoChart/echochart/commit/ce25fda9ebca9f8243d2c392a5d242e3d1a35ebc))
* update stock field names and calculations in Upsert component and SQL migration ([0230065](https://github.com/EchoChart/echochart/commit/02300650d6289436daab114c8430adacabf04fe4))
* update stock table to use NUMERIC type for quantity, unit_cost, unit_discount, and unit_tax for better precision ([ad4c4f8](https://github.com/EchoChart/echochart/commit/ad4c4f8172ef27e8235925726564558312b75162))
* update user table to store metadata directly instead of separate fields ([1b5a26e](https://github.com/EchoChart/echochart/commit/1b5a26e9de99e2cb6bc13a5ada3d3223b7b469a8))

## [0.10.0-alpha.1](https://github.com/EchoChart/echochart/compare/echochart-supabase-v0.9.0-alpha.1...echochart-supabase-v0.10.0-alpha.1) (2025-04-18)


### Features

* **audit-log:** add audit log functionality with CRUD operations and UI components ([cf67c7a](https://github.com/EchoChart/echochart/commit/cf67c7a1155bbd108ca8ad96e6ce9d0082bb73df))

## [0.9.0-alpha.1](https://github.com/EchoChart/echochart/compare/echochart-supabase-v0.8.0-alpha.1...echochart-supabase-v0.9.0-alpha.1) (2025-04-08)


### Features

* introduce SelectCountry component and update filters for consistency in client and product forms ([c037eca](https://github.com/EchoChart/echochart/commit/c037eca085ba1477c2a3cb2313f8d96d35613830))

## [0.8.0-alpha.1](https://github.com/EchoChart/echochart/compare/echochart-supabase-v0.7.0-alpha.1...echochart-supabase-v0.8.0-alpha.1) (2025-03-25)


### Features

* add address management functionality with CRUD operations and related database triggers ([de5dff0](https://github.com/EchoChart/echochart/commit/de5dff0390086010b1d4f37df7900c12741fec61))

## [0.7.0-alpha.1](https://github.com/EchoChart/echochart/compare/echochart-supabase-v0.6.0-alpha.1...echochart-supabase-v0.7.0-alpha.1) (2025-03-17)


### Features

* enable query plan explanation and reload configuration in seed script ([7848a37](https://github.com/EchoChart/echochart/commit/7848a37b504ca2eb2a75669140e541b8ce73933c))
* enable row level security for specified tables in migration scripts ([2fc35d5](https://github.com/EchoChart/echochart/commit/2fc35d523074819493a1929071e7064ccd28ce57))
* set search path in assign_owner_role function for improved security context ([685dde5](https://github.com/EchoChart/echochart/commit/685dde56934f2cf6fd4ad77b010a0001f7ea6821))

## [0.6.0-alpha.1](https://github.com/EchoChart/echochart/compare/echochart-supabase-v0.5.0-alpha.1...echochart-supabase-v0.6.0-alpha.1) (2025-03-14)


### Features

* update numeric precision for unit_cost and total_cost to 3 decimal places ([01c0280](https://github.com/EchoChart/echochart/commit/01c028000a2c797621ead39ffd3e6f44c041068b))
* update tenant_user and tenant_owner references, add role assignment trigger for tenant owners ([ed8428a](https://github.com/EchoChart/echochart/commit/ed8428a6e6adade1b4b24884929fef8255908d21))

## [0.5.0-alpha.1](https://github.com/EchoChart/echochart/compare/echochart-supabase-v0.4.0-alpha.1...echochart-supabase-v0.5.0-alpha.1) (2025-03-13)


### Features

* add tenant_owner table and update account creation logic to associate users with tenants ([f1c9d29](https://github.com/EchoChart/echochart/commit/f1c9d29eb65d7f51848a1416c53be98c56011669))

## [0.4.0-alpha.1](https://github.com/EchoChart/echochart/compare/echochart-supabase-v0.3.0-alpha.1...echochart-supabase-v0.4.0-alpha.1) (2025-03-10)


### Features

* add client management functionality with routing and database integration ([febd3f8](https://github.com/EchoChart/echochart/commit/febd3f84cbfbc5bba66f2a8cf1d00937b3919651))

## [0.3.0-alpha.1](https://github.com/EchoChart/echochart/compare/echochart-supabase-v0.2.2-alpha.1...echochart-supabase-v0.3.0-alpha.1) (2025-03-06)


### Features

* **stock:** add stocks table with constraints, indexes, and views for stock management ([6d4e474](https://github.com/EchoChart/echochart/commit/6d4e4745106ef081c1f802de1fd886c911ade11f))

## [0.2.2-alpha.1](https://github.com/EchoChart/echochart/compare/echochart-supabase-v0.2.1-alpha.1...echochart-supabase-v0.2.2-alpha.1) (2025-02-06)


### Bug Fixes

* **migrations:** ensure proper newline at end of file in init_schemas.sql ([6de4162](https://github.com/EchoChart/echochart/commit/6de416228cc0f32ce9afe58625783ea52126347e))

## [0.2.1-alpha.1](https://github.com/EchoChart/echochart/compare/echochart-supabase-v0.2.0-alpha.1...echochart-supabase-v0.2.1-alpha.1) (2025-01-30)


### Performance Improvements

* permissons are cached. RLS performance improved ([21e28ad](https://github.com/EchoChart/echochart/commit/21e28adb21c22bd1297bde1ff534532127f9dd49))

## [0.2.0-alpha.1](https://github.com/EchoChart/echochart/compare/echochart-supabase-v0.1.0-alpha.1...echochart-supabase-v0.2.0-alpha.1) (2025-01-24)


### Features

* users can switch between their branches ([dcb4a48](https://github.com/EchoChart/echochart/commit/dcb4a489407436c32cc650ac93a73db698f5010b))

## [0.1.0-alpha.1](https://github.com/EchoChart/echochart/compare/echochart-supabase-v0.0.1-alpha.1...echochart-supabase-v0.1.0-alpha.1) (2025-01-08)


### Features

* **account:** update account ([c23f84a](https://github.com/EchoChart/echochart/commit/c23f84a790c03cb35d6241b668bb57d9f02737b7))

## 0.0.1-alpha.1 (2025-01-07)


### Features

* db migrations added ([2d80716](https://github.com/EchoChart/echochart/commit/2d8071644c43ab112f0cf16d22b19078746862df))
* Initial commit with boilerplate setup ([54d00d1](https://github.com/EchoChart/echochart/commit/54d00d17fd3852455070082322817b76cff7ea48))


### Miscellaneous Chores

* release 0.0.1 ([974f07e](https://github.com/EchoChart/echochart/commit/974f07e750591bff3d27bbdd8d74b7d265683304))
* release 0.0.1-alpha.1 ([7adbc2b](https://github.com/EchoChart/echochart/commit/7adbc2bfa4437a6f750bb9ed33809ee06c470ae6))
