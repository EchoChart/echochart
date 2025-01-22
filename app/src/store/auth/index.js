import { UserModel } from '@/services/models/UserModel';
import Collection from '@lib/Collection';
import { jwtDecode } from 'jwt-decode';
import { useToast } from 'primevue/usetoast';

const tenantURLRegex = /^(?:https?:\/\/)?(?<tenant>(?!\d+\.\d+\.\d+\.\d+)[a-zA-Z0-9-]+)\./;

export const useAuthStore = defineStore('auth', () => {
   const session = new Collection();
   const toast = useToast();
   const router = useRouter();
   const route = useRoute();
   const user = shallowRef(new UserModel());
   const isSignedIn = computed(() => !!user?.value?.id);
   const currentTenant = new Collection({
      id: null,
      display_name: _get(window.location.href.match(tenantURLRegex), 'groups.tenant', null)
   });
   const branches = new Collection([]);

   function setUser(userData = null) {
      if (!_isNil(userData)) {
         if (_isNil(user.value)) {
            user.value = new UserModel(userData);
            return;
         }
         user.value._merge(userData);
         user.value._setDefaults(user.value.toObject);
         return;
      }
      user.value = null;
   }

   function fetchBranches() {
      if (!session.access_token) return;
      const tenants = jwtDecode(session.access_token)?.app_metadata?.allowed_tenants || [];
      if (_isNil(tenants) || tenants.length <= 0) {
         return;
      }
      branches._reset(tenants);
      if (!tenants.some(({ id }) => id === currentTenant?.id)) currentTenant._set(tenants[0]);
   }

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

      watch(
         () => currentTenant?.id,
         () => supabase.auth.refreshSession()
      );
   });

   const initialized = new Promise((resolve) => {
      supabase.auth.onAuthStateChange(async (event, newSession) => {
         if (['SIGNED_IN', 'SIGNED_OUT'].includes(event)) {
            if (event === 'SIGNED_OUT' && !isSignedIn.value) {
               return;
            }
            const userToGreet = event === 'SIGNED_IN' ? newSession.user : user.value;
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
         session._setDefaults(newSession)._reset();
         setUser(newSession?.user || null);

         branches._reset();
         fetchBranches();

         if (event === 'INITIAL_SESSION') {
            resolve(event, newSession);
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
      branches,
      user,
      isSignedIn,
      initialized,
      loginWithPassword,
      logout
   };
});
