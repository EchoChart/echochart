import { createApp } from 'vue';
import App from './App.vue';

import { i18NPlugin } from '@plugins/i18n';
import Aura from '@primevue/themes/aura';
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

export const app = createApp(App);

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
