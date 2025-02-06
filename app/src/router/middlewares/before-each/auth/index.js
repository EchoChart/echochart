import { CustomAuthError } from '@supabase/supabase-js';

export const authBeforeEach = async (to, from, next) => {
   const authStore = useAuthStore();
   const { meta } = to;

   if (meta?.requiresAuth) {
      await authStore.initialized;

      const { error } = await supabase.auth.refreshSession();

      if (error) {
         error.status = 401;
         throw error;
      }
   }

   if (meta?.requiredPermissions) {
      const {
         ability: { cannot }
      } = authStore;
      const youShallNotPASS = meta?.requiredPermissions?.some?.(({ action, subject }) =>
         cannot?.(action, subject)
      );
      if (youShallNotPASS) {
         throw new CustomAuthError(
            i18n.t('insufficient_permissions'),
            'AuthInvalidCredentialsError',
            403
         );
      }
   }
   next();
};
