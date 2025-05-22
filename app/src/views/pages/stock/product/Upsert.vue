<script setup>
import { Form } from '@/lib/Form';

import { useToast } from 'primevue';

/**
 * @typedef {Tables['product']['Row']} Data
 * @type {{ id: Data['id'], data: Data }} */
const props = defineProps({
   id: {
      type: String,
      default: null
   },
   data: {
      type: Object,
      default: null
   },
   category: {
      type: String,
      default: null
   }
});

const toast = useToast();

const { ability, current_tenant_id } = useAuthStore();

const initialFormData = {
   id: undefined,
   display_name: null,
   brand: null,
   details: null,
   tenant_id: current_tenant_id,
   categories: null
};

const fields = _keys(initialFormData);

const form = new Form({
   data: _defaults(_pick(props.data, fields), initialFormData),
   rules: {
      display_name: 'required',
      categories: 'required'
   },
   useDialogForm: false
});

if (props.id) {
   const { data: product } = await supabase
      .from('product')
      .select('*, categories:product_category!inner(*)')
      .eq('id', props.id)
      .single()
      .throwOnError();
   form._setDefaults(_pick(product, fields))._reset();
} else if (props.category) {
   const { data: categories } = await supabase
      .from('product_category')
      .select('*')
      .in('display_name', props.category?.split('|'))
      .throwOnError();
   form
      ._setDefaults({
         ...form._data,
         categories
      })
      ._reset();
}

const readonly = computed(
   () =>
      (ability.cannot('modify', 'product') && ability.cannot('create', 'product')) ||
      (form.id && !form.tenant_id)
);

const save = async () => {
   if (!form._validate()) return;

   const payload = _omit(form._data, ['categories']);

   const { data } = await supabase
      .from('product')
      .upsert(payload)
      .eq('id', form.id)
      .select('*')
      .single()
      .throwOnError();

   form._merge(data);

   if (form._changedData['categories']) {
      if (form.id) {
         await supabase
            .from('product_categories')
            .delete()
            .eq('product_id', form.id)
            .setHeader('x-delete-confirmed', true)
            .throwOnError();
      }

      const payload = form.categories.map(({ id: category_id }) => ({
         category_id,
         product_id: form.id
      }));

      await supabase.from('product_categories').insert(payload).throwOnError();
   }

   if (form.id) form._setDefaults(form._data)._reset();

   emitter.emit('product-update', _merge(data, form._data));

   toast.add({
      life: 3000,
      severity: ToastSeverity.SUCCESS,
      summary: i18n.t('success'),
      detail: i18n.t('saved')
   });
};

if (props.id || props.data?.id) {
   const updateCallback = (data) => {
      if (data?.id === form.id) form._setDefaults(_pick(data, fields))._reset();
   };
   onMounted(() => emitter.on('product-update', updateCallback));
   onUnmounted(() => emitter.off('product-update', updateCallback));
}
</script>

<template>
   <div class="card">
      <FormBox @submit="save" @reset="() => form._reset()" :form :readonly>
         <FormField
            class="flex-[0.8]"
            :readonly
            fluid
            :error="form?._errors?.first('display_name')"
            :label="$t('display_name')"
         >
            <template #default="slotProps">
               <InputText v-bind="slotProps" v-model="form.display_name" />
            </template>
         </FormField>
         <FormField
            class="flex-[0.8]"
            :disabled="readonly"
            fluid
            :error="form?._errors?.first('brand')"
            :label="$t('brand')"
         >
            <template #default="slotProps">
               <SelectProductBrand v-bind="slotProps" v-model="form.brand" editable />
            </template>
         </FormField>
         <FormField
            class="flex-[0.8]"
            :readonly
            fluid
            :error="form?._errors?.first('categories')"
            :label="$t('categories')"
         >
            <template #default="slotProps">
               <SelectProductCategory
                  v-bind="slotProps"
                  v-model="form.categories"
                  :disabled="readonly || !!props.category"
                  :option-value="null"
               />
            </template>
         </FormField>
         <FormField
            class="!flex-auto !max-w-full w-full h-fit"
            :readonly
            fluid
            :error="form?._errors?.first('details')"
            :label="$t('details')"
         >
            <template #default="slotProps">
               <Editor v-bind="slotProps" v-model="form.details" />
            </template>
         </FormField>
      </FormBox>
   </div>
</template>
