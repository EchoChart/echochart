<script setup>
import Collection from '@/lib/Collection';
import { Form } from '@/lib/Form';
import { useToast } from 'primevue';

const toast = useToast();

const props = defineProps({
   id: {
      type: String,
      default: null
   },
   display_name: {
      type: String,
      default: null
   }
});

const isEditing = computed(() => _isString(props.id) && !_isEmpty(props.id));

const initialFormData = {
   display_name: null,
   permissions: {}
};

const form = new Form({
   data: initialFormData,
   rules: {
      display_name: 'required|string',
      permissions: 'required'
   }
});

if (props.display_name) form.display_name = props.display_name;
const role = new Collection({});

watch(
   () => isEditing.value,
   async (editing) => {
      if (!editing) return form._setDefaults(initialFormData)._reset();

      await supabase
         .from('roles')
         .select('id,display_name, permissions(*)')
         .eq('id', props.id)
         .single()
         .throwOnError()
         .then(({ data: { display_name, permissions, id } }) => {
            role._reset({ display_name, id });
            form
               ._setDefaults({
                  display_name: role.display_name,
                  permissions: _keyBy(permissions, (e) => e.id)
               })
               ._reset();
         });
   },
   { immediate: true, once: true }
);

const save = async () => {
   if (!form._validate()) return;

   await supabase
      .from('roles')
      .upsert({
         id: role.id,
         display_name: form._data.display_name
      })
      .select()
      .single()
      .throwOnError()
      .then(({ data }) => role._reset(data));

   if (isEditing.value)
      await supabase
         .from('role_permissions')
         .delete()
         .eq('role_id', role.id)
         .setHeader('x-delete-confirmed', true)
         .throwOnError();

   const payload = _values(_cloneDeep(form._data.permissions)).map(({ id: permission_id }) => ({
      permission_id,
      role_id: role.id
   }));

   await supabase.from('role_permissions').insert(payload).throwOnError();

   toast.add({
      life: 3000,
      severity: ToastSeverity.SUCCESS,
      summary: i18n.t('success'),
      detail: i18n.t('saved', { name: form._data.display_name })
   });

   if (isEditing.value)
      form._setDefaults({ display_name: role.display_name, permissions: form.permissions });

   role._reset();
   form._reset();

   emitter.emit('roles-update', [role.id]);
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
            >
               <template #default="slotProps">
                  <SelectPermissions v-bind="slotProps" v-model="form['permissions']" />
               </template>
            </FormField>
         </div>
         <div class="flex flex-wrap items-end justify-end gap-4 w-full">
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
