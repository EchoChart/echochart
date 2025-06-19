<script setup>
import Collection from '@/lib/Collection';

defineOptions({
   inheritAttrs: false
});

const { t } = useI18n();
const attrs = useAttrs();

const modelValue = defineModel({ get: (value) => value || [] });

const columns = computed(() => [
   {
      field: 'display_name',
      header: t('component.select_permission.table.headers.permission_name')
   },
   {
      field: 'read',
      header: t('component.select_permission.table.headers.read')
   },
   {
      field: 'create',
      header: t('component.select_permission.table.headers.create')
   },
   {
      field: 'modify',
      header: t('component.select_permission.table.headers.modify')
   }
]);

const permissionKinds = ['read', 'create', 'modify'];

const allPermissions = Collection.create(
   await supabase
      .from('permission')
      .select('id,resource_name,group_name,kind')
      .throwOnError()
      .then((res) => res.data)
);

const permissionByKind = computed(() => _groupBy(allPermissions?._data, 'kind'));

const permissionByGroup = computed(() => _groupBy(allPermissions?._data, 'group_name'));

const permissions = computed(() =>
   Object.keys(permissionByGroup.value)?.map?.((key) => ({
      display_name: key,
      items: _groupBy(permissionByGroup.value?.[key], 'kind')
   }))
);

const isPermissionChecked = (item) => {
   return _find(modelValue.value, ({ id }) => id === item?.id);
};

const isAllChecked = computed(() => allPermissions?.every?.((item) => isPermissionChecked(item)));

const togglePermissions = (items) => {
   modelValue.value = _xorBy(modelValue.value, items, ({ id }) => id);
};

const togglePermissionColumn = (checked, field) => {
   _remove(modelValue.value, ({ kind }) => kind === field);
   if (checked) modelValue.value = [...modelValue.value, ...permissionByKind.value[field]];
};

const toggleAll = (checked) => {
   modelValue.value = checked ? _cloneDeep(allPermissions?._data) : [];
};

const tableProps = computed(() => ({
   stateKey: 'permission',
   dataKey: 'display_name',
   paginator: false,
   columns: columns.value,
   rowActions: [],
   rows: null,
   value: permissions.value,
   ...attrs
}));
</script>
<template>
   <CustomTable v-bind="tableProps">
      <template #display_name_header>
         <FormField
            class="!flex-[0] flex-nowrap"
            :label="$t('component.select_permission.table.headers.all')"
         >
            <template #default="slotProps">
               <ToggleSwitch
                  :readonly="$attrs.readonly"
                  v-bind="slotProps"
                  class="min-w-fit"
                  :model-value="isAllChecked || false"
                  @change="(e) => toggleAll(e.target.checked)"
               />
            </template>
         </FormField>
      </template>
      <template
         v-for="(kind, i) in permissionKinds"
         #[`${kind}_header`]="{ header, field }"
         :key="`${kind}_${i}`"
      >
         <FormField class="!flex-[0] flex-nowrap" :label="header">
            <template #default="slotProps">
               <ToggleSwitch
                  :readonly="$attrs.readonly"
                  v-bind="slotProps"
                  class="min-w-fit"
                  :model-value="
                     permissionByKind?.[field]?.every?.((item) => isPermissionChecked(item)) ||
                     false
                  "
                  @change="(e) => togglePermissionColumn(e.target.checked, field)"
               />
            </template>
         </FormField>
      </template>
      <template
         v-for="(kind, i) in permissionKinds"
         #[`${kind}_body`]="{ data, field }"
         :key="`${kind}_${i}`"
      >
         <ToggleSwitch
            :readonly="$attrs.readonly"
            v-if="data?.items[field]?.some?.((item) => item.id)"
            :model-value="data?.items[field]?.every?.((item) => isPermissionChecked(item))"
            @change="() => togglePermissions(data?.items[field])"
         />
      </template>
   </CustomTable>
</template>
