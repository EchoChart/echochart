<script setup>
import { Form } from '@/lib/Form';
import { PrimeIcons } from '@primevue/core';
import { useToast } from 'primevue';

const toast = useToast();
const router = useRouter();

const stepper = ref();
const setStep = (step) => _set(stepper.value, 'd_value', step);
const steps = [
   {
      icon: PrimeIcons.USER_PLUS,
      label: i18n.t('account')
   },
   {
      icon: PrimeIcons.BUILDING,
      label: i18n.t('company')
   }
];

const form = new Form({
   data: {
      account: {
         email: 'info@akifaycicek.com.tr',
         password: 'asdqwe123',
         password_confirmation: 'asdqwe123'
      },
      company: {
         display_name: 'bade',
         email: 'info@akifaycicek.com.tr',
         phone: null
      }
   },
   rules: {
      account: {
         email: 'required|email',
         password: 'required|min:8',
         password_confirmation: 'required|same:account.password'
      },
      company: {
         display_name: 'required|min:3',
         email: 'required|email',
         phone: 'phone'
      }
   }
});

const submit = async () => {
   if (!form._validate(['account'])) {
      return setStep(1);
   }

   if (!form._validate(['company'])) {
      return setStep(2);
   }

   const { error } = await supabase.functions.invoke('create-account', {
      body: form._data
   });

   if (error) throw error;

   toast.add({
      life: 3000,
      severity: ToastSeverity.SUCCESS,
      summary: i18n.t('success')
   });
   await router.replace({ name: 'login' });
};
</script>

<template>
   <FormBox @submit="submit" class="self-center flex-col gap-8" v-focustrap>
      <div class="text-center flex flex-col justify-center gap-8">
         <div class="text-3xl font-medium" v-text="$t('create_account')" />

         <span class="text-muted-color font-medium" v-text="$t('create_an_account_and_join_us')" />
      </div>
      <Stepper ref="stepper" class="flex-auto flex flex-col gap-8" :value="1">
         <StepList class="flex-wrap sm:flex-nowrap gap-2">
            <Step
               v-for="(step, i) in steps"
               :key="`step_${i}`"
               v-slot="{ value, a11yAttrs, active }"
               asChild
               :value="i + 1"
            >
               <div
                  class="flex gap-2"
                  :class="{
                     'flex-auto': i < steps.length - 1
                  }"
                  v-bind="a11yAttrs.root"
               >
                  <Button
                     class="flex-auto"
                     v-bind="a11yAttrs.header"
                     :icon="step.icon"
                     :label="step.label"
                     :variant="!active ? 'outlined' : ''"
                     @click="() => setStep(value)"
                  />
                  <Divider class="!hidden lg:!flex flex-1" v-if="i < steps.length - 1" />
               </div>
            </Step>
         </StepList>
         <StepPanels>
            <StepPanel :value="1">
               <div class="flex flex-col gap-4">
                  <div class="mx-auto text-xl font-medium" v-text="$t('account_info')" />
                  <FormField
                     v-slot="slotProps"
                     fluid
                     :label="$t('email')"
                     :error="form._errors.first('account.email')"
                  >
                     <InputText autofocus v-bind="slotProps" v-model="form['account.email']" />
                  </FormField>
                  <FormField
                     v-slot="slotProps"
                     fluid
                     :label="$t('password')"
                     :error="form._errors.first('account.password')"
                  >
                     <Password
                        v-bind="slotProps"
                        v-model="form['account.password']"
                        :toggleMask="true"
                        :feedback="false"
                     />
                  </FormField>
                  <FormField
                     v-slot="slotProps"
                     fluid
                     :label="$t('password_confirmation')"
                     :error="form._errors.first('account.password_confirmation')"
                  >
                     <Password
                        v-bind="slotProps"
                        v-model="form['account.password_confirmation']"
                        :toggleMask="true"
                        :feedback="false"
                     />
                  </FormField>
                  <div class="w-1/2 self-end">
                     <Button
                        :label="$t('company')"
                        class="w-full"
                        :icon="PrimeIcons.CARET_RIGHT"
                        iconPos="right"
                        variant="outlined"
                        @click="() => form._validate(['account']) && setStep(2)"
                     />
                  </div>
               </div>
            </StepPanel>
            <StepPanel :value="2">
               <div class="flex flex-col gap-4">
                  <div
                     class="mx-auto text-surface-900 dark:text-surface-0 text-xl font-medium"
                     v-text="$t('company_info')"
                  />
                  <FormField
                     v-slot="slotProps"
                     fluid
                     :label="$t('display_name')"
                     :error="form._errors.first('company.display_name')"
                  >
                     <InputText v-bind="slotProps" v-model="form['company.display_name']" />
                  </FormField>
                  <FormField
                     v-slot="slotProps"
                     fluid
                     :label="$t('email')"
                     :error="form._errors.first('company.email')"
                  >
                     <InputText v-bind="slotProps" v-model="form['company.email']" />
                  </FormField>
                  <FormField
                     v-slot="slotProps"
                     fluid
                     :label="$t('phone')"
                     :error="form._errors.first('company.phone')"
                  >
                     <PhoneInput v-bind="slotProps" v-model="form['phone']" />
                  </FormField>
                  <div class="self-stretch flex gap-8">
                     <Button
                        label="Back"
                        severity="secondary"
                        class="w-full"
                        :icon="PrimeIcons.CARET_LEFT"
                        @click="() => setStep(1)"
                     />
                     <Button
                        :label="$t('submit')"
                        class="w-full"
                        type="submit"
                        variant="outlined"
                        icon-pos="right"
                        :icon="PrimeIcons.CARET_RIGHT"
                     />
                  </div>
               </div>
            </StepPanel>
         </StepPanels>
      </Stepper>
      <template #form-actions><template /></template>
   </FormBox>
</template>
<style lang="scss" scoped>
.welcome-bg {
   box-shadow: inset 0 0 1.5rem 2.5rem var(--surface-ground);
   background-color: #e5e5f7;
   opacity: 0.8;
   background-image:
      radial-gradient(circle at center center, var(--p-primary-500), #e5e5f7),
      repeating-radial-gradient(
         circle at center center,
         var(--p-primary-300),
         var(--p-primary-900),
         1rem,
         transparent 2rem,
         transparent 1rem
      );
   background-blend-mode: multiply;
}
</style>
