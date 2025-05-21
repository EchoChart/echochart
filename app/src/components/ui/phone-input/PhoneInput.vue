<script setup>
import {
   AsYouType,
   getCountries,
   getCountryCallingCode,
   isSupportedCountry,
   isValidPhoneNumber
} from 'libphonenumber-js';
import { InputText } from 'primevue';

defineOptions({
   inheritAttrs: false
});

defineProps({
   ...InputText.props,
   readonly: {
      type: Boolean,
      default: false
   },
   loading: {
      type: Boolean,
      default: false
   },
   invalid: {
      type: Boolean,
      default: false
   }
});

const countryPhoneCodes = computed(() =>
   getCountries()
      .flatMap((countryCode) => ({
         countryCode,
         countryCallingCode: _toNumber(getCountryCallingCode(countryCode))
      }))
      .filter((countryPhone) => isSupportedCountry(countryPhone?.countryCode))
      .toSorted((a, b) => a?.countryCallingCode - b?.countryCallingCode)
);

const selectedCountry = computed({
   get: () => {
      return {
         countryCode: modelValue.value?.getCountry?.(),
         countryCallingCode: modelValue.value?.getCallingCode?.()
      };
   },
   set: (value) => {
      if (isSupportedCountry(value?.countryCode)) {
         const instance = new AsYouType({
            defaultCountry: value.countryCode,
            defaultCallingCode: value.countryCallingCode
         });
         const nationalNumber = modelValue.value.getNationalNumber();
         const phoneNumber = '+' + value.countryCallingCode + nationalNumber;

         instance.input(phoneNumber);

         modelValue.value = instance.getNumberValue();
      }
   }
});

const modelValue = defineModel('modelValue', {
   get: (value) => {
      const inputValue = new AsYouType();
      inputValue.input(value || '');
      return inputValue;
   },
   set: (value) => {
      return value || null;
   }
});
</script>

<template>
   <InputGroup :class="$attrs.class">
      <InputGroupAddon class="!p-0 !border-0">
         <Select
            v-model="selectedCountry"
            :options="countryPhoneCodes"
            filter
            :filter-fields="['countryCode', 'countryCallingCode']"
            class="h-full !rounded-[inherit] -mr-[1px]"
            :disabled="readonly"
            :loading
            :invalid
         >
            <template #value="{ value }">
               <span>{{
                  [value?.countryCode, value?.countryCallingCode].filter(Boolean).join` | `
               }}</span>
            </template>
            <template #option="{ option }">
               <span>
                  {{ [option?.countryCode, option?.countryCallingCode].filter(Boolean).join` | ` }}
               </span>
            </template>
         </Select>
      </InputGroupAddon>
      <InputMask
         v-bind="_omit({ ...$attrs, ...$props }, ['class'])"
         :model-value="modelValue.getNationalNumber()"
         @value-change="modelValue = '+' + selectedCountry.countryCallingCode + $event"
         mask="(9?99) 999-9999"
         unmask
         :readonly
         :loading
         :invalid
      />
   </InputGroup>
</template>
