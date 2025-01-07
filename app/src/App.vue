<script setup>
import { useToast } from 'primevue/usetoast';
import { app } from './main';
import { FunctionsHttpError } from '@supabase/supabase-js';

const toast = useToast();

app.config.errorHandler = async (error) => {
   if (error && error instanceof FunctionsHttpError) {
      const body = await error.context.json();
      error = _isEmpty(body) ? error.context : body;
   }
   console.error(error);
   // if (import.meta.env.DEV) {
   const summary = `${error.status || '500'}: ${i18n.t(error.details || error.code || error.name || error.statusText || 'unexpected_error')}`;
   const detail = i18n.t(error.message || 'an_unexpected_error_has_occured');

   toast.add({
      life: 5000,
      severity: ToastSeverity.WARN,
      summary,
      detail
   });
   // }
};
</script>

<template>
   <Suspense>
      <ConfirmDialog />
   </Suspense>
   <Suspense>
      <DynamicDialog />
   </Suspense>
   <Toast position="bottom-right" />
   <Transition
      appear
      enter-active-class="animate-fadein animate-duration-[calc(var(--transition-duration)*0.5)]"
      leave-active-class="animate-fadeout animate-duration-[calc(var(--transition-duration)*0.5)]"
      mode="out-in"
   >
      <Suspense>
         <router-view />
      </Suspense>
   </Transition>
</template>

<style>
#app {
   display: flex;
   height: 100vh;
   width: 100vw;
   overflow: hidden;
}
</style>
