import CustomRouteView from '@/components/layout/CustomRouteView.vue';
import FloatingConfigurator from '@/components/layout/FloatingConfigurator.vue';
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

export default [
    {
        path: '',
        meta: {
            layout: 'dashboard',
            requiresAuth: false
        },
        components: {
            default: h(
                CustomRouteView,
                {
                    transitionProps: {
                        class: 'transition-[filter] duration-[calc(var(--transition-duration) * 100)]',
                        enterToClass: 'blur-none',
                        enterFromClass: 'blur-[16px]',
                        leaveFromClass: 'blur-none',
                        leaveToClass: 'blur-[16px]'
                    }
                },
                {
                    default: () => h(FloatingConfigurator)
                }
            )
        },
        children: [
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
