<script setup>
import AppConfigurator from '@components/layout/AppConfigurator.vue';

const appConfigurator = ref();
</script>

<template>
    <div class="fixed flex gap-4 top-8 right-8">
        <Button icon="pi pi-palette" @click="appConfigurator?.toggle" type="button" rounded />
        <Popover class="w-min" ref="appConfigurator">
            <AppConfigurator />
        </Popover>
    </div>
</template>
