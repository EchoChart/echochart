<script setup>
import { moldModels, moldSpeakerSize, moldTypes, moldVentilation } from '@/constants/form/record';
import { Form } from '@/lib/Form';

const props = defineProps({
   id: {
      type: String,
      required: false
   },
   form: {
      type: Form,
      required: false
   },
   readonly: {
      type: Boolean,
      required: false
   }
});

const form = props.form;

const inner_mold_handle = false;
const inner_mold_wifi = false;
const inner_mold_button = false;

const repair_outer_service_name = '';
const repair_outer_service_bid = '';
</script>
<template>
   <FormBox :legend="$t('ear_mold')">
      <FormBox :legend="$t('behind_ear_mold')">
         <FormField
            :label="$t('mold_type')"
            :error="form._errors.first('attributes.mold_type')"
            fluid
            :readonly
            v-slot="slotProps"
         >
            <Select
               v-bind="slotProps"
               option-label="label"
               option-value="value"
               :options="moldTypes"
               v-model="form.attributes.mold_type"
            />
         </FormField>
         <FormField
            :label="$t('mold_model')"
            :error="form._errors.first('attributes.mold_model')"
            fluid
            :readonly
            v-slot="slotProps"
         >
            <Select
               v-bind="slotProps"
               option-label="label"
               option-value="value"
               :options="moldModels"
               v-model="form.attributes.mold_model"
            />
         </FormField>
         <FormField :error="form._errors.first('attributes.mold_ventilation')" fluid :readonly>
            <template #label="slotProps">
               <label
                  v-bind="slotProps"
                  v-text="
                     `${_startCase($t('mold_ventilation'))}: ${_get(form.attributes, 'mold_ventilation', '')}`
                  "
               />
            </template>
            <template #default="slotProps">
               <Slider
                  v-bind="_merge(slotProps, moldVentilation)"
                  v-model:modelValue="form.attributes.mold_ventilation"
               />
            </template>
         </FormField>
         <FormField :error="form._errors.first('attributes.mold_speaker_size')" fluid :readonly>
            <template #label="slotProps">
               <label
                  v-bind="slotProps"
                  v-text="
                     `${_startCase($t('mold_speaker_size'))}: ${_get(form.attributes, 'mold_speaker_size', '')}`
                  "
               />
            </template>
            <template #default="slotProps">
               <Slider
                  v-bind="_merge(slotProps, moldSpeakerSize)"
                  v-model:modelValue="form.attributes.mold_speaker_size"
               />
            </template>
         </FormField>
      </FormBox>
   </FormBox>
</template>
