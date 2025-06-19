<script setup>
import { Form } from '@/lib/Form';
const authStore = useAuthStore();
const { loginWithPassword } = authStore;
const { isSignedIn } = storeToRefs(authStore);

const rememberMe = ref(!!localStorage.getItem('remember-me'));

const dialogRef = inject('dialogRef', null);

const form = Form.create({
   data: {
      email: '',
      password: 'asdqwe123'
   },
   rules: {
      email: 'required|email',
      password: 'required'
   }
});

const login = async () => {
   if (!form._validate()) {
      return;
   }

   await loginWithPassword(form._data);

   localStorage.removeItem('remember-me');
   if (rememberMe.value) {
      localStorage.setItem('remember-me', form.email);
   }
};

watch(
   () => isSignedIn.value,
   async (value) => {
      value && dialogRef?.value?.close?.();
   },
   { immediate: true }
);

if (rememberMe.value) {
   form.email = localStorage.getItem('remember-me');
}
</script>

<template>
   <FormBox @submit="login" class="self-center gap-8" v-focustrap>
      <div class="flex-auto w-full text-center flex flex-col justify-center gap-8">
         <div class="text-3xl font-medium" v-text="$t('auth.login.welcome_back')" />

         <span
            class="text-muted-color font-medium"
            v-text="$t('auth.login.please_login_to_continue')"
         />
      </div>
      <div class="flex-auto flex flex-col gap-8">
         <FormField
            v-slot="slotProps"
            fluid
            :label="$t('fields.email')"
            :error="form?._errors?.first('email')"
         >
            <InputText autofocus v-bind="slotProps" v-model="form['email']" />
         </FormField>
         <FormField
            v-slot="slotProps"
            fluid
            :label="$t('fields.password')"
            :error="form?._errors?.first('password')"
         >
            <Password
               v-bind="slotProps"
               v-model="form.password"
               :toggleMask="true"
               :feedback="false"
            />
         </FormField>
      </div>
      <template #form-actions>
         <div class="flex-auto w-full flex flex-col gap-8">
            <div class="flex items-center justify-between gap-4">
               <FormField
                  v-slot="slotProps"
                  reverse
                  :label="$t('fields.remember_me')"
                  class="max-w-fit"
               >
                  <Checkbox v-bind="slotProps" class="min-w-fit" v-model="rememberMe" binary />
               </FormField>

               <RouterLink
                  custom
                  v-slot="{ href, navigate }"
                  :to="{ name: 'auth-login', replace: true }"
               >
                  <a
                     :href="href"
                     @click="navigate"
                     class="font-medium no-underline cursor-pointer text-primary"
                     v-text="$t('auth.login.forgot_password?')"
                  />
               </RouterLink>
            </div>
            <Button
               variant="outlined"
               class="!border-primary-emphasis w-[75%] mx-auto"
               type="submit"
               :label="$t('action.submit')"
            />
         </div>
      </template>
   </FormBox>
</template>
