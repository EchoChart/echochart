import CustomRouteView from '@/components/layout/CustomRouteView.vue';
import { createRouter, createWebHistory } from 'vue-router';
import { beforeEachMiddlewares } from './middlewares';

import accountRoutes from '@/router/routes/account';
import authRoutes from '@/router/routes/auth';
import branchRoutes from '@/router/routes/branch';

export const DIALOG_POSITIONS = {
   LEFT: 'left',
   RIGHT: 'right',
   TOP: 'top',
   BOTTOM: 'bottom',
   CENTER: 'center',
   TOP_LEFT: 'topleft',
   TOP_RIGHT: 'topright',
   BOTTOM_LEFT: 'bottomleft',
   BOTTOM_RIGHT: 'bottomright'
};

const router = createRouter({
   history: createWebHistory(),
   routes: [
      {
         path: `/:locale(${SUPPORT_LOCALES.join('|')})?`,
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
                     redirect: { name: 'dashboard' },
                     components: {
                        default: CustomRouteView,
                        'layout-topbar': () => import('@/layouts/dashboard/Topbar.vue'),
                        'layout-sidebar': () => import('@/layouts/dashboard/Sidebar.vue'),
                        'layout-footer': () => import('@/layouts/dashboard/Footer.vue'),
                        'page-header': () => import('@/components/layout/AppBreadcrumb.vue')
                     },
                     children: [
                        {
                           meta: {
                              icon: PrimeIcons.CHART_LINE,
                              index: -1,
                              visible: computed(() => {
                                 const { isSignedIn } = storeToRefs(useAuthStore());
                                 return isSignedIn?.value;
                              })
                           },
                           path: 'dashboard',
                           name: 'dashboard',
                           component: () => import('@/views/pages/dashboard/Index.vue')
                        },
                        ...branchRoutes,
                        ...accountRoutes
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
                           components: {
                              default: () => import('@/views/pages/Error.vue'),
                              'layout-topbar': () => import('@/layouts/dashboard/Topbar.vue'),
                              'layout-sidebar': () => import('@/layouts/dashboard/Sidebar.vue'),
                              'layout-footer': () => import('@/layouts/dashboard/Footer.vue'),
                              'page-header': () => import('@/components/layout/AppBreadcrumb.vue')
                           }
                        },
                        {
                           path: `:pathMatch(.*)*`,
                           name: 'notfound',
                           components: {
                              default: () => import('@/views/pages/NotFound.vue'),
                              'layout-topbar': () => import('@/layouts/dashboard/Topbar.vue'),
                              'layout-footer': () => import('@/layouts/dashboard/Footer.vue'),
                              'page-header': () => import('@/components/layout/AppBreadcrumb.vue')
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

export default router;
