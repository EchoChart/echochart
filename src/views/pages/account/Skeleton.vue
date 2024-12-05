<script setup>
import { Skeleton } from 'primevue';

const dialogRef = inject('dialogRef', null);
const { breakpoints } = useLayout();
</script>
<template>
    <div class="card flex flex-col gap-4">
        <Teleport to="#page-toolbar" defer :disabled="!breakpoints.lg || dialogRef">
            <Menubar>
                <template #start>
                    <div class="flex gap-4">
                        <Skeleton class="min-w-24" height="2rem" width="100%" />
                        <Skeleton class="min-w-24" height="2rem" width="100%" />
                        <Skeleton class="min-w-24" height="2rem" width="100%" />
                    </div>
                </template>
            </Menubar>
        </Teleport>
        <RouteViewAnimated class="flex-1" />
    </div>
</template>
