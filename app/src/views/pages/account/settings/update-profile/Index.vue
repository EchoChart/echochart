<script setup>
import { Form } from '@/lib/Form';
import { useToast } from 'primevue';

const toast = useToast();

const authStore = useAuthStore();
await authStore.initialized;

const { user } = storeToRefs(authStore);
const accountStore = useAccountStore();

const form = new Form({
   data: {
      email: user.value?.email,
      email_confirm: true,
      phone: user.value?.phone,
      phone_confirm: true,
      data: user.value?.user_metadata
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
      summary: i18n.t('updated')
   });
};
</script>
<template>
   <FormBox @submit="save" @reset="() => form?._reset()" v-focustrap :form>
      <FormField
         fluid
         v-slot="slotProps"
         :label="'display_name'"
         :error="form?._errors.first('data.display_name')"
      >
         <InputText autofocus v-bind="slotProps" v-model="form['data.display_name']" />
      </FormField>
      <FormField fluid v-slot="slotProps" :label="'email'" :error="form?._errors.first('email')">
         <InputText v-bind="slotProps" v-model="form['email']" class="min-w-[10vw]" />
      </FormField>
      <FormField fluid v-slot="slotProps" :label="$t('phone')" :error="form._errors.first('phone')">
         <PhoneInput v-bind="slotProps" v-model="form['phone']" />
      </FormField>
   </FormBox>
</template>
