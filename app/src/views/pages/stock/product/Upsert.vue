<script setup>
import { Form } from '@/lib/Form';
import { useProductsStore } from '@/store/services/product';

import { useToast } from 'primevue';

const props = defineProps({
   id: {
      type: String,
      default: null,
      required: false
   },
   data: {
      type: Object,
      default: null,
      required: false
   },
   category: {
      type: String,
      default: null
   }
});

const toast = useToast();

const { ability, current_tenant_id } = useAuthStore();

const { getProducts, getCategories } = useProductsStore();
const categories = await getCategories();

const initialFormData = {
   id: undefined,
   display_name: null,
   brand: null,
   description: null,
   tenant_id: current_tenant_id,
   categories: categories.filter((c) => _includes(props.category?.split('|'), c.display_name))
};

const fields = _keys(initialFormData);

const form = new Form({
   data: _defaults(_pick(props.data, fields), initialFormData),
   rules: {
      display_name: 'required',
      brand: 'required',
      categories: 'required'
   },
   useDialogForm: false
});

const readonly = computed(
   () =>
      (ability.cannot('modify', 'products') && ability.cannot('create', 'products')) ||
      (form.id && !form.tenant_id)
);

if (props.id) {
   getProducts().then((products) => {
      const product = products?.find?.((product) => product.id === props.id);
      form._setDefaults(_pick(product, fields))._reset();
   });
}

const save = async () => {
   if (!form._validate()) return;

   const payload = _omit(form._data, ['categories']);

   if (form.id)
      await supabase
         .from('product_categories')
         .delete()
         .eq('product_id', form.id)
         .setHeader('x-delete-confirmed', true)
         .throwOnError();

   await supabase
      .from('products')
      .upsert(payload)
      .eq('id', form.id)
      .select()
      .single()
      .throwOnError()
      .then(({ data }) => form._merge(_pick(data, fields)));

   await supabase
      .from('product_categories')
      .insert(
         form.categories.map(({ id: category_id }) => ({
            category_id,
            product_id: form.id
         }))
      )
      .throwOnError();

   emitter.emit('product-update', form._data);

   form._setDefaults(form._data)._reset();

   toast.add({
      life: 3000,
      severity: ToastSeverity.SUCCESS,
      summary: i18n.t('success'),
      detail: i18n.t('saved')
   });
};

if (props.id || props.data?.id) {
   const updateCallback = (data) => form._setDefaults(_pick(data, fields))._reset();
   onMounted(() => emitter.on('product-update', updateCallback));
   onUnmounted(() => emitter.off('product-update', updateCallback));
}
</script>

<template>
   <div class="card">
      <FormBox @submit="save" @reset="() => form._reset()" class="[&>*]:flex-1">
         <FormField
            class="flex-[0.8]"
            :readonly="readonly"
            fluid
            :error="form._errors.first('display_name')"
            :label="$t('display_name')"
         >
            <template #default="slotProps">
               <InputText class="min-w-24" v-bind="slotProps" v-model="form.display_name" />
            </template>
         </FormField>
         <FormField
            class="flex-[0.8]"
            :readonly="readonly"
            fluid
            :error="form._errors.first('brand')"
            :label="$t('brand')"
         >
            <template #default="slotProps">
               <ProductBrandSelect v-bind="slotProps" v-model="form.brand" editable />
            </template>
         </FormField>
         <FormField
            class="flex-[0.8]"
            :readonly="readonly"
            fluid
            :error="form._errors.first('categories')"
            :label="$t('categories')"
         >
            <template #default="slotProps">
               <ProductCategorySelect
                  v-bind="slotProps"
                  v-model="form.categories"
                  :disabled="readonly || !!props.category"
                  :option-value="null"
               />
            </template>
         </FormField>
         <div class="!flex-auto w-full">
            <FormField
               class="flex-[0.8]"
               :readonly="readonly"
               fluid
               :error="form._errors.first('description')"
               :label="$t('description')"
            >
               <template #default="slotProps">
                  <Editor v-bind="slotProps" v-model="form.description" />
               </template>
            </FormField>
         </div>
         <div
            v-if="($can('create', 'products') || $can('modify', 'products')) && !readonly"
            class="flex flex-wrap items-end justify-end gap-4 !flex-auto w-full"
         >
            <Button
               :label="$t('save')"
               class="flex-[.2]"
               :disabled="!form?._isChanged"
               type="submit"
            />
            <Button
               :label="$t('reset')"
               severity="secondary"
               class="flex-[.2]"
               :disabled="!form?._isChanged"
               type="reset"
            />
         </div>
      </FormBox>
   </div>
</template>
