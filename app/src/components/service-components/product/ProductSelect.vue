<script setup>
import { useProductStore } from '@/store/services/product';
const props = defineProps({
   category: {
      type: String,
      default: null,
      required: false
   },
   showEdit: {
      type: Boolean,
      default: true
   },
   showAdd: {
      type: Boolean,
      default: true
   }
});

defineOptions({
   inheritAttrs: false
});

const modelValue = defineModel('modelValue');

const categories = computed(() => props.category?.split?.('|') || []);

const { getProducts, getProductsByCategory } = useProductStore();
const allProducts = await getProducts();
const productsByCategory = await getProductsByCategory();

const product = computed(() => {
   if (categories.value.some?.((c) => _keys(productsByCategory._data).includes(c)))
      return _flatMap(_values(_pick(productsByCategory._data, categories.value)));
   return allProducts._data;
});
</script>

<template>
   <InputGroup :class="$attrs?.class">
      <Select
         :filter="true"
         :options="product"
         option-label="display_name"
         option-value="id"
         v-bind="$attrs"
         v-model:model-value="modelValue"
      />
      <InputGroupAddon
         v-if="showEdit && $can('modify', 'product') && (!!modelValue?.id || !!modelValue)"
      >
         <RouterLink
            :to="{
               name: 'product-edit',
               params: { id: modelValue?.id || modelValue },
               query: { showDialog: 'center' }
            }"
            v-slot="{ navigate }"
         >
            <Button
               rounded
               size="small"
               severity="info"
               :icon="PrimeIcons.PENCIL"
               @click="navigate"
            />
         </RouterLink>
      </InputGroupAddon>
      <InputGroupAddon v-if="showAdd && $can('create', 'product')">
         <RouterLink
            :to="{
               name: 'product-add',
               params: { category },
               query: { showDialog: 'center' }
            }"
            v-slot="{ navigate }"
         >
            <Button
               rounded
               size="small"
               severity="success"
               :icon="PrimeIcons.PLUS"
               @click="navigate"
            />
         </RouterLink>
      </InputGroupAddon>
   </InputGroup>
</template>
