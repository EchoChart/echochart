<script setup>
import ClientSelect from '@/components/service-components/client/ClientSelect.vue';
import { Form } from '@/lib/Form';
import AddressTable from '@/views/pages/address/Index.vue';
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
   address: []
};

const fields = _keys(initialFormData);

const form = new Form({
   data: _defaults(_pick(props.data, fields), initialFormData),
   rules: {
      id: 'required',
      'address.*.id': 'required'
   },
   useDialogForm: false
});

const { ability } = useAuthStore();

const readonly = computed(
   () => ability.cannot('modify', 'client_address') && ability.cannot('create', 'client_address')
);

if (props.id) {
   supabase
      .from('client')
      .select('id, address(*)')
      .eq('id', props.id)
      .single()
      .throwOnError()
      .then(async ({ data }) => {
         form._setDefaults(_pick(data, fields))._reset();
      });
}

const save = async () => {
   if (!form._validate()) return;

   if (form.id)
      await supabase
         .from('client_address')
         .delete()
         .eq('client_id', form.id)
         .setHeader('x-delete-confirmed', true)
         .throwOnError();

   await supabase
      .from('client_address')
      .insert(
         form.address.map(({ id }) => ({
            client_id: form.id,
            address_id: id
         }))
      )
      .throwOnError();

   emitter.emit('client_address-update', form._data);
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
   onMounted(() => emitter.on('client_address-update', updateCallback));
   onUnmounted(() => emitter.off('client_address-update', updateCallback));
}

provide('dialogRef', true);
</script>

<template>
   <div class="card">
      <FormBox @submit="save" @reset="() => form._reset()" :form :readonly>
         <FormField
            v-if="!props.data"
            fluid
            :error="form?._errors?.first('client')"
            :label="$t('client')"
            v-slot="slotProps"
         >
            <ClientSelect
               v-bind="slotProps"
               v-model="form.id"
               @clientSelect="form._setDefaults($event)._reset()"
            />
         </FormField>
         <FormField
            fluid
            :error="form?._errors?.first('address')"
            v-slot="slotProps"
            class="!flex-auto !max-w-none w-full"
         >
            <AddressTable
               v-bind="slotProps"
               selectionMode="multiple"
               v-model:selection="form.address"
               :useMeta="false"
               :frozenValue="form.address"
               :rows="5"
            />
         </FormField>
      </FormBox>
   </div>
</template>
