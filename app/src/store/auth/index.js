import { UserModel } from '@/services/models/UserModel';
import { ABILITY_TOKEN } from '@casl/vue';
import Collection from '@lib/Collection';
import { jwtDecode } from 'jwt-decode';
import { useToast } from 'primevue/usetoast';

const tenantURLRegex = /^(?:https?:\/\/)?(?<tenant>(?!\d+\.\d+\.\d+\.\d+)[a-zA-Z0-9-]+)\./;

export const useAuthStore = defineStore('auth', () => {
   function useCurrentTenant() {
      const currentTenant = new Collection({
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
         () => jwt.value?.app_metadata?.permissions,
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

   const session = new Collection();
   const jwt = computed(() => {
      return session?.access_token ? jwtDecode(session?.access_token) : null;
   });
   const user = new UserModel();
   const isSignedIn = computed(() => !!user?.id);
   const branches = computed(() => new Collection(jwt?.value?.app_metadata?.allowed_tenants || []));
   const { currentTenant, setCurrentTenant, changeCurrentTenant } = useCurrentTenant();
   const { ability } = useAbility();

   const initialized = new Promise((resolve) => {
      supabase.auth.onAuthStateChange(async (event, newSession) => {
         if (['SIGNED_IN', 'SIGNED_OUT'].includes(event)) {
            if (event === 'SIGNED_OUT' && !isSignedIn.value) {
               return;
            }
            const userToGreet = event === 'SIGNED_IN' ? newSession.user : user;
            const summary = i18n.t(`${event === 'SIGNED_IN' ? 'welcome' : 'goodby'}`, {
               name: userToGreet?.display_name || userToGreet?.email
            });
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

   router.isReady().then(() => {
      watch(
         () => isSignedIn.value,
         (signedIn) => {
            if (signedIn) {
               const backTo = router.options.history.state.back || '/';
               if (['login', 'register'].includes(route.name)) {
                  router.replace(backTo);
               }

               return;
            }

            if (route?.meta?.requiresAuth) {
               if (route.name == 'logout') return router.replace({ name: 'login' });
               router.push({ name: 'login' });
            }
         }
      );
   });

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
