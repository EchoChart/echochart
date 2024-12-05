<script setup>
import { Form } from '@/libs/Form';
import { useToast } from 'primevue/usetoast';

const { user } = storeToRefs(useAuthStore());

const form = new Form({
    data: {
        ..._pick(user?.value, ['display_name', 'email'])
    },
    rules: {
        display_name: 'required|string',
        email: 'required|email'
    }
});
const toast = useToast();

const save = async () => {
    if (!form._validate()) return;
    console.log(form.toObject);
    // await accountStore.profileUpdate(form.changedData).then(() => {
    //     form._setDefaults(form.toObject);

    //     toast.add({
    //         life: 5000,
    //         severity: ToastSeverity.SUCCESS,
    //         summary: 'Saved successfully',
    //         detail: `${_toPairs(form.toObject).map(([key, value]) => `${_startCase(i18n.t(key))}: ${value}`).join`\n`}`
    //     });
    // });
};
const fakeLoader = new Promise((res) =>
    setTimeout(() => {
        res();
    }, 5000)
);

await fakeLoader;
</script>
<template>
    <FormBox @submit="save" @reset="() => form._reset()" v-focustrap>
        <div class="flex-1 flex flex-wrap gap-4">
            <FormField fluid :label="'display_name'" :error="form._errors.first('display_name')">
                <template #default="slotProps">
                    <InputText autofocus v-bind="slotProps" v-model="form['display_name']" />
                </template>
            </FormField>
            <FormField fluid :label="'email'" :error="form._errors.first('email')">
                <template #default="slotProps">
                    <InputText v-bind="slotProps" v-model="form['email']" />
                </template>
            </FormField>
        </div>
        <div class="flex flex-wrap items-end justify-end gap-4 w-full">
            <Button label="Save" class="flex-[.2]" :disabled="!form._isChanged" type="submit" />
            <Button
                label="Reset"
                severity="secondary"
                class="flex-[.2]"
                :disabled="!form._isChanged"
                type="reset"
            />
        </div>
    </FormBox>
</template>
