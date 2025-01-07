<script setup>
import { Form } from '@/lib/Form';

const form = new Form({
   data: {
      newPassword: '',
      newPasswordConfirmation: ''
   },
   rules: {
      newPassword: 'required|alpha_dash|min:8',
      newPasswordConfirmation: 'required|same:newPassword'
   }
});

const save = async () => {
   if (!form._validate()) {
      return;
   }
};
</script>
<template>
   <FormBox @submit="save" @reset="() => form._reset()" v-focustrap>
      <div class="flex-1 flex flex-wrap gap-4">
         <FormField :label="'newPassword'" :error="form._errors.first('newPassword')">
            <template #default="slotProps">
               <Password
                  fluid
                  autofocus
                  v-bind="slotProps"
                  :toggle-mask="true"
                  :feedback="false"
                  v-model="form['newPassword']"
                  @input="() => form._validate(['newPassword'])"
                  @blur="() => form._validate(['newPassword'])"
               />
            </template>
         </FormField>
         <FormField
            :label="'newPasswordConfirmation'"
            :error="form._errors.first('newPasswordConfirmation')"
         >
            <template #default="slotProps">
               <Password
                  fluid
                  v-bind="slotProps"
                  :toggle-mask="true"
                  :feedback="false"
                  v-model="form['newPasswordConfirmation']"
                  @blur="() => form._validate(['newPassword', 'newPasswordConfirmation'])"
               />
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
