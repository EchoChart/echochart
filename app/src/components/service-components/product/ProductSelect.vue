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

const productStore = useProductStore().useProducts();
const allProducts = await productStore.getProducts();
const productsByCategory = await productStore.getProductsByCategory();

const products = computed(() => {
   if (categories.value.some?.((c) => _keys(productsByCategory._data).includes(c)))
      return _flatMap(_values(_pick(productsByCategory._data, categories.value)));
   return allProducts._data;
});
</script>

<template>
   <span class="flex gap-2 items-center" :class="$attrs?.class">
      <Select
         :filter="true"
         :options="products"
         option-label="display_name"
         option-value="id"
         v-bind="$attrs"
         v-model:model-value="modelValue"
      />
      <RouterLink
         v-if="showEdit && $can('modify', 'products') && (!!modelValue?.id || !!modelValue)"
         :to="{
            name: 'product-edit',
            params: { id: modelValue?.id || modelValue },
            query: { showDialog: 'center' }
         }"
         v-slot="{ navigate }"
      >
         <Button size="small" severity="info" :icon="PrimeIcons.PENCIL" @click="navigate" />
      </RouterLink>
      <RouterLink
         v-if="showAdd && $can('create', 'products')"
         :to="{
            name: 'product-add',
            params: { category },
            query: { showDialog: 'center' }
         }"
         v-slot="{ navigate }"
      >
         <Button size="small" severity="success" :icon="PrimeIcons.PLUS" @click="navigate" />
      </RouterLink>
   </span>
</template>
