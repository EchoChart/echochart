<script setup>
import { Form } from '@/lib/Form';
import { useToast } from 'primevue';

const toast = useToast();

/**
 * @typedef {Tables['role']['Row']} Data
 * @type {{ id: Data['id'], data: Data }} */
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
   ...props.data
};
const fields = _keys(initialFormData);

const form = new Form({
   data: _defaults(_pick(props.data, fields), initialFormData),
   rules: {
      display_name: 'required|string',
      permission: 'required'
   },
   useDialogForm: false
});

const { ability } = useAuthStore();
const readonly = computed(() => {
   return (
      (ability.cannot('modify', 'role') && ability.cannot('create', 'role')) ||
      (form.id && !form.tenant_id)
   );
});

const routeLoading = inject('routeLoading', false);
if (!routeLoading.value && props.id) {
   await supabase
      .from('role')
      .select('*, permission(id, kind, group_name)')
      .eq('id', props.id)
      .single()
      .throwOnError()
      .then(({ data: { id, tenant_id, display_name, permission } }) => {
         form
            ._setDefaults({
               id,
               display_name,
               tenant_id,
               permission
            })
            ._reset();
      });
}

const updateCallback = (data) => {
   if (props?.data?.id) {
      return;
   }
   if (data?.id === form.id) {
      form._setDefaults(data)._reset();
   }
};

if (!routeLoading.value) {
   onMounted(() => emitter.on('role-update', updateCallback));
   onUnmounted(() => emitter.off('role-update', updateCallback));
}
const save = async () => {
   if (!form._validate()) return;
   const { data } = await supabase
      .from('role')
      .upsert({
         id: form.id,
         display_name: form._data.display_name
      })
      .select('*, permission(id, kind, group_name)')
      .single()
      .throwOnError();

   if (form._changedData['permission']) {
      if (props.id || props.data?.id)
         await supabase
            .from('role_permission')
            .delete()
            .eq('role_id', form.id)
            .setHeader('x-delete-confirmed', true)
            .throwOnError();

      const payload = form._data.permission.map(({ id: permission_id }) => ({
         permission_id,
         role_id: data.id
      }));

      await supabase.from('role_permission').insert(payload).throwOnError();
   }

   if (form.id) form._setDefaults(form._data)._reset();

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
      <FormBox @submit="save" @reset="() => form?._reset()" v-focustrap :form :readonly>
         <FormField
            fluid
            :label="i18n.t('display_name')"
            :error="form?._errors.first('display_name')"
            :readonly
         >
            <template #default="slotProps">
               <InputText v-bind="slotProps" v-model="form['display_name']" />
            </template>
         </FormField>
         <FormField
            class="!flex-auto !max-w-none w-full"
            fluid
            :label="i18n.t('permission')"
            :readonly
            :error="form?._errors.first('permission')"
         >
            <template #default="slotProps">
               <PermissionsSelect v-bind="slotProps" v-model="form['permission']" />
            </template>
         </FormField>
      </FormBox>
   </div>
</template>
