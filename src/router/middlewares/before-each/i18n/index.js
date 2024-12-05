export const i18NBeforeEach = async (to, from, next) => {
    const toLocale = to.params.locale;

    if (!SUPPORT_LOCALES.includes(toLocale)) {
        return next({ ...to, params: { ...to.params, locale: locale.value } });
    }

    if (!availableLocales.includes(toLocale)) {
        await loadLocaleMessages(i18n, toLocale);
    }

    locale.value = toLocale;
    return next();
};
