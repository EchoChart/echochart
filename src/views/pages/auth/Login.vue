<script setup>
import { Form } from '@/lib/Form';
const authStore = useAuthStore();
const { loginWithPassword } = authStore;
const { isSignedIn } = storeToRefs(authStore);

const rememberMe = ref(!!localStorage.getItem('remember-me'));

const dialogRef = inject('dialogRef', null);

const form = new Form({
    data: {
        email: '',
        password: 'asdqwe123'
    },
    rules: {
        email: 'required|email',
        password: 'required'
    }
});

const login = async () => {
    if (!form._validate()) {
        return;
    }

    await loginWithPassword(form._toObject);

    localStorage.removeItem('remember-me');
    if (rememberMe.value) {
        localStorage.setItem('remember-me', form.email);
    }
};

watch(
    () => isSignedIn.value,
    async (value) => {
        value && dialogRef?.value?.close?.();
    },
    { immediate: true }
);

if (rememberMe.value) {
    form.email = localStorage.getItem('remember-me');
}
</script>

<template>
    <div class="min-h-full flex flex-col items-center justify-center">
        <div
            class="p-1 min-w-[25vw] rounded-[calc(var(--content-border-radius)*6)] bg-gradient-to-b from-[var(--primary-color)] via-[rgba(33,150,243,0)] to-transparent"
        >
            <div class="rounded-[inherit] bg-surface-0 dark:bg-surface-900 p-14">
                <div class="text-center mb-4">
                    <div
                        class="text-surface-900 dark:text-surface-0 text-3xl font-medium mb-4"
                        v-text="$t('welcome_to_echochart')"
                    />

                    <span class="text-muted-color font-medium" v-text="$t('sign_in_to_continue')" />
                </div>
                <FormBox @submit="login" class="flex flex-wrap justify-center" v-focustrap>
                    <div class="flex flex-col gap-8">
                        <FormField fluid :label="'email'" :error="form._errors.first('email')">
                            <template v-slot="slotProps">
                                <InputText autofocus v-bind="slotProps" v-model="form['email']" />
                            </template>
                        </FormField>
                        <FormField
                            fluid
                            :label="'password'"
                            :error="form._errors.first('password')"
                        >
                            <template v-slot="slotProps">
                                <Password
                                    v-bind="slotProps"
                                    v-model="form.password"
                                    :toggleMask="true"
                                    :feedback="false"
                                />
                            </template>
                        </FormField>

                        <div class="flex flex-col gap-8">
                            <div class="flex items-start justify-between gap-4">
                                <FormField reverse :label="'Remember me'">
                                    <template v-slot="slotProps">
                                        <Checkbox v-bind="slotProps" v-model="rememberMe" binary
                                    /></template>
                                </FormField>

                                <RouterLink
                                    custom
                                    v-slot="{ href, navigate }"
                                    :to="{ name: 'login', replace: true }"
                                >
                                    <a
                                        :href="href"
                                        @click="navigate"
                                        class="font-medium no-underline cursor-pointer text-primary"
                                        v-text="$t('forgot_password_?')"
                                    />
                                </RouterLink>
                            </div>
                            <Button type="submit" :label="'Login'" fluid />
                        </div>
                    </div>
                </FormBox>
            </div>
        </div>
    </div>
</template>
