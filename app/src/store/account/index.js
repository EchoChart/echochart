export const useAccountStore = defineStore('account', () => {
   const updateUser = (...args) => supabase.auth.updateUser(...args);
   return {
      updateUser
   };
});
