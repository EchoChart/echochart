export const authBeforeEach = async (to, from, next) => {
   if (!to.meta.requiresAuth) {
      return next();
   }

   try {
      const authStore = useAuthStore();

      await authStore.initialized;

      const { error } = await supabase.auth.refreshSession();

      if (error) throw Error(error);

      next();
   } catch (error) {
      supabase.auth.signOut();
      next({ name: 'login', replace: true });
   }
};
