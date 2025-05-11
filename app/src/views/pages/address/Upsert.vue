<script setup>
import { Form } from '@/lib/Form';

import { useToast } from 'primevue';

/**
 * @typedef {Tables['address']['Row']} Data
 * @type {{ id: Data['id'], data: Data }} */
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
   display_name: null,
   country: null,
   city: null,
   district: null,
   details: null
};

const fields = _keys(initialFormData);

const form = new Form({
   data: _defaults(_pick(props.data, fields), initialFormData),
   rules: {
      display_name: 'required',
      country: 'required',
      city: 'required'
   },
   useDialogForm: false
});

const { ability } = useAuthStore();
const readonly = computed(
   () => ability.cannot('modify', 'address') && ability.cannot('create', 'address')
);

const routeLoading = inject('routeLoading', false);
if (!routeLoading.value && props.id) {
   supabase
      .from('address')
      .select('*')
      .eq('id', props.id)
      .single()
      .throwOnError()
      .then(({ data }) => form._setDefaults(_pick(data, fields))._reset());
}

const save = async () => {
   if (!form._validate()) return;

   await supabase
      .from('address')
      .upsert(form._data)
      .eq('id', form.id)
      .select()
      .single()
      .throwOnError()
      .then(({ data }) => form._merge(_pick(data, fields)));

   emitter.emit('address-update', form._data);
   emitter.emit('client_address-update', form._data);

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
   onMounted(() => emitter.on('address-update', updateCallback));
   onUnmounted(() => emitter.off('address-update', updateCallback));
}
</script>

<template>
   <div class="card">
      <FormBox @submit="save" @reset="() => form._reset()" :form :readonly>
         <FormField
            :readonly
            fluid
            :error="form?._errors?.first('display_name')"
            :label="$t('display_name')"
         >
            <template #default="slotProps">
               <InputText v-bind="slotProps" v-model="form.display_name" />
            </template>
         </FormField>
         <FormField :readonly fluid :error="form?._errors?.first('country')" :label="$t('country')">
            <template #default="slotProps">
               <InputText v-bind="slotProps" v-model="form.country" />
            </template>
         </FormField>
         <FormField :readonly fluid :error="form?._errors?.first('city')" :label="$t('city')">
            <template #default="slotProps">
               <InputText v-bind="slotProps" v-model="form.city" />
            </template>
         </FormField>
         <FormField
            :readonly
            fluid
            :error="form?._errors?.first('district')"
            :label="$t('district')"
         >
            <template #default="slotProps">
               <InputText v-bind="slotProps" v-model="form.district" />
            </template>
         </FormField>
         <FormField
            class="!flex-auto !max-w-full w-full"
            :readonly
            fluid
            :error="form._errors.first('details')"
            :label="$t('details')"
         >
            <template #default="slotProps">
               <Editor v-bind="slotProps" v-model="form.details" />
            </template>
         </FormField>
      </FormBox>
   </div>
</template>
