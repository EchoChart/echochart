<script setup>
import { Form } from '@/lib/Form';
import { useToast } from 'primevue';

const { t, te } = useI18n();
const toast = useToast();

const authStore = useAuthStore();

const { user } = storeToRefs(authStore);
const accountStore = useAccountStore();

const form = Form.create({
   data: {
      email: user.value?.email,
      email_confirm: true,
      phone: user.value?.phone,
      phone_confirm: true,
      data: { ...user.value?.user_metadata, avatar_url: 'https://doodleipsum.com/700x700/abstract' }
   },
   rules: {
      data: { display_name: 'string' },
      email: 'required|email',
      phone: 'phone'
   }
});

const save = async () => {
   if (!form?._validate()) return;

   const { error } = await accountStore.updateUser(form._data);
   if (error) throw error;

   form._setDefaults(form._data);

   toast.add({
      life: 3000,
      severity: ToastSeverity.SUCCESS,
      summary: t('toast.updated')
   });
};
</script>
<template>
   <FormBox @submit="save" @reset="() => form?._reset()" v-focustrap :form>
      <FormField
         fluid
         v-slot="slotProps"
         :label="$t('fields.name')"
         :error="form?._errors.first('data.display_name')"
      >
         <InputText autofocus v-bind="slotProps" v-model="form['data.display_name']" />
      </FormField>
      <FormField
         fluid
         v-slot="slotProps"
         :label="$t('fields.email')"
         :error="form?._errors.first('email')"
      >
         <InputText v-bind="slotProps" v-model="form['email']" />
      </FormField>
      <FormField
         fluid
         v-slot="slotProps"
         :label="$t('fields.phone')"
         :error="form?._errors?.first('phone')"
      >
         <PhoneInput
            v-bind="slotProps"
            :model-value="form['phone']"
            @update:model-value="form['phone'] = $event"
         />
      </FormField>
   </FormBox>
</template>
