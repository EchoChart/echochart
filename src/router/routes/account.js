import RouteViewAnimated from '@/components/layout/RouteViewAnimated.vue';
import { useConfirm } from 'primevue';
import router from '..';

export default [
    {
        path: 'account',
        name: 'account',
        meta: {
            index: 10,
            icon: PrimeIcons.ID_CARD,
            layout: 'dashboard',
            requiresAuth: true,
            visible: computed(() => {
                const { user } = storeToRefs(useAuthStore());
                return !!user?.value?.id;
            })
        },
        // redirect: {
        //     name: 'account-profile'
        // },
        components: {
            default: () => import('@/views/pages/account/Index.vue')
            // ,skeleton: () => import('@/views/pages/account/Index.vue')
        },
        children: [
            {
                meta: {
                    icon: PrimeIcons.USER,
                    index: 1
                },
                path: 'profile',
                name: 'account-profile',
                components: {
                    default: () => import('@/views/pages/account/profile/Index.vue')
                    // ,skeleton: () => import('@/views/pages/account/profile/Index.vue')
                }
            },
            {
                meta: {
                    icon: PrimeIcons.COG,
                    index: 2
                },
                path: 'settings',
                name: 'account-settings',
                redirect: { name: 'update-profile' },
                component: RouteViewAnimated,
                children: [
                    {
                        meta: {
                            icon: PrimeIcons.USER_EDIT
                        },
                        path: 'update-profile',
                        name: 'update-profile',
                        components: {
                            default: () =>
                                import('@/views/pages/account/settings/UpdateProfile.vue')
                        }
                    },
                    {
                        meta: {
                            icon: PrimeIcons.LOCK
                        },
                        path: 'update-password',
                        name: 'update-password',
                        components: {
                            default: () =>
                                import('@/views/pages/account/settings/UpdatePassword.vue')
                        }
                    }
                ]
            },
            {
                meta: {
                    icon: PrimeIcons.SIGN_OUT
                },
                async beforeEnter() {
                    const res = new Promise((resolve) => {
                        useConfirm().require({
                            icon: PrimeIcons.EXCLAMATION_TRIANGLE,
                            message: i18n.t('are_you_sure_you_want_to_logout?'),
                            header: i18n.t('logout'),
                            acceptProps: {
                                label: i18n.t('yes'),
                                outlined: true
                            },
                            rejectProps: {
                                label: i18n.t('no'),
                                severity: 'secondary',
                                outlined: true
                            },
                            accept: resolve,
                            reject: async () => {
                                if (router.options.history.state.back) {
                                    return;
                                }
                                await router.replace({ name: 'dashboard' });
                                resolve(false);
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
