import RouteViewAnimated from '@/components/layout/RouteViewAnimated.vue';
import { createRouter, createWebHistory } from 'vue-router';
import { beforeEachMiddlewares } from './middlewares';

import accountRoutes from '@/router/routes/account';
import authRoutes from '@/router/routes/auth';

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
                                    const { user } = storeToRefs(useAuthStore());
                                    return !!user?.value?.id;
                                })
                            },
                            redirect: { name: 'dashboard' },
                            components: {
                                default: RouteViewAnimated,
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
                                            const { user } = storeToRefs(useAuthStore());
                                            return !!user?.value?.id;
                                        })
                                    },
                                    path: 'dashboard',
                                    name: 'dashboard',
                                    component: () => import('@/views/pages/Dashboard.vue')
                                },
                                ...accountRoutes
                            ]
                        },
                        ...authRoutes,
                        {
                            path: '',
                            meta: {
                                layout: 'error',
                                visible: false
                            },
                            children: [
                                {
                                    path: 'error',
                                    name: 'error',
                                    component: () => import('@/views/pages/Error.vue')
                                },
                                {
                                    path: `:pathMatch(.*)*`,
                                    name: 'notfound',
                                    component: () => import('@/views/pages/NotFound.vue')
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
