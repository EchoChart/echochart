// app/src/store/auth/index.ts

import { MongoAbility } from '@casl/ability';
import { ABILITY_TOKEN } from '@casl/vue';
import Collection from '@lib/Collection';
import { jwtDecode } from 'jwt-decode';
import { defineStore } from 'pinia';
import { useToast } from 'primevue/usetoast';
import { computed, inject, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { RouteLocationAsPath, useRoute, useRouter } from 'vue-router';

const tenantURLRegex = /^(?:https?:\/\/)?(?<tenant>(?!\d+\.\d+\.\d+\.\d+)[a-zA-Z0-9-]+)\./;

export const useAuthStore = defineStore('auth', () => {
   const toast = useToast();
   const router = useRouter();
   const route = useRoute();
   const { t } = useI18n();

   const session = Collection.create<Session>();
   const user = Collection.create<User>();

   const jwt = computed(() => {
      return session?.access_token ? jwtDecode<JwtPayload>(session?.access_token) : null;
   });

   const isSignedIn = computed(() => !!user?.id);
   const branches = computed(() => jwt?.value?.app_metadata?.allowed_tenant || []);

   function useCurrentTenant() {
      const currentTenant = Collection.create<Tenant>({
         id: null,
         display_name: _get(window.location.href.match(tenantURLRegex), 'groups.tenant', null)
      });

      function setCurrentTenant(tenant?: Tenant) {
         currentTenant?._reset();

         const current_tenant_id = jwt.value?.app_metadata?.current_tenant_id;

         if (branches.value.length <= 0) return;

         tenant ??= branches.value.find(
            ({ display_name, id }) =>
               id == current_tenant_id || display_name === currentTenant.display_name
         );
         currentTenant?._reset(tenant || branches.value[0]);
      }

      async function changeCurrentTenant(tenant: Tenant) {
         if (currentTenant.id === tenant.id) return;

         await supabase.auth.updateUser({
            data: { current_tenant_id: tenant.id }
         });

         await supabase.auth.refreshSession();

         setCurrentTenant(tenant);
      }

      return { currentTenant, setCurrentTenant, changeCurrentTenant };
   }

   function useAbility() {
      const ability = inject<MongoAbility>(ABILITY_TOKEN);

      watch(
         () => jwt.value?.app_metadata?.permission,
         (newPermissions: Permission[] = []) => {
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

   const { currentTenant, setCurrentTenant, changeCurrentTenant } = useCurrentTenant();
   const { ability } = useAbility();

   async function handleAuthStateChange(event: string, newSession?: Session) {
      const previousSignedIn = isSignedIn.value;

      session._reset(newSession);
      user._reset(newSession?.user);

      if (['SIGNED_IN', 'SIGNED_OUT'].includes(event)) {
         if (event === 'SIGNED_OUT' && !previousSignedIn) return;

         const summary = event === 'SIGNED_IN' ? t('auth.toast.welcome') : t('auth.toast.goodby');
         const severity = event === 'SIGNED_IN' ? ToastSeverity.SUCCESS : ToastSeverity.INFO;

         toast.add({ summary, severity, life: 3000 });
      }

      return { event, newSession };
   }

   const initialized = new Promise((resolve) => {
      supabase.auth.onAuthStateChange(async (event, newSession) => {
         const result = await handleAuthStateChange(event, newSession);

         if (newSession?.access_token) {
            setCurrentTenant();
         }
         if (event === 'INITIAL_SESSION') {
            resolve(result);
         }
      });
   });

   watch(
      () => isSignedIn.value,
      async (signedIn) => {
         await router.isReady();
         await initialized;

         if (signedIn) {
            if (route.name.toString().startsWith('auth-')) {
               const backTo =
                  (router.options.history.state.back as unknown as RouteLocationAsPath) || '/';
               return router.replace(backTo);
            }
            return;
         }

         if (route?.meta?.requiresAuth) {
            if (route.name === 'logout') {
               return router.replace({ name: 'auth-login' });
            }
            router.push({ name: 'auth-login' });
         }
      }
   );

   const loginWithPassword = async (loginData: LoginData) => {
      const { data, error } = await supabase.auth.signInWithPassword(loginData);
      if (error) throw error;
      return data;
   };

   const logout = async () => {
      return await supabase.auth.signOut();
   };

   return {
      session,
      user,
      jwt,
      isSignedIn,
      branches,
      currentTenant,
      changeCurrentTenant,
      ability,
      loginWithPassword,
      logout,
      initialized
   };
});

interface Session {
   access_token: string;
   user: User;
}

interface User {
   id: string | null;
}

interface JwtPayload {
   app_metadata?: AppMetadata;
}

interface AppMetadata {
   allowed_tenant?: Tenant[];
   current_tenant_id?: string;
   permission: Permission[];
}

interface Tenant {
   id: string | null;
   display_name: string | null;
}

interface Permission {
   command: string;
   resource_name: string;
}

interface LoginData {
   email: string;
   password: string;
}
