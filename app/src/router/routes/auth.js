import router from '..';

const logoutBeforeEnter = async () => {
   const authStore = useAuthStore();
   const { initialized } = authStore;

   await initialized;

   const { isSignedIn } = storeToRefs(authStore);

   if (isSignedIn.value) {
      await router.replace({ name: 'logout' }).catch(async () => {
         await router.replace({ name: 'dashboard' });
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
         // default: h(CustomRouteView, {
         //     transitionProps: {
         //         class: 'transition-[filter] duration-[calc(var(--transition-duration) * 100)]',
         //         enterToClass: 'blur-none',
         //         enterFromClass: 'blur-[16px]',
         //         leaveFromClass: 'blur-none',
         //         leaveToClass: 'blur-[16px]'
         //     }
         // }),
         'layout-topbar': () => import('@/layouts/dashboard/Topbar.vue')
      },
      children: [
         {
            name: 'register',
            path: 'register',
            meta: {
               replace: true
            },
            components: {
               default: () => import('@/views/pages/auth/register/Index.vue')
            },
            beforeEnter: logoutBeforeEnter
         },
         {
            meta: {
               icon: PrimeIcons.SIGN_IN,
               replace: true
            },
            path: 'login',
            name: 'login',
            component: () => import('@/views/pages/auth/Login.vue'),
            beforeEnter: logoutBeforeEnter
         },
         {
            path: 'access-denied',
            name: 'access-denied',
            component: () => import('@/views/pages/auth/Access.vue')
         }
      ]
   }
];
