<script setup lang="ts">
import {
   DEVICE_MODELS,
   DEVICE_SPEAKER_POWERS,
   DEVICE_SPEAKER_SIZE,
   DEVICE_TYPES,
   DEVICE_VENTILATION,
   INNER_DEVICE_MODELS,
   INNER_DEVICE_SPEAKER_POWERS
} from '@/constants/form/record';
import { Form } from '@/lib/Form';
import { RecordUpsertFormData } from './index.vue';

export type RecordAssembleFormProps = {
   readonly?: boolean;
};

defineProps<RecordAssembleFormProps>();

const form = inject('recordForm', Form.create<RecordUpsertFormData>());
</script>
<template>
   <div class="w-full flex flex-col gap-[inherit]">
      <FormBox
         printable
         :legend="$t('fields.rear_ear_devices')"
         :error="form?._errors?.first(`attributes.rear_ear_devices`)"
      >
         <template #actions>
            <Button
               size="small"
               class="self-center"
               :icon="PrimeIcons.PLUS"
               variant="outlined"
               severity="success"
               @click="
                  form._set(
                     'attributes.rear_ear_devices',
                     _concat(form.attributes.rear_ear_devices || [], [{}])
                  )
               "
            />
         </template>
         <FormBox
            printable
            :title="$t('fields.attributes')"
            v-for="(mold, i) in form?.attributes.rear_ear_devices"
            :key="'rear_ear_device' + i"
            :legend="$t('fields.rear_ear_device')"
            class="min-w-fit max-w-max"
         >
            <template #actions>
               <Button
                  size="small"
                  class="self-center"
                  :icon="PrimeIcons.MINUS"
                  severity="danger"
                  variant="outlined"
                  @click="form.attributes.rear_ear_devices.splice?.(i, 1)"
               />
            </template>
            <span class="flex flex-wrap items-start gap-[inherit]">
               <FormField
                  fluid
                  :label="$t('fields.type')"
                  :error="form?._errors?.first(`attributes.rear_ear_devices.${i}.type`)"
                  :readonly
                  v-slot="slotProps"
               >
                  <ListBox
                     v-bind="slotProps"
                     checkmark
                     scroll-height="100%"
                     option-label="label"
                     option-value="value"
                     :options="DEVICE_TYPES"
                     :model-value="mold?.type"
                     @value-change="_set(mold, 'type', $event)"
                  />
               </FormField>
               <FormField
                  fluid
                  :label="$t('fields.model')"
                  :error="form?._errors?.first(`attributes.rear_ear_devices.${i}.model`)"
                  :readonly
                  v-slot="slotProps"
               >
                  <ListBox
                     v-bind="slotProps"
                     checkmark
                     scroll-height="100%"
                     option-label="label"
                     option-value="value"
                     :options="DEVICE_MODELS"
                     :model-value="mold?.model"
                     @value-change="_set(mold, 'model', $event)"
                  />
               </FormField>
               <FormField
                  fluid
                  :label="$t('fields.speaker_power')"
                  :error="form?._errors?.first(`attributes.rear_ear_devices.${i}.speaker_power`)"
                  :readonly
                  v-slot="slotProps"
               >
                  <ListBox
                     v-bind="slotProps"
                     checkmark
                     scroll-height="100%"
                     :options="DEVICE_SPEAKER_POWERS"
                     :model-value="mold?.speaker_power"
                     @value-change="_set(mold, 'speaker_power', $event)"
                  />
               </FormField>
            </span>
            <span class="flex flex-col gap-[inherit]">
               <FormField
                  fluid
                  :label="$t('fields.side')"
                  :error="form?._errors?.first(`attributes.rear_ear_devices.${i}.side`)"
                  :readonly
                  v-slot="slotProps"
               >
                  <SelectButton
                     :options="[
                        { value: 'left', label: $t('fields.left') },
                        { value: 'right', label: $t('fields.right') }
                     ]"
                     :allow-empty="false"
                     option-value="value"
                     option-label="label"
                     v-bind="slotProps"
                     class="!min-w-[unset]"
                     :model-value="mold?.side"
                     @value-change="_set(mold, 'side', $event)"
                  />
               </FormField>
               <FormField
                  fluid
                  :error="form?._errors?.first(`attributes.rear_ear_devices.${i}.ventilation`)"
                  :readonly
                  class="w-full"
               >
                  <template #label="slotProps">
                     <label
                        v-bind="slotProps"
                        v-text="`${$t('fields.ventilation')}: ${_get(mold, 'ventilation', '')}`"
                     />
                  </template>
                  <template #default="slotProps">
                     <Slider
                        v-bind="_merge(slotProps, DEVICE_VENTILATION)"
                        :model-value="mold?.ventilation"
                        @value-change="_set(mold, 'ventilation', $event)"
                     />
                  </template>
               </FormField>
               <FormField
                  fluid
                  :error="form?._errors?.first(`attributes.rear_ear_devices.${i}.speaker_size`)"
                  :readonly
                  class="w-full"
               >
                  <template #label="slotProps">
                     <label
                        v-bind="slotProps"
                        v-text="`${$t('fields.speaker_size')}: ${_get(mold, 'speaker_size', '')}`"
                     />
                  </template>
                  <template #default="slotProps">
                     <Slider
                        v-bind="_merge(slotProps, DEVICE_SPEAKER_SIZE)"
                        :model-value="mold?.speaker_size"
                        @value-change="_set(mold, 'speaker_size', $event)"
                     />
                  </template>
               </FormField>
            </span>
         </FormBox>
      </FormBox>
      <FormBox
         printable
         :legend="$t('fields.inner_ear_devices')"
         :error="form?._errors?.first(`attributes.inner_ear_devices`)"
      >
         <template #actions>
            <Button
               size="small"
               class="self-center"
               :icon="PrimeIcons.PLUS"
               variant="outlined"
               severity="success"
               @click="
                  form._set(
                     'attributes.inner_ear_devices',
                     _concat(form.attributes.inner_ear_devices || [], [{}])
                  )
               "
            />
         </template>
         <FormBox
            printable
            v-for="(mold, i) in form?.attributes.inner_ear_devices"
            :key="'inner_ear_device' + i"
            :legend="$t('fields.inner_ear_device')"
         >
            <template #actions>
               <Button
                  size="small"
                  class="self-center"
                  :icon="PrimeIcons.MINUS"
                  severity="danger"
                  variant="outlined"
                  @click="form.attributes.inner_ear_devices.splice?.(i, 1)"
               />
            </template>
            <span class="flex w-min flex-wrap gap-[inherit]">
               <FormField
                  fluid
                  :label="$t('fields.side')"
                  :error="form?._errors?.first(`attributes.inner_ear_devices.${i}.side`)"
                  :readonly
                  v-slot="slotProps"
               >
                  <SelectButton
                     :options="[
                        { value: 'left', label: $t('fields.left') },
                        { value: 'right', label: $t('fields.right') }
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
                  :error="form?._errors?.first(`attributes.inner_ear_devices.${i}.ventilation`)"
                  :readonly
                  class="w-full"
               >
                  <template #label="slotProps">
                     <label
                        v-bind="slotProps"
                        v-text="`${$t('fields.ventilation')}: ${_get(mold, 'ventilation', '')}`"
                     />
                  </template>
                  <template #default="slotProps">
                     <Slider
                        v-bind="_merge(slotProps, DEVICE_VENTILATION)"
                        :model-value="mold?.ventilation"
                        @value-change="_set(mold, 'ventilation', $event)"
                     />
                  </template>
               </FormField>
            </span>
            <FormField
               fluid
               :label="$t('fields.model')"
               :error="form?._errors?.first(`attributes.inner_ear_devices.${i}.model`)"
               :readonly
               v-slot="slotProps"
            >
               <ListBox
                  v-bind="slotProps"
                  checkmark
                  scroll-height="100%"
                  option-label="label"
                  option-value="value"
                  :options="INNER_DEVICE_MODELS"
                  :model-value="mold?.model"
                  @value-change="_set(mold, 'model', $event)"
               />
            </FormField>
            <FormField
               fluid
               :label="$t('fields.speaker_power')"
               :error="form?._errors?.first(`attributes.inner_ear_devices.${i}.speaker_power`)"
               :readonly
               v-slot="slotProps"
            >
               <ListBox
                  v-bind="slotProps"
                  checkmark
                  scroll-height="100%"
                  :options="INNER_DEVICE_SPEAKER_POWERS"
                  :model-value="mold?.speaker_power"
                  @value-change="_set(mold, 'speaker_power', $event)"
               />
            </FormField>
            <span class="flex w-min flex-wrap gap-[inherit]">
               <FormField
                  :label="$t('fields.has_bluetooth')"
                  :error="form?._errors?.first(`attributes.inner_ear_devices.${i}.bluetooth`)"
                  :readonly
                  v-slot="slotProps"
               >
                  <Checkbox binary :readonly v-bind="slotProps" v-model="mold.has_bluetooth" />
               </FormField>
               <FormField
                  :label="$t('fields.has_button')"
                  :error="form?._errors?.first(`attributes.inner_ear_devices.${i}.button`)"
                  :readonly
                  v-slot="slotProps"
               >
                  <Checkbox binary :readonly v-bind="slotProps" v-model="mold.has_button" />
               </FormField>
            </span>
         </FormBox>
      </FormBox>
   </div>
</template>
