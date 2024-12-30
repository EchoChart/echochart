import { UserModel } from '@/services/models/UserModel';
import Collection from '@lib/Collection';
import { useToast } from 'primevue/usetoast';

export const useAuthStore = defineStore('auth', () => {
    const session = new Collection();
    const toast = useToast();
    const router = useRouter();
    const route = useRoute();
    const user = shallowRef(new UserModel());
    const isSignedIn = computed(() => user?.value?.id);

    function setUser(userData = null) {
        if (userData) {
            if (_isNil(user.value)) {
                user.value = new UserModel(userData);
                return;
            }
            user.value._merge(userData);
            user.value._setDefaults(user.value.toObject);
            return;
        }
        user.value = null;
    }

    router.isReady().then(() => {
        watch(
            () => isSignedIn.value,
            (signedIn) => {
                if (signedIn) {
                    const backTo = router.options.history.state.back || '/';
                    if (['login', 'register'].includes(route.name)) {
                        router.replace(backTo);
                    }
                    return;
                }

                if (route?.meta?.requiresAuth) {
                    if (route.name == 'logout') return router.replace({ name: 'login' });
                    router.push({ name: 'login' });
                }
            }
        );
    });

    const initialized = new Promise((resolve) => {
        supabase.auth.onAuthStateChange((event, newSession) => {
            if (event === 'INITIAL_SESSION') {
                resolve(event, newSession);
            } else if (event === 'SIGNED_IN') {
                //
            } else if (event === 'SIGNED_OUT') {
                //
            } else if (event === 'PASSWORD_RECOVERY') {
                //
            } else if (event === 'TOKEN_REFRESHED') {
                //
            } else if (event === 'USER_UPDATED') {
                //
            }

            session._setDefaults(newSession)._reset();
            setUser(newSession?.user || null);

            if (['SIGNED_IN', 'SIGNED_OUT'].includes(event)) {
                if (event === 'SIGNED_OUT' && !isSignedIn.value) {
                    return;
                }
                const userToGreet = event === 'SIGNED_IN' ? newSession.user : user.value;
                const summary = i18n.t(`auth.${event === 'SIGNED_IN' ? 'welcome' : 'goodby'}`, {
                    name: userToGreet?.display_name || userToGreet?.email
                });
                const severity = event === 'SIGNED_IN' ? ToastSeverity.SUCCESS : ToastSeverity.INFO;
                toast.add({
                    life: 3000,
                    summary,
                    severity
                });
            }
        });
    });

    const loginWithPassword = async (loginData) => {
        const { data, error } = await supabase.auth.signInWithPassword(loginData);
        if (error) throw error;

        return data;
    };

    const logout = async () => {
        return await supabase.auth.signOut();
    };

    return { session, user, isSignedIn, initialized, loginWithPassword, logout };
});
