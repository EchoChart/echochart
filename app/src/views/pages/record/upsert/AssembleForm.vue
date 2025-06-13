<script setup lang="ts">
import {
   INNER_MOLD_MODELS,
   INNER_MOLD_SPEAKER_POWERS,
   MOLD_MODELS,
   MOLD_SPEAKER_POWERS,
   MOLD_SPEAKER_SIZE,
   MOLD_TYPES,
   MOLD_VENTILATION
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
         :legend="$t('behind_ear_molds')"
         :error="form?._errors?.first(`attributes.behind_ear_molds`)"
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
                     'attributes.behind_ear_molds',
                     _concat(form.attributes.behind_ear_molds || [], [{}])
                  )
               "
            />
         </template>
         <FormBox
            printable
            v-for="(mold, i) in form?.attributes.behind_ear_molds"
            :key="'behind_ear_mold' + i"
            :legend="$t('behind_ear_mold')"
            class="min-w-fit max-w-max"
         >
            <template #actions>
               <Button
                  size="small"
                  class="self-center"
                  :icon="PrimeIcons.MINUS"
                  severity="danger"
                  variant="outlined"
                  @click="form.attributes.behind_ear_molds.splice?.(i, 1)"
               />
            </template>
            <span class="flex flex-wrap items-start gap-[inherit]">
               <FormField
                  fluid
                  :label="$t('type')"
                  :error="form?._errors?.first(`attributes.behind_ear_molds.${i}.type`)"
                  :readonly
                  v-slot="slotProps"
               >
                  <ListBox
                     v-bind="slotProps"
                     checkmark
                     scroll-height="100%"
                     option-label="label"
                     option-value="value"
                     :options="MOLD_TYPES"
                     :model-value="mold?.type"
                     @value-change="_set(mold, 'type', $event)"
                  />
               </FormField>
               <FormField
                  fluid
                  :label="$t('model')"
                  :error="form?._errors?.first(`attributes.behind_ear_molds.${i}.model`)"
                  :readonly
                  v-slot="slotProps"
               >
                  <ListBox
                     v-bind="slotProps"
                     checkmark
                     scroll-height="100%"
                     option-label="label"
                     option-value="value"
                     :options="MOLD_MODELS"
                     :model-value="mold?.model"
                     @value-change="_set(mold, 'model', $event)"
                  />
               </FormField>
               <FormField
                  fluid
                  :label="$t('speaker_power')"
                  :error="form?._errors?.first(`attributes.behind_ear_molds.${i}.speaker_power`)"
                  :readonly
                  v-slot="slotProps"
               >
                  <ListBox
                     v-bind="slotProps"
                     checkmark
                     scroll-height="100%"
                     :options="MOLD_SPEAKER_POWERS"
                     :model-value="mold?.speaker_power"
                     @value-change="_set(mold, 'speaker_power', $event)"
                  />
               </FormField>
            </span>
            <span class="flex flex-col gap-[inherit]">
               <FormField
                  fluid
                  :label="$t('side')"
                  :error="form?._errors?.first(`attributes.behind_ear_molds.${i}.side`)"
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
                     class="!min-w-[unset]"
                     :model-value="mold?.side"
                     @value-change="_set(mold, 'side', $event)"
                  />
               </FormField>
               <FormField
                  fluid
                  :error="form?._errors?.first(`attributes.behind_ear_molds.${i}.ventilation`)"
                  :readonly
                  class="w-full"
               >
                  <template #label="slotProps">
                     <label
                        v-bind="slotProps"
                        v-text="
                           `${_startCase($t('ventilation'))}: ${_get(mold, 'ventilation', '')}`
                        "
                     />
                  </template>
                  <template #default="slotProps">
                     <Slider
                        v-bind="_merge(slotProps, MOLD_VENTILATION)"
                        :model-value="mold?.ventilation"
                        @value-change="_set(mold, 'ventilation', $event)"
                     />
                  </template>
               </FormField>
               <FormField
                  fluid
                  :error="form?._errors?.first(`attributes.behind_ear_molds.${i}.speaker_size`)"
                  :readonly
                  class="w-full"
               >
                  <template #label="slotProps">
                     <label
                        v-bind="slotProps"
                        v-text="
                           `${_startCase($t('speaker_size'))}: ${_get(mold, 'speaker_size', '')}`
                        "
                     />
                  </template>
                  <template #default="slotProps">
                     <Slider
                        v-bind="_merge(slotProps, MOLD_SPEAKER_SIZE)"
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
         :legend="$t('inner_ear_molds')"
         :error="form?._errors?.first(`attributes.inner_ear_molds`)"
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
                     'attributes.inner_ear_molds',
                     _concat(form.attributes.inner_ear_molds || [], [{}])
                  )
               "
            />
         </template>
         <FormBox
            printable
            v-for="(mold, i) in form?.attributes.inner_ear_molds"
            :key="'inner_ear_mold' + i"
            :legend="$t('inner_ear_mold')"
            class="min-w-fit max-w-max"
         >
            <template #actions>
               <Button
                  size="small"
                  class="self-center"
                  :icon="PrimeIcons.MINUS"
                  severity="danger"
                  variant="outlined"
                  @click="form.attributes.inner_ear_molds.splice?.(i, 1)"
               />
            </template>
            <FormField
               fluid
               :label="$t('side')"
               :error="form?._errors?.first(`attributes.inner_ear_molds.${i}.side`)"
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
               :label="$t('model')"
               :error="form?._errors?.first(`attributes.inner_ear_molds.${i}.model`)"
               :readonly
               v-slot="slotProps"
            >
               <ListBox
                  v-bind="slotProps"
                  checkmark
                  scroll-height="100%"
                  option-label="label"
                  option-value="value"
                  :options="INNER_MOLD_MODELS"
                  :model-value="mold?.model"
                  @value-change="_set(mold, 'model', $event)"
               />
            </FormField>
            <FormField
               fluid
               :label="$t('speaker_power')"
               :error="form?._errors?.first(`attributes.inner_ear_molds.${i}.speaker_power`)"
               :readonly
               v-slot="slotProps"
            >
               <ListBox
                  v-bind="slotProps"
                  checkmark
                  scroll-height="100%"
                  :options="INNER_MOLD_SPEAKER_POWERS"
                  :model-value="mold?.speaker_power"
                  @value-change="_set(mold, 'speaker_power', $event)"
               />
            </FormField>
            <span class="flex flex-col items-start gap-[inherit]">
               <FormField
                  :label="$t('bluetooth')"
                  :error="form?._errors?.first(`attributes.inner_ear_molds.${i}.bluetooth`)"
                  :readonly
                  v-slot="slotProps"
               >
                  <Checkbox binary :readonly v-bind="slotProps" v-model="mold.bluetooth" />
               </FormField>
               <FormField
                  :label="$t('button')"
                  :error="form?._errors?.first(`attributes.inner_ear_molds.${i}.button`)"
                  :readonly
                  v-slot="slotProps"
               >
                  <Checkbox binary :readonly v-bind="slotProps" v-model="mold.button" />
               </FormField>
            </span>
            <div class="w-full flex flex-col gap-[inherit]">
               <FormField
                  fluid
                  :error="form?._errors?.first(`attributes.inner_ear_molds.${i}.ventilation`)"
                  :readonly
               >
                  <template #label="slotProps">
                     <label
                        v-bind="slotProps"
                        v-text="
                           `${_startCase($t('ventilation'))}: ${_get(mold, 'ventilation', '')}`
                        "
                     />
                  </template>
                  <template #default="slotProps">
                     <Slider
                        v-bind="_merge(slotProps, MOLD_VENTILATION)"
                        :model-value="mold?.ventilation"
                        @value-change="_set(mold, 'ventilation', $event)"
                     />
                  </template>
               </FormField>
            </div>
         </FormBox>
      </FormBox>
   </div>
</template>
