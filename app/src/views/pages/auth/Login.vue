<script setup>
import { Form } from '@/lib/Form';
const authStore = useAuthStore();
const { loginWithPassword } = authStore;
const { isSignedIn } = storeToRefs(authStore);

const rememberMe = ref(!!localStorage.getItem('remember-me'));

const dialogRef = inject('dialogRef', null);

const form = new Form({
   data: {
      email: 'test@test.com',
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
   <FormBox @submit="login" class="self-center flex-col gap-8" v-focustrap>
      <div class="flex-auto text-center flex flex-col justify-center gap-8">
         <div class="text-3xl font-medium" v-text="$t('welcome_back')" />

         <span class="text-muted-color font-medium" v-text="$t('please_login_to_continue')" />
      </div>
      <div class="flex-auto flex flex-col gap-8">
         <FormField fluid :label="'email'" :error="form._errors.first('email')">
            <template v-slot="slotProps">
               <InputText autofocus v-bind="slotProps" v-model="form['email']" />
            </template>
         </FormField>
         <FormField fluid :label="'password'" :error="form._errors.first('password')">
            <template v-slot="slotProps">
               <Password
                  v-bind="slotProps"
                  v-model="form.password"
                  :toggleMask="true"
                  :feedback="false"
               />
            </template>
         </FormField>

         <div class="flex flex-col gap-8">
            <div class="flex items-center justify-between gap-4">
               <FormField reverse :label="'Remember me'">
                  <template v-slot="slotProps">
                     <Checkbox v-bind="slotProps" class="min-w-fit" v-model="rememberMe" binary
                  /></template>
               </FormField>

               <RouterLink
                  custom
                  v-slot="{ href, navigate }"
                  :to="{ name: 'login', replace: true }"
               >
                  <a
                     :href="href"
                     @click="navigate"
                     class="font-medium no-underline cursor-pointer text-primary"
                     v-text="$t('forgot_password_?')"
                  />
               </RouterLink>
            </div>
            <Button
               variant="outlined"
               class="!border-primary-emphasis"
               type="submit"
               :label="'Login'"
               fluid
            />
         </div>
      </div>
   </FormBox>
</template>
