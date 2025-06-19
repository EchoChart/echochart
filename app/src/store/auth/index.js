import { ABILITY_TOKEN } from '@casl/vue';
import Collection from '@lib/Collection';
import { jwtDecode } from 'jwt-decode';
import { useToast } from 'primevue/usetoast';

const tenantURLRegex = /^(?:https?:\/\/)?(?<tenant>(?!\d+\.\d+\.\d+\.\d+)[a-zA-Z0-9-]+)\./;

export const useAuthStore = defineStore('auth', () => {
   function useCurrentTenant() {
      const currentTenant = Collection.create({
         id: null,
         display_name: _get(window.location.href.match(tenantURLRegex), 'groups.tenant', null)
      });

      function setCurrentTenant(tenant) {
         const current_tenant_id = jwt.value?.user_metadata?.current_tenant_id;

         if (branches.value.length <= 0) return;

         tenant ??= branches.value.find(
            ({ display_name }) => display_name === currentTenant.display_name
         );
         tenant ??= branches.value.find(({ id }) => id === current_tenant_id);

         currentTenant?._set(tenant || branches.value[0]);
      }

      async function changeCurrentTenant(tenant = currentTenant) {
         const current_tenant_id = jwt.value?.user_metadata?.current_tenant_id;
         if (current_tenant_id === tenant.id) return;

         setCurrentTenant(tenant);

         await Promise.all([
            supabase.auth.updateUser({
               data: {
                  current_tenant_id: tenant.id
               }
            }),
            supabase.auth.refreshSession()
         ]);
      }

      return { currentTenant, setCurrentTenant, changeCurrentTenant };
   }

   function useAbility() {
      const ability = inject(ABILITY_TOKEN);

      watch(
         () => jwt.value?.app_metadata?.permission,
         (newPermissions = []) => {
            ability.update(
               newPermissions.map(({ command, resource_name }) => ({
                  action: command,
                  subject: resource_name?.replace?.('public.', '')
               }))
            );
         },
         { immediate: true, deep: true }
      );

      return { ability };
   }

   const toast = useToast();
   const router = useRouter();
   const route = useRoute();
   const { t, te } = useI18n();

   const session = Collection.create();
   const jwt = computed(() => {
      return session?.access_token ? jwtDecode(session?.access_token) : null;
   });
   const user = Collection.create();
   const isSignedIn = computed(() => !!user?.id);
   const branches = computed(() =>
      Collection.create(jwt?.value?.app_metadata?.allowed_tenant || [])
   );
   const { currentTenant, setCurrentTenant, changeCurrentTenant } = useCurrentTenant();
   const { ability } = useAbility();

   const initialized = new Promise((resolve) => {
      supabase.auth.onAuthStateChange(async (event, newSession) => {
         if (['SIGNED_IN', 'SIGNED_OUT'].includes(event)) {
            if (event === 'SIGNED_OUT' && !isSignedIn.value) {
               return;
            }
            const userToGreet = event === 'SIGNED_IN' ? newSession.user : user;
            const summary =
               event === 'SIGNED_IN' ? t('auth.toast.welcome') : t('auth.toast.goodby');
            const severity = event === 'SIGNED_IN' ? ToastSeverity.SUCCESS : ToastSeverity.INFO;
            toast.add({
               life: 3000,
               summary,
               severity
            });
         }
         session._reset(newSession);
         user._reset(newSession?.user);

         setCurrentTenant();
         changeCurrentTenant(currentTenant);

         if (event === 'INITIAL_SESSION') {
            resolve({ event, newSession });
         } else if (event === 'SIGNED_IN') {
            //
         } else if (event === 'SIGNED_OUT') {
            //
         } else if (event === 'PASSWORD_RECOVERY') {
            //
         } else if (event === 'TOKEN_REFRESHED') {
            //
         } else if (event === 'USER_UPDATED') {
            //
         }
      });
   });

   watch(
      () => isSignedIn.value,
      async (signedIn) => {
         await router.isReady();
         await initialized;

         if (signedIn) {
            const backTo = router.options.history.state.back || '/';
            if (['auth-login', 'auth-register'].includes(route.name)) {
               router.replace(backTo);
            }

            return;
         }

         if (route?.meta?.requiresAuth && !signedIn) {
            if (route.name == 'logout') return router.replace({ name: 'auth-login' });
            router.push({ name: 'auth-login' });
         }
      }
   );

   const loginWithPassword = async (loginData) => {
      const { data, error } = await supabase.auth.signInWithPassword(loginData);
      if (error) throw error;

      return data;
   };

   const logout = async () => {
      return await supabase.auth.signOut();
   };

   return {
      session,
      currentTenant,
      changeCurrentTenant,
      branches,
      user,
      isSignedIn,
      initialized,
      ability,
      loginWithPassword,
      logout
   };
});
