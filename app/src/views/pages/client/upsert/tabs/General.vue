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
   }
});

const toast = useToast();

const initialFormData = {
   id: undefined,
   national_id: null,
   display_name: null,
   birth_date: null,
   gender: null,
   email: null,
   phone: null,
   nationality: null
};

const fields = _keys(initialFormData);

const form = new Form({
   data: _defaults(_pick(props.data, fields), initialFormData),
   rules: {
      display_name: 'required',
      nationality: 'required',
      national_id: 'required',
      birth_date: 'required|date',
      gender: 'required',
      email: 'email',
      phone: 'phone'
   },
   useDialogForm: false
});

const routeLoading = inject('routeLoading', false);
if (!routeLoading.value && props.id) {
   await supabase
      .from('client')
      .select('*')
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
   const updateCallback = (data) => {
      if (data?.id === form.id) form._setDefaults(_pick(data, fields))._reset();
   };
   onMounted(() => emitter.on('client-update', updateCallback));
   onUnmounted(() => emitter.off('client-update', updateCallback));
}
</script>

<template>
   <div class="card p-0">
      <FormBox @submit="save" @reset="() => form._reset()" :form :readonly>
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
            <SelectCountry v-bind="slotProps" v-model="form.nationality" />
         </FormField>
         <FormField
            :readonly="readonly"
            fluid
            :error="form?._errors?.first('national_id')"
            :label="$t('national_id')"
            v-slot="slotProps"
         >
            <InputText v-bind="slotProps" v-model="form.national_id" />
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
            :error="form?._errors?.first('gender')"
            :label="$t('gender')"
            v-slot="slotProps"
         >
            <SelectButton
               :options="[
                  { value: 'male', label: $t('male') },
                  { value: 'female', label: $t('female') }
               ]"
               :allow-empty="false"
               option-value="value"
               option-label="label"
               v-bind="slotProps"
               v-model="form.gender"
            />
         </FormField>
         <div class="form-box !flex-auto">
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
               <PhoneInput v-bind="slotProps" v-model="form.phone" />
            </FormField>
         </div>
      </FormBox>
   </div>
</template>
