<script setup>
import { Form } from '@/lib/Form';
import { useClientStore } from '@/store/services/client';

import { useToast } from 'primevue';

const props = defineProps({
   id: {
      type: String,
      default: null,
      required: false
   },
   data: {
      type: Object,
      default: null,
      required: false
   },
   category: {
      type: String,
      default: null
   }
});

const toast = useToast();

const initialFormData = {
   id: null,
   identity_number: null,
   display_name: null,
   email: null,
   phone: null,
   nationality: null
};

const fields = _keys(initialFormData);

const form = new Form({
   data: _defaults(_pick(props.data, fields), initialFormData),
   rules: {
      display_name: 'required',
      email: 'required|email',
      phone: 'required|phone'
   },
   useDialogForm: false
});

const { ability } = useAuthStore();
const readonly = computed(
   () => ability.cannot('modify', 'clients') && ability.cannot('create', 'clients')
);

const { getClient } = useClientStore().useClients();
if (props.id) {
   await getClient(props.id).then((res) => form._setDefaults(_pick(res, fields))._reset());
}

const save = async () => {
   if (!form._validate()) return;

   await supabase
      .from('clients')
      .upsert(form._data)
      .eq('id', form.id)
      .select()
      .single()
      .throwOnError()
      .then(({ data }) => form._merge(_pick(data, fields)));

   emitter.emit('client-update', form._data);

   form._setDefaults(form._data)._reset();

   toast.add({
      life: 3000,
      severity: ToastSeverity.SUCCESS,
      summary: i18n.t('success'),
      detail: i18n.t('saved')
   });
};

if (props.id || props.data?.id) {
   const updateCallback = (data) => form._setDefaults(_pick(data, fields))._reset();
   onMounted(() => emitter.on('client-update', updateCallback));
   onUnmounted(() => emitter.off('client-update', updateCallback));
}
</script>

<template>
   <div class="card">
      <FormBox @submit="save" @reset="() => form._reset()" class="[&>*]:flex-1">
         <FormField
            :readonly="readonly"
            fluid
            :error="form?._errors?.first('display_name')"
            :label="$t('display_name')"
         >
            <template #default="slotProps">
               <InputText v-bind="slotProps" v-model="form.display_name" />
            </template>
         </FormField>
         <FormField
            :readonly="readonly"
            fluid
            :error="form?._errors?.first('nationality')"
            :label="$t('nationality')"
         >
            <template #default="slotProps">
               <InputText v-bind="slotProps" v-model="form.nationality" />
            </template>
         </FormField>
         <FormField
            :readonly="readonly"
            fluid
            :error="form?._errors?.first('identity_number')"
            :label="$t('identity_number')"
         >
            <template #default="slotProps">
               <InputText v-bind="slotProps" v-model="form.identity_number" />
            </template>
         </FormField>
         <FormField
            :readonly="readonly"
            fluid
            :error="form?._errors?.first('email')"
            :label="$t('email')"
         >
            <template #default="slotProps">
               <InputText v-bind="slotProps" v-model="form.email" />
            </template>
         </FormField>
         <FormField
            :readonly="readonly"
            fluid
            :error="form?._errors?.first('phone')"
            :label="$t('phone')"
         >
            <template #default="slotProps">
               <InputMask v-bind="slotProps" v-model="form.phone" mask="99999999999" />
            </template>
         </FormField>
         <div
            v-if="($can('create', 'clients') || $can('modify', 'clients')) && !readonly"
            class="flex flex-wrap items-end justify-end gap-4 !flex-auto w-full"
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
