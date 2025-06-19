import { app } from '@/main';
import router from '@/router';
import { FunctionsHttpError } from '@supabase/supabase-js';

export const appErrorHandler = async (error) => {
   console.error(error);
   if (!error.message && !error.status && !error.code) return;
   if (error && error instanceof FunctionsHttpError) {
      const body = await error.context.json();
      error = _isEmpty(body) ? error.context : body;
   }

   if (import.meta.env.DEV) {
      const summary = `${error.status || '500'}: ${i18n.t(error.details || error.code || error.name || error.statusText || 'unexpected_error')}`;
      const detail = error.message ? i18n.t(error.message) : '';

      const toast = app.config?.globalProperties?.$toast;
      toast?.add?.({
         life: 5000,
         severity: ToastSeverity.WARN,
         summary,
         detail
      });

      switch (error?.status) {
         case 401:
            supabase?.auth?.signOut?.();
            router.replace({ name: 'auth-login' });
            break;
         case 403: {
            router.push({ name: 'access-denied' });
            break;
         }
      }
   }
};
