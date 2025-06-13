import { createI18n } from 'vue-i18n';

const { language: navigatorLanguage } = useNavigatorLanguage();

export async function loadLocaleMessages(i18n, locale) {
   const messages = await import(`./locales/${locale}/index.js`);

   i18n.setLocaleMessage(locale, messages.default);

   return nextTick();
}

export const guessUserLocale = computed(() => {
   return localStorage?.getItem?.('app_lang') || navigatorLanguage.value.slice(0, 2) || 'tr';
});

export const i18NPlugin = createI18n({
   legacy: false,
   locale: guessUserLocale.value,
   fallbackLocale: 'tr',
   globalInjection: true,
   missingWarn: false,
   fallbackWarn: false
});
export const SUPPORT_LOCALES = ['tr', 'en'];
export const locale = i18NPlugin.global.locale;

watch(
   locale,
   async (newLocale, oldLocale) => {
      if (oldLocale != newLocale) {
         localStorage?.setItem?.('app_lang', newLocale);
      }
      document.querySelector('html').setAttribute('lang', newLocale);
   },
   { immediate: true }
);

watch(
   locale,
   async (newLocale) => {
      await loadLocaleMessages(i18NPlugin.global, newLocale);
   },
   { immediate: true, once: true }
);

export default i18NPlugin.global;
