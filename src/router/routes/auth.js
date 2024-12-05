import FloatingConfigurator from '@/components/layout/FloatingConfigurator.vue';
import RouteViewAnimated from '@/components/layout/RouteViewAnimated.vue';
import router from '..';

const logoutBeforeEnter = async () => {
    const {
        data: { user }
    } = await supabase.auth.getUser();

    if (user?.id) {
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
                RouteViewAnimated,
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
                    replace: true,
                    visible: computed(() => {
                        const { user } = storeToRefs(useAuthStore());
                        return !user?.value?.id;
                    })
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
