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
   <FormBox
      :legend="$t('behind_ear_molds')"
      :error="form?._errors?.first(`attributes.assemble.behind_ear_molds`)"
   >
      <template #actions>
         <Button
            size="small"
            class="self-center"
            :icon="PrimeIcons.PLUS"
            variant="outlined"
            @click="
               form._set(
                  'attributes.assemble.behind_ear_molds',
                  _concat(form.attributes?.assemble?.behind_ear_molds || [], [{}])
               )
            "
         />
      </template>
      <FormBox
         v-for="(mold, i) in form?.attributes?.assemble?.behind_ear_molds"
         :key="'behind_ear_mold' + i"
         :legend="`${mold?.side ? $t(mold?.side) : $t('behind_ear_mold')}`"
         class="min-w-fit max-w-max"
      >
         <template #actions>
            <Button
               size="small"
               class="self-center"
               :icon="PrimeIcons.MINUS"
               variant="outlined"
               @click="form.attributes.assemble.behind_ear_molds.splice?.(i, 1)"
            />
         </template>
         <span class="flex flex-col gap-4">
            <FormField
               fluid
               :label="$t('side')"
               :error="form?._errors?.first(`attributes.assemble.behind_ear_molds.${i}.side`)"
               :readonly
               v-slot="slotProps"
            >
               <SelectButton
                  :options="[
                     { value: 'left', label: $t('left') },
                     { value: 'right', label: $t('right') }
                  ]"
                  :allow-empty="false"
                  option-value="value"
                  option-label="label"
                  v-bind="slotProps"
                  class="!min-w-fit w-fit"
                  :model-value="mold?.side"
                  @value-change="_set(mold, 'side', $event)"
               />
            </FormField>
            <FormField
               fluid
               :label="$t('type')"
               :error="form?._errors?.first(`attributes.assemble.behind_ear_molds.${i}.type`)"
               :readonly
               v-slot="slotProps"
            >
               <ListBox
                  v-bind="slotProps"
                  option-label="label"
                  option-value="value"
                  :options="moldTypes"
                  :model-value="mold?.type"
                  @value-change="_set(mold, 'type', $event)"
               />
            </FormField>
         </span>
         <FormField
            fluid
            :label="$t('model')"
            :error="form?._errors?.first(`attributes.assemble.behind_ear_molds.${i}.model`)"
            :readonly
            v-slot="slotProps"
         >
            <ListBox
               v-bind="slotProps"
               option-label="label"
               option-value="value"
               :options="moldModels"
               :model-value="mold?.model"
               @value-change="_set(mold, 'model', $event)"
            />
         </FormField>
         <div class="w-full flex flex-col gap-[inherit]">
            <FormField
               fluid
               :error="
                  form?._errors?.first(`attributes.assemble.behind_ear_molds.${i}.ventilation`)
               "
               :readonly
            >
               <template #label="slotProps">
                  <label
                     v-bind="slotProps"
                     v-text="`${_startCase($t('ventilation'))}: ${_get(mold, 'ventilation', '')}`"
                  />
               </template>
               <template #default="slotProps">
                  <Slider
                     v-bind="_merge(slotProps, moldVentilation)"
                     :model-value="mold?.ventilation"
                     @value-change="_set(mold, 'ventilation', $event)"
                  />
               </template>
            </FormField>
            <FormField
               fluid
               :error="
                  form?._errors?.first(`attributes.assemble.behind_ear_molds.${i}.speaker_size`)
               "
               :readonly
            >
               <template #label="slotProps">
                  <label
                     v-bind="slotProps"
                     v-text="`${_startCase($t('speaker_size'))}: ${_get(mold, 'speaker_size', '')}`"
                  />
               </template>
               <template #default="slotProps">
                  <Slider
                     v-bind="_merge(slotProps, moldSpeakerSize)"
                     :model-value="mold?.speaker_size"
                     @value-change="_set(mold, 'speaker_size', $event)"
                  />
               </template>
            </FormField>
         </div>
      </FormBox>
   </FormBox>
</template>
