import { useNavigatorLanguage } from '@vueuse/core';
import { computed, watch } from 'vue';
import { createI18n } from 'vue-i18n';

const { language: navigatorLanguage } = useNavigatorLanguage();

export async function loadLocaleMessages(i18n = i18NPlugin.global, locale) {
   try {
      const messages = await import(`./locales/${locale}/index.json`);

      i18n.setLocaleMessage(locale, messages.default);
   } catch (error) {
      console.warn(error);
   }
   return nextTick();
}

export const guessUserLocale = computed(() => {
   if (typeof window !== 'undefined')
      return localStorage?.getItem?.('app_lang') || navigatorLanguage.value.slice(0, 2) || 'tr';
});

export const i18NPlugin = createI18n({
   legacy: false,
   locale: guessUserLocale.value,
   fallbackLocale: guessUserLocale.value,
   globalInjection: true,
   missingWarn: false,
   fallbackWarn: false
});

export const SUPPORTED_LOCALES = computed(() => [
   { label: i18NPlugin.global.t('app_config.language.option.en'), value: 'en' },
   { label: i18NPlugin.global.t('app_config.language.option.tr'), value: 'tr' },
   { label: i18NPlugin.global.t('app_config.language.option.fr'), value: 'fr' },
   { label: i18NPlugin.global.t('app_config.language.option.de'), value: 'de' },
   { label: i18NPlugin.global.t('app_config.language.option.pl'), value: 'pl' },
   { label: i18NPlugin.global.t('app_config.language.option.ru'), value: 'ru' },
   { label: i18NPlugin.global.t('app_config.language.option.cn'), value: 'cn' },
   { label: i18NPlugin.global.t('app_config.language.option.jp'), value: 'jp' },
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
         await loadLocaleMessages(i18NPlugin.global, newLocale);
      },
      { immediate: true, once: true }
   );
}

export default i18NPlugin.global;
