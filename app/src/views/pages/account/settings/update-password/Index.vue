<script setup>
import { Form } from '@/lib/Form';
import { useToast } from 'primevue';

const { t, te } = useI18n();
const toast = useToast();
const accountStore = useAccountStore();
const form = Form.create({
   data: {
      password: '',
      password_confirmation: ''
   },
   rules: {
      password: 'required|alpha_dash|min:8',
      password_confirmation: 'required|same:password'
   }
});

const save = async () => {
   if (!form._validate()) return;

   const { error } = await accountStore.updateUser(form._data);
   if (error) throw error;

   form._reset();

   toast.add({
      life: 3000,
      severity: ToastSeverity.SUCCESS,
      summary: t('toast.updated')
   });
};
</script>
<template>
   <FormBox @submit="save" @reset="() => form._reset()" v-focustrap :form>
      <FormField
         fluid
         v-slot="slotProps"
         :label="$t('fields.password')"
         :error="form?._errors?.first('password')"
      >
         <Password
            autofocus
            v-bind="slotProps"
            :toggle-mask="true"
            :feedback="false"
            v-model="form['password']"
            @input="() => form._validate(['password'])"
         />
      </FormField>
      <FormField
         fluid
         v-slot="slotProps"
         :label="$t('fields.password_confirmation')"
         :error="form?._errors?.first('password_confirmation')"
      >
         <Password
            v-bind="slotProps"
            :toggle-mask="true"
            :feedback="false"
            v-model="form['password_confirmation']"
            @input="() => form._validate()"
         />
      </FormField>
   </FormBox>
</template>
