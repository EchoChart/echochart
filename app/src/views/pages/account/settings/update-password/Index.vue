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

   const { error } = await accountStore.updateUser(form._toObject);
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
      <div class="flex-1 flex flex-wrap gap-4">
         <FormField :label="'password'" :error="form._errors.first('password')">
            <template #default="slotProps">
               <Password
                  fluid
                  autofocus
                  v-bind="slotProps"
                  :toggle-mask="true"
                  :feedback="false"
                  v-model="form['password']"
                  @input="() => form._validate(['password'])"
               />
            </template>
         </FormField>
         <FormField
            :label="'password_confirmation'"
            :error="form._errors.first('password_confirmation')"
         >
            <template #default="slotProps">
               <Password
                  fluid
                  v-bind="slotProps"
                  :toggle-mask="true"
                  :feedback="false"
                  v-model="form['password_confirmation']"
                  @input="() => form._validate()"
               />
            </template>
         </FormField>
      </div>
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
