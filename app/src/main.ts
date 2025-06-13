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
import { defineAbility } from '@casl/ability';
import { abilitiesPlugin, Can } from '@casl/vue';
import { VueQueryPlugin } from '@tanstack/vue-query';
import DialogService from 'primevue/dialogservice';
import FocusTrap from 'primevue/focustrap';
import KeyFilter from 'primevue/keyfilter';
import Ripple from 'primevue/ripple';
import Tooltip from 'primevue/tooltip';
import { appErrorHandler } from './lib/appErrorHandler';
import { resolveAction } from './plugins/casl';
import { mutationCache, queryCache, queryClient } from './plugins/tanstack-query';
import router from './router';

export const app = createApp(App);

// app.config.globalProperties.emitter = emitter;

app.config.errorHandler = appErrorHandler;

app.use(
   abilitiesPlugin,
   defineAbility(() => {}, { resolveAction }),
   {
      useGlobalProperties: true
   }
).component(Can.name as string, Can);
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

app.use(VueQueryPlugin, {
   queryClient,
   queryClientConfig: {
      queryCache,
      mutationCache
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
