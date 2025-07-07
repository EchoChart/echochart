import { useNavigatorLanguage } from '@vueuse/core';
import dayjs from 'dayjs';
import { computed, watch } from 'vue';
import { createI18n } from 'vue-i18n';

export const dayjsLocales = {
   en: () => import('dayjs/locale/en'),
   tr: () => import('dayjs/locale/tr'),
   fr: () => import('dayjs/locale/fr'),
   de: () => import('dayjs/locale/de'),
   pl: () => import('dayjs/locale/pl'),
   ru: () => import('dayjs/locale/ru'),
   zh: () => import('dayjs/locale/zh'),
   ja: () => import('dayjs/locale/ja'),
   ko: () => import('dayjs/locale/ko')
};

const { language: navigatorLanguage } = useNavigatorLanguage();

export async function loadLocaleMessages(locale, i18n = i18NPlugin.global) {
   try {
      // Dynamically load dayjs locale
      const loadDayjsLocale = dayjsLocales[locale];
      if (loadDayjsLocale) {
         await loadDayjsLocale();
         dayjs.locale(locale);
      } else {
         console.warn(`dayjs locale '${locale}' not found, falling back to 'en'`);
         dayjs.locale('en');
      }

      const messages = await import(`./locales/${locale}/index.json`);

      i18n.setLocaleMessage(locale, messages.default);
   } catch (error) {
      console.warn(error);
   }
}

export const guessUserLocale = computed(() => {
   if (typeof window !== 'undefined')
      return localStorage?.getItem?.('app_lang') || navigatorLanguage.value.slice(0, 2) || 'en';
   return 'en';
});

export const i18NPlugin = createI18n({
   legacy: false,
   locale: guessUserLocale.value,
   fallbackLocale: 'en',
   globalInjection: true,
   missingWarn: false,
   fallbackWarn: false
});

export const SUPPORTED_LOCALES = computed(() => [
   { label: i18NPlugin.global.t('app_config.language.option.tr'), value: 'tr' },
   { label: i18NPlugin.global.t('app_config.language.option.en'), value: 'en' },
   { label: i18NPlugin.global.t('app_config.language.option.fr'), value: 'fr' },
   { label: i18NPlugin.global.t('app_config.language.option.de'), value: 'de' },
   { label: i18NPlugin.global.t('app_config.language.option.pl'), value: 'pl' },
   { label: i18NPlugin.global.t('app_config.language.option.ru'), value: 'ru' },
   { label: i18NPlugin.global.t('app_config.language.option.zh'), value: 'zh' },
   { label: i18NPlugin.global.t('app_config.language.option.ja'), value: 'ja' },
   { label: i18NPlugin.global.t('app_config.language.option.ko'), value: 'ko' }
]);

export const locale = i18NPlugin.global.locale;

if (typeof window !== 'undefined') {
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
         await loadLocaleMessages(newLocale);
      },
      { immediate: true, once: true }
   );
}

export default i18NPlugin.global;
