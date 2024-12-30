<script setup>
import { Form } from '@/lib/Form';
const authStore = useAuthStore();
const { loginWithPassword } = authStore;
const { isSignedIn } = storeToRefs(authStore);

const dialogRef = inject('dialogRef', null);

const form = new Form({
    data: {
        account: {
            email: null,
            password: null,
            password_confirmation: null
        },
        company: {
            display_name: null,
            email: null
        }
    },
    rules: {
        account: {
            email: 'required|email',
            password: 'required|min:8',
            password_confirmation: 'required|same:account.password'
        },
        company: {
            display_name: 'required|min:3',
            email: 'required|email'
        }
    }
});

const submit = () => {
    if (!form._validate()) return;
    console.log(form._toObject);
};
</script>

<template>
    <div class="h-full flex justify-center">
        <div
            class="p-1 m-auto min-w-[30vw] rounded-[calc(var(--content-border-radius)*6)] bg-gradient-to-b from-[var(--primary-color)] via-[rgba(33,150,243,0)] to-transparent"
        >
            <div class="card flex flex-col gap-12 rounded-[inherit] p-12">
                <div class="text-center flex flex-col gap-8">
                    <div
                        class="text-surface-900 dark:text-surface-0 text-3xl font-medium"
                        v-text="$t('welcome_to_echochart')"
                    />

                    <span
                        class="text-muted-color text-sm font-medium"
                        v-text="$t('create_an_account_and_a_business')"
                    />
                    <!-- <span
                        class="text-muted-color text-xs font-medium"
                        v-text="
                            $t('to_keep_connected_with_us_please_login_with_your_company_account')
                        "
                    /> -->
                    <!-- <RouterLink custom :to="{ name: 'login' }" v-slot="{ href, navigate }">
                        <Button
                            as="a"
                            class="self-center !px-20 !border-primary-emphasis"
                            :href="href"
                            :label="$t('login')"
                            variant="outlined"
                            @click="navigate"
                        />
                    </RouterLink> -->
                </div>

                <FormBox @submit="submit">
                    <Stepper :value="1" linear class="flex-1">
                        <StepList>
                            <Step :value="1">
                                <span v-text="$t('account')" />
                            </Step>
                            <Step :value="2">
                                <span v-text="$t('business')" />
                            </Step>
                        </StepList>
                        <StepPanels>
                            <StepPanel v-slot="{ activateCallback, value }" :value="1">
                                <div class="flex flex-col gap-4">
                                    <div
                                        class="mx-auto text-surface-900 dark:text-surface-0 text-xl font-medium"
                                        v-text="$t('account_info')"
                                    />
                                    <FormField
                                        fluid
                                        :label="$t('email')"
                                        :error="form._errors.first('account.email')"
                                    >
                                        <template v-slot="slotProps">
                                            <InputText
                                                autofocus
                                                v-bind="slotProps"
                                                v-model="form.account.email"
                                            />
                                        </template>
                                    </FormField>
                                    <FormField
                                        fluid
                                        :label="$t('password')"
                                        :error="form._errors.first('account.password')"
                                    >
                                        <template v-slot="slotProps">
                                            <Password
                                                v-bind="slotProps"
                                                v-model="form.account.password"
                                                :toggleMask="true"
                                                :feedback="false"
                                            />
                                        </template>
                                    </FormField>
                                    <FormField
                                        fluid
                                        :label="$t('password_confirmation')"
                                        :error="form._errors.first('account.password_confirmation')"
                                    >
                                        <template v-slot="slotProps">
                                            <Password
                                                v-bind="slotProps"
                                                v-model="form.account.password_confirmation"
                                                :toggleMask="true"
                                                :feedback="false"
                                            />
                                        </template>
                                    </FormField>
                                    <div class="w-1/2 self-end">
                                        <Button
                                            label="Next"
                                            class="w-full"
                                            icon="pi pi-arrow-right"
                                            iconPos="right"
                                            variant="outlined"
                                            @click="
                                                () =>
                                                    form._validate(['account']) &&
                                                    activateCallback(2)
                                            "
                                        />
                                    </div>
                                </div>
                            </StepPanel>
                            <StepPanel v-slot="{ activateCallback }" :value="2">
                                <div class="flex flex-col gap-4">
                                    <div
                                        class="mx-auto text-surface-900 dark:text-surface-0 text-xl font-medium"
                                        v-text="$t('company_info')"
                                    />
                                    <FormField
                                        fluid
                                        :label="$t('email')"
                                        :error="form._errors.first('company.email')"
                                    >
                                        <template v-slot="slotProps">
                                            <InputText
                                                autofocus
                                                v-bind="slotProps"
                                                v-model="form['company.email']"
                                            />
                                        </template>
                                    </FormField>
                                    <FormField
                                        fluid
                                        :label="$t('display_name')"
                                        :error="form._errors.first('company.display_name')"
                                    >
                                        <template v-slot="slotProps">
                                            <InputText
                                                autofocus
                                                v-bind="slotProps"
                                                v-model="form['company.display_name']"
                                            />
                                        </template>
                                    </FormField>
                                    <div class="self-stretch flex gap-8">
                                        <Button
                                            label="Back"
                                            severity="secondary"
                                            class="w-full"
                                            variant="outlined"
                                            :icon="PrimeIcons.ARROW_LEFT"
                                            @click="() => activateCallback(1)"
                                        />
                                        <Button
                                            :label="$t('submit')"
                                            class="w-full"
                                            variant="outlined"
                                            icon-pos="right"
                                            :icon="PrimeIcons.SEND"
                                            type="submit"
                                        />
                                    </div>
                                </div>
                            </StepPanel>
                        </StepPanels>
                    </Stepper>
                </FormBox>
            </div>
        </div>
    </div>
</template>
