<script setup>
import { Form } from '@/lib/Form';
import { useToast } from 'primevue';

const toast = useToast();
const accountStore = useAccountStore();
const form = new Form({
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
      summary: i18n.t('updated')
   });
};
</script>
<template>
   <FormBox @submit="save" @reset="() => form._reset()" v-focustrap>
      <FormField v-slot="slotProps" :label="'password'" :error="form._errors.first('password')">
         <Password
            fluid
            autofocus
            v-bind="slotProps"
            :toggle-mask="true"
            :feedback="false"
            v-model="form['password']"
            @input="() => form._validate(['password'])"
         />
      </FormField>
      <FormField
         v-slot="slotProps"
         :label="'password_confirmation'"
         :error="form._errors.first('password_confirmation')"
      >
         <Password
            fluid
            v-bind="slotProps"
            :toggle-mask="true"
            :feedback="false"
            v-model="form['password_confirmation']"
            @input="() => form._validate()"
         />
      </FormField>
      <div class="flex flex-wrap items-end justify-end gap-4 w-full">
         <Button :label="$t('save')" class="flex-[.2]" :disabled="!form._isChanged" type="submit" />
         <Button
            :label="$t('reset')"
            severity="secondary"
            class="flex-[.2]"
            :disabled="!form._isChanged"
            type="reset"
         />
      </div>
   </FormBox>
</template>
