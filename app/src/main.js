import { createApp } from 'vue';
import App from './App.vue';

import { i18NPlugin } from '@plugins/i18n';
import Aura from '@primeuix/themes/aura';
import { createPinia } from 'pinia';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';

import '@/assets/style/styles.scss';
import '@/assets/style/tailwind.css';
import DialogService from 'primevue/dialogservice';
import FocusTrap from 'primevue/focustrap';
import KeyFilter from 'primevue/keyfilter';
import Ripple from 'primevue/ripple';
import Tooltip from 'primevue/tooltip';
import router from './router';
import { FunctionsHttpError } from '@supabase/supabase-js';
import { defineAbility } from '@casl/ability';
import { abilitiesPlugin, Can } from '@casl/vue';
import { resolveAction } from './plugins/casl';

export const app = createApp(App);

app.config.globalProperties.emitter = emitter;

app.config.errorHandler = async (error) => {
   if (!error.message && !error.status && !error.code) return;
   if (error && error instanceof FunctionsHttpError) {
      const body = await error.context.json();
      error = _isEmpty(body) ? error.context : body;
   }
   console.error(error);

   // if (import.meta.env.DEV) {
   const summary = `${error.status || '500'}: ${i18n.t(error.details || error.code || error.name || error.statusText || 'unexpected_error')}`;
   const detail = i18n.t(error.message || 'an_unexpected_error_has_occured');

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
         router.replace({ name: 'login' });
         break;
      case 403: {
         router.push({ name: 'access-denied' });
         break;
      }
   }
   // }
};

app.use(
   abilitiesPlugin,
   defineAbility(() => {}, { resolveAction }),
   {
      useGlobalProperties: true
   }
).component(Can.name, Can);
app.use(createPinia());
app.use(i18NPlugin);
app.use(PrimeVue, {
   ripple: true,
   theme: {
      preset: Aura,
      options: {
         darkModeSelector: '[color-scheme*="dark"]'
      }
   }
});

app.use(DialogService);
app.use(ToastService);
app.use(ConfirmationService);
app.directive('keyfilter', KeyFilter);
app.directive('focustrap', FocusTrap);
app.directive('ripple', Ripple);
app.directive('tooltip', Tooltip);
app.use(router);

app.mount('#app');
