<script setup></script>

<template>
    <div class="flex flex-col items-center justify-center">
        <div
            class="p-1 rounded-[calc(var(--content-border-radius)*6)] bg-gradient-to-b from-[rgba(247,149,48,0.4)] via-transparent to-transparent"
        >
            <div
                class="w-full rounded-[inherit] bg-surface-0 dark:bg-surface-900 p-14 md:p-20 flex flex-col items-center"
            >
                <div class="gap-8 flex flex-col items-center">
                    <div
                        class="flex justify-center items-center border-2 border-orange-500 rounded-full"
                        style="width: 3.2rem; height: 3.2rem"
                    >
                        <i class="text-orange-500 pi pi-fw pi-lock !text-2xl"></i>
                    </div>
                    <h1 class="text-surface-900 dark:text-surface-0 font-bold text-4xl lg:text-5xl">
                        Access Denied
                    </h1>
                    <span class="text-muted-color"
                        >You do not have the necessary permisions. Please contact admins.</span
                    >
                    <img
                        src="/demo/images/access/asset-access.svg"
                        alt="Access denied"
                        width="80%"
                    />
                    <div class="col-span-12 text-center">
                        <Button as="router-link" label="Go to Dashboard" to="/" severity="warn" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
