import Collection from '@/libs/Collection';
import { UserModel } from '@/services/models/UserModel';
import { useToast } from 'primevue/usetoast';

export const useAuthStore = defineStore('auth', () => {
    const session = new Collection();
    const toast = useToast();
    const router = useRouter();
    const route = useRoute();
    const user = shallowRef(new UserModel());

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
            () => user.value,
            (newUser) => {
                if (newUser) {
                    const backTo = router.options.history.state.back || '/';
                    if (['login'].includes(route.name)) {
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

    supabase.auth.onAuthStateChange((event, newSession) => {
        if (event === 'INITIAL_SESSION') {
            //
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

        if (['SIGNED_IN', 'SIGNED_OUT'].includes(event)) {
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

        session._setDefaults(newSession)._reset();
        setUser(newSession?.user || null);
    });

    const loginWithPassword = async (loginData) => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword(loginData);
            if (error) throw error;

            return data;
        } catch (error) {
            toast.add({
                severity: ToastSeverity.WARN,
                summary: `${error.status}: ${i18n.t(error.code)}`,
                detail: error.message
            });
        }
    };

    const logout = async () => {
        return await supabase.auth.signOut();
    };

    return { session, user, loginWithPassword, logout };
});
