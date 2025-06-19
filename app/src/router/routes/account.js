import CustomRouteView from '@/components/layout/CustomRouteView.vue';
import { useConfirm } from 'primevue';
import router from '..';

/**
 * @type {import('vue-router').RouteLocation[]}
 */
export default [
   {
      path: 'account',
      name: 'account',
      meta: {
         label: i18n.t('route.label.account'),
         index: 10,
         icon: PrimeIcons.ID_CARD,
         layout: 'dashboard',
         requiresAuth: true,
         visible: () => {
            const { isSignedIn } = storeToRefs(useAuthStore());
            return isSignedIn?.value;
         }
      },
      components: {
         default: () => import('@/views/pages/account/Index.vue')
      },
      children: [
         {
            path: 'profile',
            name: 'account-profile',
            meta: {
               label: i18n.t('route.label.profile'),
               icon: PrimeIcons.USER,
               index: 1
            },
            components: {
               default: () => import('@/views/pages/account/profile/Index.vue'),
               skeleton: () => import('@/views/pages/account/profile/Index.vue')
            }
         },
         {
            path: 'settings',
            name: 'account-settings',
            meta: {
               label: i18n.t('route.label.settings'),
               icon: PrimeIcons.COG,
               index: 2
            },
            redirect: { name: 'update-profile' },
            component: CustomRouteView,
            children: [
               {
                  path: 'update-profile',
                  name: 'update-profile',
                  meta: {
                     label: i18n.t('route.label.update-profile'),
                     icon: PrimeIcons.USER_EDIT
                  },
                  components: {
                     default: () =>
                        import('@/views/pages/account/settings/update-profile/Index.vue')
                  }
               },
               {
                  path: 'update-password',
                  name: 'update-password',
                  meta: {
                     label: i18n.t('route.label.update-password'),
                     icon: PrimeIcons.LOCK
                  },
                  components: {
                     default: () =>
                        import('@/views/pages/account/settings/update-password/Index.vue')
                  }
               }
            ]
         },
         {
            meta: {
               label: i18n.t('route.label.logout'),
               icon: PrimeIcons.SIGN_OUT
            },
            async beforeEnter() {
               const res = new Promise((resolve, reject) => {
                  useConfirm().require({
                     icon: PrimeIcons.EXCLAMATION_TRIANGLE,
                     message: i18n.t('auth.confirm.logout.question'),
                     header: i18n.t('auth.confirm.logout.header'),
                     acceptProps: {
                        label: i18n.t('action.yes'),
                        outlined: true
                     },
                     rejectProps: {
                        label: i18n.t('action.no'),
                        severity: 'secondary',
                        outlined: true
                     },
                     accept: resolve,
                     reject: async () => {
                        if (router.options.history.state.back) {
                           return reject(false);
                        }
                        await router.replace({ name: 'dashboard' });
                        reject(false);
                     }
                  });
               });
               return await res;
            },
            path: 'logout',
            name: 'logout',
            component: () => import('@/views/pages/auth/Logout.vue')
         }
      ]
   }
];
