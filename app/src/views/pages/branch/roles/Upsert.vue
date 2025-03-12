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
   permissions: _keyBy(props.data?.permissions, 'id') || {}
};

const form = new Form({
   id: null,
   data: null,
   rules: {
      display_name: 'required|string',
      permissions: 'required'
   },
   useDialogForm: false
});

const getRole = async () => {
   await supabase
      .from('roles')
      .select('id,display_name, permissions(*)')
      .eq('id', form.id)
      .single()
      .throwOnError()
      .then(({ data: { display_name, permissions, id } }) => {
         form
            ._setDefaults({
               id,
               display_name,
               permissions: _keyBy(permissions, 'id')
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
         .from('role_permissions')
         .delete()
         .eq('role_id', form.id)
         .setHeader('x-delete-confirmed', true)
         .throwOnError();

   const { data } = await supabase
      .from('roles')
      .upsert({
         id: form.id,
         display_name: form._data.display_name
      })
      .select('id, display_name')
      .single()
      .throwOnError();

   if (form.id) form._setDefaults({ data, permissions: form._data.permissions })._reset();

   const payload = _values(_cloneDeep(form._data.permissions)).map(({ id: permission_id }) => ({
      permission_id,
      role_id: form.id
   }));

   await supabase.from('role_permissions').insert(payload).throwOnError();

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
               :readonly="!$can('modify', 'roles') && !$can('create', 'roles')"
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
               :label="i18n.t('permissions')"
               :error="form?._errors.first('permissions')"
               :readonly="
                  !$can('modify', 'role_permissions') && !$can('create', 'role_permissions')
               "
            >
               <template #default="slotProps">
                  <PermissionsSelect v-bind="slotProps" v-model="form['permissions']" />
               </template>
            </FormField>
         </div>
         <div
            v-if="$can('create', 'roles') || $can('modify', 'roles')"
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
