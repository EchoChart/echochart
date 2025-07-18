<script setup lang="ts">
import { Form } from '@/lib/Form';
import { VerifyOtpParams } from '@supabase/supabase-js';
import { useConfirm, useToast } from 'primevue';

const router = useRouter();
const route = useRoute();
const toast = useToast();
const confirm = useConfirm();

const form = Form.create<{ email: string; code: string }>({
   rules: {
      email: 'required|email',
      code: 'required|min:6'
   }
});

const resendForm = Form.create<{ email: string }>({
   data: {
      email: null
   },
   rules: {
      email: 'required|email'
   },
   autoValidate: true
});

const resendCode = async () => {
   confirm.require({
      group: 'resend-code',
      header: i18n.t('auth.otp.resend_code.confirm.title'),
      icon: PrimeIcons.REFRESH,
      rejectProps: {
         label: i18n.t('action.cancel'),
         severity: 'secondary',
         outlined: true
      },
      acceptProps: {
         label: i18n.t('action.send'),
         disabled: computed(() => !resendForm._isValid)
      },
      accept: async () => {
         if (!resendForm._validate()) return;

         if (route.path.endsWith('forgot-password')) {
            await supabase.auth.resetPasswordForEmail(resendForm.email);
         } else if (route.path.endsWith('invite-code')) {
            await supabase.auth.resend({
               email: resendForm.email,
               type: 'signup'
            });
         }

         toast.add({
            severity: 'info',
            summary: i18n.t('toast.success'),
            detail: i18n.t('auth.otp.resend_code.toast.code_sended'),
            life: 3000
         });
      }
   });
};

const save = async () => {
   if (!form._validate()) return;
   try {
      const otpOptions: VerifyOtpParams = {
         email: form.email,
         token: form.code,
         type: route.path.endsWith('forgot-password') ? 'recovery' : 'invite'
      };
      const { error } = await supabase.auth.verifyOtp(otpOptions);

      if (error) throw error;

      await router.replace({ name: 'update-password' });

      if (otpOptions.type === 'invite' || otpOptions.type === 'recovery')
         toast.add({
            life: 0,
            closable: true,
            severity: ToastSeverity.INFO,
            summary: i18n.t('auth.otp.resend_code.code_verified'),
            detail: i18n.t('auth.please_dont_forget_to_update_your_password')
         });
   } catch (error) {
      throw error;
   }
};
</script>
<template>
   <div class="flex-auto w-full text-center flex flex-col justify-center gap-8 mb-8">
      <div
         class="text-3xl font-medium"
         v-text="
            route.path.endsWith('forgot-password')
               ? $t('auth.otp.forgot_password.lets_get_your_account_back!💪')
               : $t('auth.otp.invite_code.so_you_are_invited!🎊')
         "
      />

      <span
         class="text-muted-color font-medium"
         v-text="$t('auth.otp.invite_code.please_enter_the_code_in_email_to_login')"
      />
   </div>
   <FormBox :form :submit="save" :reset="() => form._reset()" class="justify-center">
      <FormField
         v-slot="slotProps"
         :label="$t('fields.email')"
         :error="form?._errors?.first('email')"
      >
         <InputText autofocus v-bind="slotProps" type="email" v-model="form['email']" />
      </FormField>
      <FormField
         :label="$t('fields.code')"
         v-slot="slotProps"
         :error="form?._errors?.first('code')"
      >
         <InputOtp v-bind="slotProps" v-model="form.code" :length="6" />
      </FormField>
      <template #form-actions>
         <div class="form_box__actions-bar !justify-center">
            <span class="form_box__button-container">
               <Button
                  :label="$t('action.resend_code')"
                  class="form_box__button"
                  size="small"
                  severity="secondary"
                  @click="resendCode"
               />
               <Button
                  :label="$t('action.submit')"
                  class="form_box__button"
                  size="small"
                  :disabled="!form?._isChanged"
                  @click="save"
               />
            </span>
         </div>
      </template>
   </FormBox>
   <ConfirmDialog group="resend-code" :draggable="false">
      <template #message>
         <FormField
            :label="$t('fields.email')"
            fluid
            v-slot="slotProps"
            :error="resendForm?._errors?.first('email')"
         >
            <InputText v-bind="slotProps" v-model="resendForm.email" :length="6" />
         </FormField>
      </template>
   </ConfirmDialog>
</template>
