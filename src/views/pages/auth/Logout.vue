<script setup>
const { user } = storeToRefs(useAuthStore());
const { logout } = useAuthStore();

const dialogRef = inject('dialogRef', null);

dialogRef?.value?.options?.props?.closeButtonProps?.onClick?.();

watch(
    () => user.value,
    async (newUser) => {
        if (newUser?.id) {
            await logout();
        }
    },
    { immediate: true, deep: true, once: true }
);
</script>
<template><div v-text="$t(`logged_out_successfully`)" /></template>
