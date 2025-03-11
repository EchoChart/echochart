<script setup>
import { Form } from '@/lib/Form';
import { useStockStore } from '@/store/services/stock';
import currencies from 'currency-codes';
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
      default: null,
      required: false
   }
});

const toast = useToast();

const initialFormData = {
   id: undefined,
   product_id: null,
   serial_number: null,
   barcode: null,
   cost: 0,
   quantity: 1,
   used: 0,
   currency_code: 'TRY',
   vendor: null,
   details: null
};
const fields = _keys(initialFormData);

const form = new Form({
   data: _defaults(_pick(props.data, fields), initialFormData),
   rules: {
      product_id: 'required',
      cost: 'required|min:0',
      quantity: 'required|min:1|gte:used',
      used: 'min:0|lte:quantity'
   },
   useDialogForm: false
});

const { ability } = useAuthStore();
const readonly = computed(
   () => ability.cannot('modify', 'stocks') && ability.cannot('create', 'stocks')
);

if (props.id || props.data?.id) {
   const updateCallback = (data) => form._setDefaults(_pick(data, fields))._reset();
   onMounted(() => emitter.on('device-update', updateCallback));
   onUnmounted(() => emitter.off('device-update', updateCallback));
}

const { getStock } = useStockStore().useStocks();
if (props.id) {
   getStock(props.id).then((data) => form._setDefaults(_pick(data, fields))._reset());
}

const save = async () => {
   if (!form._validate()) return;

   const { data } = await supabase
      .from('stocks')
      .upsert(form._data)
      .eq('id', form.id)
      .select()
      .single()
      .throwOnError();

   if (form.id) form._setDefaults(_pick(data, fields))._reset();

   emitter.emit('device-update', form._data);

   toast.add({
      life: 3000,
      severity: ToastSeverity.SUCCESS,
      summary: i18n.t('success'),
      detail: i18n.t('saved')
   });
};
</script>

<template>
   <div class="card">
      <FormBox @submit="save" @reset="() => form._reset()" class="[&>*]:flex-1">
         <FormField
            :readonly="readonly"
            fluid
            :error="form._errors.first('product_id')"
            :label="$t('product')"
         >
            <template #default="slotProps">
               <ProductSelect v-bind="slotProps" :category v-model="form.product_id" />
            </template>
         </FormField>
         <FormField
            :readonly="readonly"
            fluid
            :error="form._errors.first('vendor')"
            :label="$t('vendor')"
         >
            <template #default="slotProps">
               <StockVendorSelect v-bind="slotProps" v-model="form.vendor" />
            </template>
         </FormField>
         <div class="flex-1 flex">
            <FormField
               class="flex-[0.2]"
               :readonly="readonly"
               fluid
               :error="form._errors.first('currency_code')"
               :label="$t('currency')"
            >
               <template #default="slotProps">
                  <Select
                     :filter="true"
                     v-bind="slotProps"
                     v-model="form.currency_code"
                     :options="currencies.codes()"
                  />
               </template>
            </FormField>
            <FormField
               class="flex-[0.8]"
               :readonly="readonly"
               fluid
               :error="form._errors.first('cost')"
               :label="$t('cost')"
            >
               <template #default="slotProps">
                  <InputNumber
                     v-bind="slotProps"
                     v-model="form.cost"
                     mode="currency"
                     :currency="form.currency_code"
                     :min="0"
                  />
               </template>
            </FormField>
         </div>
         <FormField
            :readonly="readonly"
            fluid
            :error="form._errors.first('quantity')"
            :label="$t('quantity')"
         >
            <template #default="slotProps">
               <InputNumber v-bind="slotProps" v-model="form.quantity" :min="0" />
            </template>
         </FormField>
         <FormField
            :readonly="readonly"
            fluid
            :error="form._errors.first('used')"
            :label="$t('used')"
         >
            <template #default="slotProps">
               <InputNumber v-bind="slotProps" v-model="form.used" :min="0" />
            </template>
         </FormField>
         <div class="!flex-auto flex w-full flex-wrap">
            <FormField
               :readonly="readonly"
               fluid
               :error="form._errors.first('barcode')"
               :label="$t('barcode')"
            >
               <template #default="slotProps">
                  <InputText v-bind="slotProps" v-model="form.barcode" />
               </template>
            </FormField>
            <FormField
               :readonly="readonly"
               fluid
               :error="form._errors.first('serial_number')"
               :label="$t('serial_number')"
            >
               <template #default="slotProps">
                  <InputText v-bind="slotProps" v-model="form.serial_number" />
               </template>
            </FormField>
         </div>
         <div class="!flex-auto w-full">
            <FormField
               :readonly="readonly"
               fluid
               :error="form._errors.first('details')"
               :label="$t('details')"
            >
               <template #default="slotProps">
                  <Editor v-bind="slotProps" v-model="form.details" />
               </template>
            </FormField>
         </div>
         <div
            v-if="$can('create', 'stocks') || $can('modify', 'stocks')"
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
