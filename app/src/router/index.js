import CustomRouteView from '@/components/layout/CustomRouteView.vue';
import { createRouter, createWebHistory } from 'vue-router';
import { beforeEachMiddlewares } from './middlewares';

import { appErrorHandler } from '@/lib/appErrorHandler';
import accountRoutes from '@/router/routes/account';
import addressRoutes from '@/router/routes/address';
import authRoutes from '@/router/routes/auth';
import branchRoutes from '@/router/routes/branch';
import clientRoutes from '@/router/routes/client';
import recordRoutes from '@/router/routes/record';
import stockRoutes from '@/router/routes/stock';

const router = createRouter({
   history: createWebHistory(),
   routes: [
      {
         path: `/:locale(${SUPPORTED_LOCALES.value.map((lang) => lang.value).join('|')})?`,
         children: [
            {
               path: ``,
               component: () => import('@/layouts/AppLayout.vue'),
               children: [
                  {
                     path: '',
                     meta: {
                        layout: 'dashboard',
                        requiresAuth: true,
                        visible: computed(() => {
                           const { isSignedIn } = storeToRefs(useAuthStore());
                           return isSignedIn?.value;
                        })
                     },
                     redirect: { name: 'account-profile' },
                     components: {
                        default: CustomRouteView,
                        'layout-topbar': () => import('@/layouts/dashboard/Topbar.vue'),
                        'layout-sidebar': () => import('@/layouts/dashboard/Sidebar.vue'),
                        'layout-footer': () => import('@/layouts/dashboard/Footer.vue'),
                        'page-header': () => import('@/components/layout/AppBreadcrumb.vue')
                     },
                     children: [
                        // {
                        //    path: 'dashboard',
                        //    name: 'dashboard',
                        //    meta: {
                        //       label: i18n.t('route.label.dashboard'),
                        //       icon: PrimeIcons.CHART_LINE,
                        //       index: -999,
                        //       visible: computed(() => {
                        //          const { isSignedIn } = storeToRefs(useAuthStore());
                        //          return isSignedIn?.value;
                        //       })
                        //    },
                        //    component: () => import('@/views/pages/dashboard/Index.vue')
                        // },
                        ...branchRoutes,
                        ...addressRoutes,
                        ...clientRoutes,
                        ...stockRoutes,
                        ...accountRoutes,
                        ...recordRoutes
                     ]
                  },
                  ...authRoutes,
                  {
                     path: '',
                     meta: {
                        layout: 'dashboard',
                        visible: false
                     },
                     children: [
                        {
                           path: 'error',
                           name: 'error',
                           meta: {
                              label: i18n.t('route.label.error')
                           },
                           components: {
                              default: () => import('@/views/pages/Error.vue'),
                              'layout-topbar': () => import('@/layouts/dashboard/Topbar.vue'),
                              'layout-sidebar': () => import('@/layouts/dashboard/Sidebar.vue'),
                              'layout-footer': () => import('@/layouts/dashboard/Footer.vue')
                              // 'page-header': () => import('@/components/layout/AppBreadcrumb.vue')
                           }
                        },
                        {
                           path: `:pathMatch(.*)*`,
                           name: 'notfound',
                           meta: {
                              label: i18n.t('route.label.notfound')
                           },
                           components: {
                              default: () => import('@/views/pages/NotFound.vue'),
                              'layout-topbar': () => import('@/layouts/dashboard/Topbar.vue'),
                              'layout-footer': () => import('@/layouts/dashboard/Footer.vue')
                              // 'page-header': () => import('@/components/layout/AppBreadcrumb.vue')
                           }
                        }
                     ]
                  }
               ]
            }
         ]
      }
   ]
});

beforeEachMiddlewares.forEach((middleware) => {
   router.beforeEach(middleware);
});

router.onError(async (error, to) => {
   const status = error?.status;

   switch (status) {
      case 401: {
         await router.replace({ name: 'auth-login' });
         break;
      }

      case 403: {
         await appErrorHandler(error);
         to.name = 'access-denied';
         await router.push(to);
         break;
      }

      default: {
         await appErrorHandler(error);
         router.push({ name: 'error' });
         break;
      }
   }
});

export default router;
