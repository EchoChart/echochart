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

   const { error } = await accountStore.updateUser(form._toObject);
   if (error) throw error;

   form._setDefaults(form._toObject);

   toast.add({
      life: 3000,
      severity: ToastSeverity.SUCCESS,
      summary: i18n.t('updated')
   });
};
</script>
<template>
   <FormBox @submit="save" @reset="() => form?._reset()" v-focustrap>
      <div v-if="form" class="flex-1 flex flex-wrap gap-4">
         <FormField fluid :label="'display_name'" :error="form?._errors.first('data.display_name')">
            <template #default="slotProps">
               <InputText autofocus v-bind="slotProps" v-model="form['data.display_name']" />
            </template>
         </FormField>
         <FormField fluid :label="'email'" :error="form?._errors.first('email')">
            <template #default="slotProps">
               <InputText v-bind="slotProps" v-model="form['email']" />
            </template>
         </FormField>
         <FormField fluid :label="$t('phone')" :error="form._errors.first('phone')">
            <template v-slot="slotProps">
               <InputMask v-bind="slotProps" v-model="form['phone']" mask="9999999999999" />
            </template>
         </FormField>
      </div>
      <div class="flex flex-wrap items-end justify-end gap-4 w-full">
         <Button label="Save" class="flex-[.2]" :disabled="!form?._isChanged" type="submit" />
         <Button
            label="Reset"
            severity="secondary"
            class="flex-[.2]"
            :disabled="!form?._isChanged"
            type="reset"
         />
      </div>
   </FormBox>
</template>
