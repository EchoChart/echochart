import router from '..';

const logoutBeforeEnter = async () => {
   const authStore = useAuthStore();
   const { initialized } = authStore;

   await initialized;

   const { isSignedIn } = storeToRefs(authStore);

   if (isSignedIn.value) {
      await router.replace({ name: 'logout' }).catch(async () => {
         await router.replace({ name: 'account-profile' });
      });
      return false;
   }
   return true;
};

/**
 * @type {import('vue-router').RouteLocation[]}
 */
export default [
   {
      path: '',
      name: 'auth',
      meta: {
         layout: 'dashboard',
         requiresAuth: false
      },
      components: {
         default: () => import('@/views/pages/auth/Index.vue'),
         'layout-sidebar': () => import('@/layouts/dashboard/Sidebar.vue'),
         'layout-topbar': () => import('@/layouts/dashboard/Topbar.vue')
      },
      children: [
         {
            path: 'register',
            name: 'auth-register',
            meta: {
               label: i18n.t('route.label.register'),
               replace: true
            },
            components: {
               default: () => import('@/views/pages/auth/register/Index.vue')
            },
            beforeEnter: logoutBeforeEnter
         },
         {
            path: 'login',
            name: 'auth-login',
            meta: {
               label: i18n.t('route.label.login'),
               icon: PrimeIcons.SIGN_IN,
               replace: true
            },
            component: () => import('@/views/pages/auth/Login.vue'),
            beforeEnter: logoutBeforeEnter
         },
         {
            path: 'otp',
            name: 'auth-otp',
            meta: {
               requiresAuth: false,
               label: i18n.t('route.label.enter-auth-otp-code'),
               icon: PrimeIcons.SIGN,
               replace: true
            },
            alias: ['forgot-password', 'invite-code'],
            component: () => import('@/views/pages/auth/Otp.vue'),
            beforeEnter: logoutBeforeEnter
         }
      ]
   },
   {
      path: 'access-denied',
      name: 'access-denied',
      meta: {
         label: i18n.t('route.label.access-denied'),
         layout: 'dashboard',
         requiresAuth: false
      },
      components: {
         default: () => import('@/views/pages/auth/Access.vue'),
         'layout-sidebar': () => import('@/layouts/dashboard/Sidebar.vue'),
         'layout-topbar': () => import('@/layouts/dashboard/Topbar.vue')
      }
   }
];
