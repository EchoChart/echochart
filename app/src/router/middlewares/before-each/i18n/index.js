export const i18NBeforeEach = async (to, from, next) => {
   const toLocale = to.params.locale;

   if (!SUPPORTED_LOCALES.value.find((lang) => lang.value === toLocale)) {
      return next({ ...to, params: { ...to.params, locale: locale.value } });
   }

   await loadLocaleMessages(toLocale);

   locale.value = toLocale;
   return next();
};
