# Changelog

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
