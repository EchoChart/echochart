import { useNavigatorLanguage } from '@vueuse/core';
import dayjs from 'dayjs';
import Validator from 'validatorjs/dist/validator.js';
import { computed, nextTick, watch } from 'vue';
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

export const validatorLocales = {
   de: () => import('validatorjs/src/lang/de.js'),
   en: () => import('validatorjs/src/lang/en.js'),
   fr: () => import('validatorjs/src/lang/fr.js'),
   ja: () => import('validatorjs/src/lang/ja.js'),
   ko: () => import('validatorjs/src/lang/ko.js'),
   pl: () => import('validatorjs/src/lang/pl.js'),
   ru: () => import('validatorjs/src/lang/ru.js'),
   tr: () => import('validatorjs/src/lang/tr.js'),
   zh: () => import('validatorjs/src/lang/zh.js')
};

const { language: navigatorLanguage } = useNavigatorLanguage();

export async function loadLocaleMessages(locale, i18n = i18NPlugin.global) {
   try {
      const messages = await import(`./locales/${locale}/index.json`);
      i18n.setLocaleMessage(locale, messages.default);

      // Dynamically load package locales
      const loadDayjsLocale = dayjsLocales[locale];
      const loadValidatorLocales = validatorLocales[locale];

      if (loadDayjsLocale) {
         await loadDayjsLocale();
         dayjs.locale(locale);
      } else {
         console.warn(`dayjs locale '${locale}' not found, falling back to 'en'`);
         dayjs.locale(i18NPlugin.global.fallbackLocale.value);
      }

      if (loadValidatorLocales) {
         Validator.setMessages(locale, await loadValidatorLocales());
         Validator.useLang(locale);
      } else {
         console.warn(`validator locale '${locale}' not found, falling back to 'en'`);
         Validator.setMessages(locale, await validatorLocales['en']?.());
         Validator.useLang('en');
      }

      return {
         [locale]: messages
      };
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
   nextTick(async () => {
      await loadLocaleMessages(i18NPlugin?.global?.fallbackLocale?.value);

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
   });
}

export default i18NPlugin.global;
