export const authBeforeEach = async (to, from, next) => {
    if (!to.meta.requiresAuth) {
        return next();
    }

    try {
        const {
            data: { user },
            error
        } = await supabase.auth.getUser();

        if (!user?.id || error) {
            throw error || Error(i18n.t('auth.user_not_found'));
        }
        next();
    } catch (error) {
        supabase.auth.signOut();
        next({ name: 'login' });
    }
};
