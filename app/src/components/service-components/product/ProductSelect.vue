<script setup>
import Collection from '@/lib/Collection';
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

const { data } = await (
   props.category
      ? supabase
           .from('product')
           .select(props.select)
           .in('product_category.display_name', categories.value)
      : supabase.from('product').select(props.select)
).throwOnError();

const products = new Collection(
   // props.category
   //    ? data?.filter?.((product) =>
   //         product.categories?.some((category) => categories.value.includes(category.display_name))
   //      )
   //    :
   data
);
</script>

<template>
   <InputGroup :class="$attrs?.class">
      <Select
         :filter="true"
         :options="products"
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
