# Changelog

## [0.4.0-alpha.1](https://github.com/EchoChart/echochart/compare/echochart-app-v0.3.1-alpha.1...echochart-app-v0.4.0-alpha.1) (2025-03-06)


### Features

* **CustomTable:** enhance filter functionality and improve data handling ([b88af33](https://github.com/EchoChart/echochart/commit/b88af33312a37ee99a478ac5796e8e5ab062c6cd))
* **Form:** add validation rules and enhance form functionality with reactive properties ([43f1672](https://github.com/EchoChart/echochart/commit/43f1672ea7cca009c6d850d2dfc60de0f0883428))
* **KeywordSearchInput:** add keyword search input component with model binding ([eadff20](https://github.com/EchoChart/echochart/commit/eadff2075ca523f73384a03a52abf29912a5ad33))
* **PermissionsSelect:** rename `SelectPermissions` component to `PermissionsSelect` ([3345100](https://github.com/EchoChart/echochart/commit/3345100f0e27fe2508e4a325299ecc85c5cd0e10))
* **product:** add product and category store with fetching capabilities ([562970e](https://github.com/EchoChart/echochart/commit/562970e41f8e777f29aec432635e36815a5c0cba))
* **product:** add product management page with upsert functionality and filters ([177f41e](https://github.com/EchoChart/echochart/commit/177f41ec4ed8245917d9206c6137f82e06bd874a))
* **product:** add PRODUCT_CATEGORY_PROPS for category styling and icons ([8b04b2b](https://github.com/EchoChart/echochart/commit/8b04b2b0b0a5be5ea9c9eab56da8412fdffba2a2))
* **product:** add ProductBrandSelect component for brand selection with loading state ([041dab2](https://github.com/EchoChart/echochart/commit/041dab2e2f65ee0942abe5d3701629b5123f0bc1))
* **product:** add ProductCategorySelect component for category selection with loading state ([28c7fe3](https://github.com/EchoChart/echochart/commit/28c7fe383c94b5dc9660a90dbd667f3e6e0b461e))
* **product:** add ProductSelect component for selecting products by category with loading state ([67cf366](https://github.com/EchoChart/echochart/commit/67cf366ba5a116cdbd1c2d28c4cea7a8913b7e8a))
* **stock:** add device routes and device management page for stock handling ([c59dcb2](https://github.com/EchoChart/echochart/commit/c59dcb234e7546a000550ea4d31640ff3a63a217))
* **stock:** add routes and views for battery, spare part, and product management ([f64890b](https://github.com/EchoChart/echochart/commit/f64890b1ee77622fb526350f0ac509b3a2f03ef6))
* **stock:** add stocks and vendors store with fetching capabilities ([f91996a](https://github.com/EchoChart/echochart/commit/f91996a7985023e8efc61c125baf54557bec7e8a))
* **stock:** add StockVendorSelect component for vendor selection with fetching capabilities ([c21134e](https://github.com/EchoChart/echochart/commit/c21134e5ae76ad6c94f78ec8e6135dbe0ed08f90))
* **Supabase:** enhance filter query generation with new match modes and operators ([261136e](https://github.com/EchoChart/echochart/commit/261136eab3f790384591b16b881a7f989615fa61))


### Bug Fixes

* **AppConfigurator:** adjust UIScale slider step and minimum value for better user experience ([7936c3c](https://github.com/EchoChart/echochart/commit/7936c3c15108fc3b2fc4255396d1badd6efff6b4))
* **CustomLink:** replace hardcoded dialog position with constant from router ([486d5ba](https://github.com/EchoChart/echochart/commit/486d5ba45bbf4e58dc8ffcccad365c97351d4e0c))
* **FormBox, FormField:** adjust spacing and error message formatting for improved UI consistency ([e732bcb](https://github.com/EchoChart/echochart/commit/e732bcb09fd04bb00c6fb1baa8128ba1f127bd29))
* **imports:** update theme imports from @primevue/themes to @primeuix/themes ([3e2bd22](https://github.com/EchoChart/echochart/commit/3e2bd224299dd1442d10896eccea069fe7a321fd))
* **ResourceTable:** streamline Supabase request handling and improve event emitter usage ([50f50d2](https://github.com/EchoChart/echochart/commit/50f50d296126705926475fde4d39f2bcd8606b56))

## [0.3.1-alpha.1](https://github.com/EchoChart/echochart/compare/echochart-app-v0.3.0-alpha.1...echochart-app-v0.3.1-alpha.1) (2025-01-30)


### Bug Fixes

* **customtable:** customTable component skeleton loader bugfix ([f6a4eab](https://github.com/EchoChart/echochart/commit/f6a4eab3bb7a0c8f0d1d9ac8ff76524968b5bf97))

## [0.3.0-alpha.1](https://github.com/EchoChart/echochart/compare/echochart-app-v0.2.0-alpha.1...echochart-app-v0.3.0-alpha.1) (2025-01-30)


### Features

* cASL.js plugin added ([1e94de2](https://github.com/EchoChart/echochart/commit/1e94de20bee7f048cc0dad6f659cfa1382f4a4df))

## [0.2.0-alpha.1](https://github.com/EchoChart/echochart/compare/echochart-app-v0.1.0-alpha.1...echochart-app-v0.2.0-alpha.1) (2025-01-24)


### Features

* branch and branch roles added ([c2a384c](https://github.com/EchoChart/echochart/commit/c2a384c202a0552c3239fce0b5a2be83dff60621))
* mitt.js plugin added ([7e9c363](https://github.com/EchoChart/echochart/commit/7e9c36386ca6244533e813ca07c24619faa3597d))
* **resourcetable:** base resource service table added ([0e58d8f](https://github.com/EchoChart/echochart/commit/0e58d8f7730cbdc5b524193bd7b55e0d679b6dfa))
* service component added for select permissions ([1e1ca44](https://github.com/EchoChart/echochart/commit/1e1ca44211b4f16b9777db6194a42fffa1545116))
* **supabase-client:** added primevue table filter support to supabase client's global fetch ([73107c4](https://github.com/EchoChart/echochart/commit/73107c4ea76ecd46201c0022d65e5420f781720c))
* users can switch between their branches ([dcb4a48](https://github.com/EchoChart/echochart/commit/dcb4a489407436c32cc650ac93a73db698f5010b))

## [0.1.0-alpha.1](https://github.com/EchoChart/echochart/compare/echochart-app-v0.0.2-alpha.1...echochart-app-v0.1.0-alpha.1) (2025-01-08)


### Features

* **account:** update account ([c23f84a](https://github.com/EchoChart/echochart/commit/c23f84a790c03cb35d6241b668bb57d9f02737b7))

## [0.0.2-alpha.1](https://github.com/EchoChart/echochart/compare/echochart-app-v0.0.1-alpha.1...echochart-app-v0.0.2-alpha.1) (2025-01-07)


### Performance Improvements

* **supabase:** cache supabase requests ([27d7aea](https://github.com/EchoChart/echochart/commit/27d7aea33f8fd8aa0156ef4791e7b4a4521fc42b))

## 0.0.1-alpha.1 (2025-01-07)


### Miscellaneous Chores

* release 0.0.1 ([974f07e](https://github.com/EchoChart/echochart/commit/974f07e750591bff3d27bbdd8d74b7d265683304))
* release 0.0.1-alpha.1 ([7adbc2b](https://github.com/EchoChart/echochart/commit/7adbc2bfa4437a6f750bb9ed33809ee06c470ae6))
