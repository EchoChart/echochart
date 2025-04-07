<script setup>
import { countries } from 'countries-list';
import { getExampleNumber, isValidPhoneNumber, parsePhoneNumberWithError } from 'libphonenumber-js';

const countryPhoneCodes = computed(() =>
   _values(countries)
      .flatMap(({ phone, name }) =>
         phone.map((phone) => ({ name, countryCallingCode: phone.toString() }))
      )
      .filter((e) => e?.countryCallingCode?.length <= 3)
      .toSorted((a, b) => a?.countryCallingCode - b?.countryCallingCode)
);

const modelValue = defineModel('modelValue');

const inputValue = computed({
   get: () =>
      isValidPhoneNumber(modelValue.value || '')
         ? parsePhoneNumberWithError(modelValue.value)
         : getExampleNumber('TR', { TR: '5555555555' }),
   set: ({ countryCallingCode, nationalNumber }) => {
      const phone = countryCallingCode + nationalNumber;
      if (isValidPhoneNumber(phone)) {
         modelValue.value = phone;
      }
   }
});
</script>

<template>
   <InputGroup>
      <InputGroupAddon class="!p-0">
         <Select
            :model-value="inputValue.countryCallingCode"
            @value-change="inputValue = { ...inputValue, countryCallingCode: $event }"
            :options="countryPhoneCodes"
            option-label="name"
            option-value="countryCallingCode"
            filter
            :filter-fields="['name', 'countryCallingCode']"
         >
            <template #value="{ value }">{{ value }}</template>
            <template #option="{ option }">
               <span>{{ [option?.countryCallingCode, option?.name].join(' | ') }}</span>
            </template>
         </Select>
      </InputGroupAddon>
      <InputMask
         :model-value="inputValue.nationalNumber"
         @value-change="inputValue = { ...inputValue, nationalNumber: $event }"
         mask="999 999 9999"
         unmask
      />
   </InputGroup>
</template>
