<script setup>
import {
   AsYouType,
   getCountries,
   getCountryCallingCode,
   isSupportedCountry
} from 'libphonenumber-js';

const attrs = useAttrs();
defineOptions({
   inheritAttrs: false
});

const countryPhoneCodes = computed(() =>
   getCountries()
      .flatMap((phone) => ({
         name: phone,
         countryCallingCode: _toNumber(getCountryCallingCode(phone))
      }))
      .toSorted((a, b) => a?.countryCallingCode - b?.countryCallingCode)
);

const isValid = ref(true);
const invalid = computed(() => attrs.invalid || !isValid.value);

const countrySelect = ref({
   name: null,
   countryCallingCode: null
});

const modelValue = defineModel('modelValue', {
   get: (value) => {
      const inputValue = new AsYouType();
      inputValue.input(value || '');

      if (inputValue.country) {
         countrySelect.value = {
            name: null,
            countryCallingCode: null
         };
         countrySelect.value.name = inputValue.getCountry();
         countrySelect.value.countryCallingCode = inputValue.getCallingCode();
      }

      return inputValue.getNationalNumber();
   },
   set: (value) => {
      if (isSupportedCountry(countrySelect.value?.name)) {
         return '+' + countrySelect.value?.countryCallingCode + (value || '');
      }
      return value;
   }
});
</script>

<template>
   <InputGroup :class="$attrs.class">
      <InputGroupAddon class="!p-0 !border-0">
         <Select
            v-model:model-value="countrySelect"
            :options="countryPhoneCodes"
            filter
            :filter-fields="['name', 'countryCallingCode']"
            class="h-full !rounded-[inherit] -mr-[1px]"
            :invalid
         >
            <template #value="{ value }">
               <span>{{ [value?.name, value?.countryCallingCode].join` | ` }}</span>
            </template>
            <template #option="{ option }">
               <span>{{ [option?.name, option?.countryCallingCode].join` | ` }}</span>
            </template>
         </Select>
      </InputGroupAddon>
      <InputMask
         v-bind="_omit($attrs, ['class'])"
         v-model:model-value="modelValue"
         mask="(9?99) 999-9999"
         unmask
         :invalid
      />
   </InputGroup>
</template>
