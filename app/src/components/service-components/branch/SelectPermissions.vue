<script setup>
import { usePermissionsStore } from '@/store/services/permissions';

defineOptions({
   inheritAttrs: false
});

defineProps({
   disabled: {
      type: Boolean,
      default: false
   }
});

const attrs = useAttrs();

const modelValue = defineModel();

const columns = [
   {
      field: 'display_name',
      header: i18n.t('display_name')
   },
   {
      field: 'read',
      header: i18n.t('read')
   },
   {
      field: 'create',
      header: i18n.t('create')
   },
   {
      field: 'modify',
      header: i18n.t('modify')
   }
];

const routeLoading = inject('routeLoading', false);

const { getPermissions } = usePermissionsStore();

const permissionKinds = ['read', 'create', 'modify'];

let allPermissions = null;
if (!routeLoading?.value) allPermissions = await getPermissions();

const permissionIds = computed(() => allPermissions?._data?.map?.(({ id }) => id));

const permissionsByKind = computed(() => _groupBy(allPermissions?._data, 'kind'));

const permissionsByGroup = computed(() => _groupBy(allPermissions?._data, 'group_name'));

const permissions = computed(() =>
   Object.keys(permissionsByGroup.value)?.map?.((key) => ({
      display_name: key,
      items: _groupBy(permissionsByGroup.value?.[key], 'kind')
   }))
);

const allChecked = computed(
   () =>
      _size(_difference(permissionIds.value, _keys(modelValue.value))) < 1 &&
      _size(modelValue.value) > 0
);

const togglePermission = (e, items) => {
   items?.forEach((item) => {
      e?.target?.checked
         ? _set(modelValue.value, `${item.id}`, item)
         : _unset(modelValue.value, `${item.id}`);
   });
};

const togglePermissionColumn = (e, field) => {
   _values(permissions?.value).forEach((p) => {
      togglePermission(e, p?.items[field]);
   });
};

const toggleAll = (e) => {
   permissionKinds?.forEach((kind) => togglePermissionColumn(e, kind));
};

const tableProps = computed(() => ({
   dataKey: 'display_name',
   stateKey: 'permissions',
   paginator: false,
   columns,
   rowActions: [],
   rows: null,
   value: permissions.value,
   ...attrs
}));
</script>
<template>
   <CustomTable v-bind="tableProps">
      <template #display_name_header>
         <FormField class="!flex-[0] flex-nowrap" :label="$t('all')">
            <template #default="slotProps">
               <ToggleSwitch
                  :readonly="disabled"
                  v-bind="slotProps"
                  :model-value="allChecked || false"
                  @change="(e) => toggleAll(e)"
               />
            </template>
         </FormField>
      </template>
      <template
         v-for="(kind, i) in permissionKinds"
         #[`${kind}_header`]="{ header, field }"
         :key="`${kind}_${i}`"
      >
         <FormField class="!flex-[0] flex-nowrap" :label="$t(header || '')">
            <template #default="slotProps">
               <ToggleSwitch
                  :readonly="disabled"
                  v-bind="slotProps"
                  :model-value="
                     permissionsByKind?.[field]?.every?.((item) =>
                        _includes(_keys(modelValue), item.id)
                     ) || false
                  "
                  @change="(e) => togglePermissionColumn(e, field)"
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
            :readonly="disabled"
            :model-value="
               data?.items[field]?.every?.((item) => _includes(_keys(modelValue), item.id)) || false
            "
            @change="(e) => togglePermission(e, data?.items[field])"
         />
      </template>
   </CustomTable>
</template>
