<template>
    <div class="flex-1 flex items-center justify-center">
        <div class="flex flex-col items-center justify-center">
            <div
                class="p-1 rounded-[calc(var(--content-border-radius)*6)] bg-gradient-to-b from-[rgba(233,30,99,0.4)] via-transparent to-transparent"
            >
                <div
                    class="p-1 rounded-[inherit] bg-surface-0 dark:bg-surface-900 p-14 flex flex-col gap-4 items-center"
                >
                    <span class="text-primary font-bold text-3xl" v-text="'404'" />
                    <h1
                        class="text-surface-900 dark:text-surface-0 font-bold text-3xl lg:text-5xl mb-2"
                        v-text="$t('not_found')"
                    />
                    <div
                        class="text-surface-600 dark:text-surface-200 mb-8"
                        v-text="$t('requested_resource_is_not_available')"
                    />
                    <!-- <router-link
                        to="/"
                        class="w-full flex items-center py-8 border-surface-300 dark:border-surface-500 border-b"
                    >
                        <span
                            class="flex justify-center items-center border-2 border-primary text-primary rounded-border"
                            style="height: 3.5rem; width: 3.5rem"
                        >
                            <i class="pi pi-fw pi-table !text-2xl"></i>
                        </span>
                        <span class="ml-6 flex flex-col">
                            <span
                                class="text-surface-900 dark:text-surface-0 lg:text-xl font-medium mb-0 block"
                                >Frequently Asked Questions</span
                            >
                            <span class="text-surface-600 dark:text-surface-200 lg:text-xl"
                                >Ultricies mi quis hendrerit dolor.</span
                            >
                        </span>
                    </router-link>
                    <router-link
                        to="/"
                        class="w-full flex items-center py-8 border-surface-300 dark:border-surface-500 border-b"
                    >
                        <span
                            class="flex justify-center items-center border-2 border-primary text-primary rounded-border"
                            style="height: 3.5rem; width: 3.5rem"
                        >
                            <i class="pi pi-fw pi-question-circle !text-2xl"></i>
                        </span>
                        <span class="ml-6 flex flex-col">
                            <span
                                class="text-surface-900 dark:text-surface-0 lg:text-xl font-medium mb-0"
                                >Solution Center</span
                            >
                            <span class="text-surface-600 dark:text-surface-200 lg:text-xl"
                                >Phasellus faucibus scelerisque eleifend.</span
                            >
                        </span>
                    </router-link>
                    <router-link
                        to="/"
                        class="w-full flex items-center mb-8 py-8 border-surface-300 dark:border-surface-500 border-b"
                    >
                        <span
                            class="flex justify-center items-center border-2 border-primary text-primary rounded-border"
                            style="height: 3.5rem; width: 3.5rem"
                        >
                            <i class="pi pi-fw pi-unlock !text-2xl"></i>
                        </span>
                        <span class="ml-6 flex flex-col">
                            <span
                                class="text-surface-900 dark:text-surface-0 lg:text-xl font-medium mb-0"
                                >Permission Manager</span
                            >
                            <span class="text-surface-600 dark:text-surface-200 lg:text-xl"
                                >Accumsan in nisl nisi scelerisque</span
                            >
                        </span>
                    </router-link> -->
                    <Button as="router-link" :label="$t('go_to_dashboard')" to="/" />
                </div>
            </div>
        </div>
    </div>
</template>
