<script setup>
import { Form } from '@/lib/Form';
import { useToast } from 'primevue';

const toast = useToast();

const props = defineProps({
   id: {
      type: String,
      default: null
   },
   data: {
      type: Object,
      default: null
   }
});

const initialFormData = {
   ...props.data,
   permission: _keyBy(props.data?.permission, 'id') || {}
};

const form = new Form({
   id: undefined,
   data: null,
   rules: {
      display_name: 'required|string',
      permission: 'required'
   },
   useDialogForm: false
});

const { ability } = useAuthStore();
const readonly = computed(
   () =>
      (ability.cannot('modify', 'product') && ability.cannot('create', 'product')) ||
      (form.id && !form.tenant_id)
);

const getRole = async () => {
   await supabase
      .from('role')
      .select('id,display_name, permission(*)')
      .eq('id', form.id)
      .single()
      .throwOnError()
      .then(({ data: { display_name, permission, id } }) => {
         form
            ._setDefaults({
               id,
               display_name,
               permission: _keyBy(permission, 'id')
            })
            ._reset();
      });
};

const isEditing = computed(() => _isString(props.id) && !_isEmpty(props.id) && _isNil(props.data));
watch(
   () => isEditing.value,
   async (editing) => {
      if (!editing) return form._setDefaults(initialFormData)._reset();

      form._set({ id: props.id });

      await getRole();
   },
   { immediate: true, once: true }
);

const updateCallback = (data) => {
   if (props?.data?.id) {
      return;
   }
   if (data?.id === form.id) {
      form._setDefaults(data)._reset();
   }
};

const routeLoading = inject('routeLoading', false);
if (!routeLoading.value) {
   onMounted(() => emitter.on('role-update', updateCallback));
   onUnmounted(() => emitter.off('role-update', updateCallback));
}

const save = async () => {
   if (!form._validate()) return;

   if (form.id)
      await supabase
         .from('role_permission')
         .delete()
         .eq('role_id', form.id)
         .setHeader('x-delete-confirmed', true)
         .throwOnError();

   const { data } = await supabase
      .from('role')
      .upsert({
         id: form.id,
         display_name: form._data.display_name
      })
      .select('id, display_name')
      .single()
      .throwOnError();

   if (form.id) form._setDefaults({ ...data, permission: form._data.permission })._reset();

   const payload = _values(_cloneDeep(form._data.permission)).map(({ id: permission_id }) => ({
      permission_id,
      role_id: data.id
   }));

   await supabase.from('role_permission').insert(payload).throwOnError();

   toast.add({
      life: 3000,
      severity: ToastSeverity.SUCCESS,
      summary: i18n.t('success'),
      detail: i18n.t('saved', { name: form._data.display_name })
   });

   emitter.emit('role-update', form._data);
};
</script>

<template>
   <div class="card">
      <FormBox @submit="save" @reset="() => form?._reset()" v-focustrap>
         <div v-if="form" class="flex-1 flex flex-col overflow-auto gap-8">
            <FormField
               fluid
               :label="i18n.t('display_name')"
               :error="form?._errors.first('display_name')"
               :readonly="!$can('modify', 'role') && !$can('create', 'role')"
            >
               <template #default="slotProps">
                  <InputText
                     autofocus
                     v-bind="slotProps"
                     v-model="form['display_name']"
                     class="min-w-[10vw]"
                  />
               </template>
            </FormField>
            <FormField
               fluid
               :label="i18n.t('permission')"
               :error="form?._errors.first('permission')"
               :readonly="!$can('modify', 'role_permission') && !$can('create', 'role_permission')"
            >
               <template #default="slotProps">
                  <PermissionsSelect v-bind="slotProps" v-model="form['permission']" />
               </template>
            </FormField>
         </div>
         <div
            v-if="($can('create', 'role') || $can('modify', 'role')) && !readonly"
            class="flex flex-wrap items-end justify-end gap-4 w-full"
         >
            <Button
               :label="$t('save')"
               class="flex-[.2]"
               :disabled="!form?._isChanged"
               type="submit"
            />
            <Button
               :label="$t('reset')"
               severity="secondary"
               class="flex-[.2]"
               :disabled="!form?._isChanged"
               type="reset"
            />
         </div>
      </FormBox>
   </div>
</template>
