<script setup>
import { Form } from '@/lib/Form';

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
   form: {
      type: Form,
      default: null
   }
});

const toast = useToast();

const initialFormData = {
   id: undefined,
   identity_number: null,
   display_name: null,
   birth_date: null,
   email: null,
   phone: null,
   nationality: null
};

const fields = _keys(initialFormData);

const form =
   props.form ||
   new Form({
      data: _defaults(_pick(props.data, fields), initialFormData),
      rules: {
         display_name: 'required',
         identity_number: 'required',
         birth_date: 'required|date',
         email: 'email',
         phone: 'phone'
      },
      useDialogForm: false
   });

if (props.id) {
   await supabase
      .from('client')
      .select('*. address(*)')
      .eq('id', props.id)
      .single()
      .throwOnError()
      .then(({ data }) => form._setDefaults(_pick(data, fields))._reset());
}

const { ability } = useAuthStore();
const readonly = computed(
   () => ability.cannot('modify', 'client') && ability.cannot('create', 'client')
);

const save = async () => {
   if (!form._validate()) return;

   await supabase
      .from('client')
      .upsert(_pick(form._data, fields))
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
            v-slot="slotProps"
         >
            <InputText v-bind="slotProps" v-model="form.display_name" />
         </FormField>
         <FormField
            :readonly="readonly"
            fluid
            :error="form?._errors?.first('nationality')"
            :label="$t('nationality')"
            v-slot="slotProps"
         >
            <InputText v-bind="slotProps" v-model="form.nationality" />
         </FormField>
         <FormField
            :readonly="readonly"
            fluid
            :error="form?._errors?.first('identity_number')"
            :label="$t('identity_number')"
            v-slot="slotProps"
         >
            <InputText v-bind="slotProps" v-model="form.identity_number" />
         </FormField>
         <FormField
            :readonly="readonly"
            fluid
            :error="form?._errors?.first('birth_date')"
            :label="$t('birth_date')"
            v-slot="slotProps"
         >
            <DatePicker v-bind="slotProps" v-model="form.birth_date" />
         </FormField>
         <FormField
            :readonly="readonly"
            fluid
            :error="form?._errors?.first('email')"
            :label="$t('email')"
            v-slot="slotProps"
         >
            <InputText v-bind="slotProps" v-model="form.email" />
         </FormField>
         <FormField
            :readonly="readonly"
            fluid
            :error="form?._errors?.first('phone')"
            :label="$t('phone')"
            v-slot="slotProps"
         >
            <InputMask v-bind="slotProps" v-model="form.phone" mask="99999999999" />
         </FormField>
         <div
            v-if="($can('create', 'client') || $can('modify', 'client')) && !readonly"
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
