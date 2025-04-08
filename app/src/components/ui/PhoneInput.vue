<script setup>
import {
   AsYouType,
   isValidPhoneNumber,
   parsePhoneNumberWithError,
   getCountries,
   getCountryCallingCode
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

const modelValue = defineModel('modelValue');

const inputValue = ref(new AsYouType());

inputValue.value.input(modelValue.value || '');

watch(
   () => inputValue.value,
   (phone) => {
      if (phone.isValid() && modelValue.value !== phone.getNumberValue())
         modelValue.value = phone.getNumberValue();
   },
   { deep: true }
);

watch(
   () => modelValue.value,
   (phone) => {
      if (isValidPhoneNumber(phone || '')) {
         const instance = parsePhoneNumberWithError(phone);
         inputValue.value = new AsYouType(instance.country);
         inputValue.value.input(instance.nationalNumber);
         return;
      }
      inputValue.value = new AsYouType();
   },
   { immediate: true }
);
</script>

<template>
   <InputGroup :class="$attrs.class">
      <InputGroupAddon class="!p-0 !border-0">
         <Select
            :model-value="countryPhoneCodes.find((e) => e.name == inputValue.getCountry())"
            @value-change="inputValue = new AsYouType($event.name)"
            :options="countryPhoneCodes"
            filter
            :filter-fields="['countryCallingCode', 'name']"
            class="h-full !rounded-[inherit] -mr-[1px]"
            :invalid
         >
            <template #value="{ value }">
               <span>{{ [value?.name || '?', value?.countryCallingCode || '?'].join(' | ') }}</span>
            </template>
            <template #option="{ option }">
               <span>{{ [option?.name, option?.countryCallingCode].join(' | ') }}</span>
            </template>
         </Select>
      </InputGroupAddon>
      <InputMask
         v-bind="_omit($attrs, ['class'])"
         :model-value="inputValue.getNationalNumber()"
         @value-change="
            inputValue.reset();
            inputValue.input($event);
         "
         mask="(9?99) 999-9999"
         unmask
         :auto-clear="false"
         :invalid
      />
   </InputGroup>
</template>
