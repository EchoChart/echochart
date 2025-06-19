<script setup>
import Collection from '@/lib/Collection';
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
   },
   select: {
      type: String,
      default: 'id,display_name, categories:product_category!inner(id,display_name)'
   }
});

defineOptions({
   inheritAttrs: false
});

const modelValue = defineModel('modelValue');

const categories = computed(() => props.category?.split?.('|') || []);

const useProducts = () => {
   const products = Collection.create([]);
   const fetchProducts = async () => {
      const { data } = await (
         props.category
            ? supabase
                 .from('product')
                 .select(props.select)
                 .in('product_category.display_name', categories.value)
            : supabase.from('product').select(props.select)
      ).throwOnError();
      products._setDefaults(data)._reset();
   };
   return {
      products,
      fetchProducts
   };
};
const { products, fetchProducts } = useProducts();

await fetchProducts();

onMounted(() => emitter.on('product-update', fetchProducts));
onUnmounted(() => emitter.off('product-update', fetchProducts));
</script>

<template>
   <InputGroup :class="$attrs.class">
      <Select
         :filter="true"
         :options="products._data"
         option-label="display_name"
         option-value="id"
         v-bind="_omit($attrs, ['class'])"
         v-model:model-value="modelValue"
         :placeholder="$t('product.select_product')"
      />
      <InputGroupAddon
         v-if="showEdit && $can('read', 'product') && (!!modelValue?.id || !!modelValue)"
      >
         <RouterLink
            :to="{
               name: 'product-edit',
               params: { id: modelValue?.id || modelValue },
               query: { showDialog: 'center' }
            }"
            v-slot="{ navigate }"
         >
            <Button size="small" severity="info" :icon="PrimeIcons.PENCIL" @click="navigate" />
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
            <Button size="small" severity="success" :icon="PrimeIcons.PLUS" @click="navigate" />
         </RouterLink>
      </InputGroupAddon>
   </InputGroup>
</template>
