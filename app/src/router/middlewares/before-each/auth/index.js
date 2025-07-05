import { CustomAuthError } from '@supabase/supabase-js';
import { useToast } from 'primevue';

export const authBeforeEach = async (to, from, next) => {
   try {
      const hash = window.location.hash?.substring(1);
      const params = new URLSearchParams(hash);
      const toast = useToast();

      const access_token = params.get('access_token');
      const refresh_token = params.get('refresh_token');

      if (access_token && refresh_token) {
         const { error } = await supabase.auth.setSession({
            access_token,
            refresh_token
         });

         if (error) throw error;

         toast.add({
            life: 0,
            closable: true,
            severity: ToastSeverity.INFO,
            summary: i18n.t('auth.welcome.title'),
            detail: i18n.t('auth.please_dont_forget_to_update_your_password')
         });

         window.history.replaceState({}, document.title, to.path);

         return next({ name: 'update-password' });
      }

      const authStore = useAuthStore();
      const { meta } = to;
      await authStore.initialized;

      if (
         meta?.requiresAuth &&
         (from.name !== to.name || (to.redirectedFrom?.name && to.redirectedFrom.name !== to.name))
      ) {
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
               i18n.t('errors.insufficient_permission'),
               i18n.t('errors.AuthInvalidCredentialsError'),
               403
            );
         }
      }

      next();
   } catch (error) {
      throw error;
   }
};
