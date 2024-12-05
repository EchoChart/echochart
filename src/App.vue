<script setup>
import { useToast } from 'primevue/usetoast';
import { app } from './main';

const toast = useToast();

app.config.errorHandler = (error) => {
    console.error(error);
    if (import.meta.env.DEV || i18n.te(error.code) || i18n.te(error.message)) {
        const summary = i18n.te(error.code) ? i18n.t(error.code) : error.code;

        const detail = i18n.te(error.message) ? i18n.t(error.message) : error.message;

        toast.add({
            life: 5000,
            severity: ToastSeverity.WARN,
            summary,
            detail
        });
    }
};
</script>

<template>
    <Suspense>
        <ConfirmDialog />
    </Suspense>
    <Suspense>
        <DynamicDialog />
    </Suspense>
    <Toast position="bottom-right" />
    <Transition
        appear
        enter-active-class="animate-fadein animate-duration-[calc(var(--transition-duration)*0.5)]"
        leave-active-class="animate-fadeout animate-duration-[calc(var(--transition-duration)*0.5)]"
        mode="out-in"
    >
        <Suspense>
            <router-view />
        </Suspense>
    </Transition>
</template>

<style>
#app {
    display: flex;
    height: 100vh;
    width: 100vw;
    overflow: hidden;
}
</style>
