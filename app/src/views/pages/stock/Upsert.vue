<script setup>
import { Form } from '@/lib/Form';
import { useStockStore } from '@/store/services/stock';
import { useToast } from 'primevue';
/**
 * @typedef {Tables['stock']['Row']} Data
 * @type {{ id: Data['id'], data: Data }} */
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
   unit_cost: 0,
   stocked_at: new Date(Date.now()),
   quantity: 1,
   currency_code: null,
   vendor: null,
   details: null
};
const fields = _keys(initialFormData);

const form = new Form({
   data: _defaults(_pick(props.data, fields), initialFormData),
   rules: {
      product_id: 'required',
      unit_cost: 'required|min:0',
      quantity: 'required|min:1',
      currency_code: 'required'
   },
   useDialogForm: false
});

const { ability } = useAuthStore();
const readonly = computed(
   () => ability.cannot('modify', 'stock') && ability.cannot('create', 'stock')
);

if (props.id || props.data?.id) {
   const updateCallback = (data) => {
      form._setDefaults(_pick(data, fields))._reset();
   };
   onMounted(() => emitter.on('device-update', updateCallback));
   onUnmounted(() => emitter.off('device-update', updateCallback));
}

const { getStock } = useStockStore();
const routeLoading = inject('routeLoading', false);
if (!routeLoading.value && props.id) {
   await getStock(props.id).then((data) => form._setDefaults(_pick(data, fields))._reset());
}

const total_cost = computed({
   get: () => _round(form.unit_cost * form.quantity, 3),
   set: (value) => {
      _set(form, 'unit_cost', _round(value / form.quantity, 3));
      _set(form, 'total_cost', value);
   }
});

const save = async () => {
   if (!form._validate()) return;

   const payload = _pick(form._data, fields);

   const { data } = await supabase
      .from('stock')
      .upsert(payload)
      .eq('id', form.id)
      .select()
      .single()
      .throwOnError();

   if (form.id) form._setDefaults(form._data)._reset();

   emitter.emit('stock-update', data);

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
      <FormBox @submit="save" @reset="() => form._reset()" :form :readonly>
         <div class="form-box !flex-auto w-full">
            <FormField
               :readonly="readonly"
               fluid
               :error="form._errors.first('product_id')"
               :label="$t('product')"
               v-slot="slotProps"
            >
               <ProductSelect v-bind="slotProps" :category v-model="form.product_id" />
            </FormField>
            <FormField
               :readonly="readonly"
               fluid
               :error="form._errors.first('vendor')"
               :label="$t('vendor')"
               v-slot="slotProps"
            >
               <StockVendorSelect v-bind="slotProps" v-model="form.vendor" />
            </FormField>
            <FormField
               :readonly="readonly"
               fluid
               :error="form._errors.first('barcode')"
               :label="$t('barcode')"
               v-slot="slotProps"
            >
               <InputText v-bind="slotProps" v-model="form.barcode" />
            </FormField>
            <FormField
               :readonly="readonly"
               fluid
               :error="form._errors.first('serial_number')"
               :label="$t('serial_number')"
               v-slot="slotProps"
            >
               <InputText v-bind="slotProps" v-model="form.serial_number" />
            </FormField>
            <FormField
               :readonly="readonly"
               fluid
               :error="form._errors.first('stocked_at')"
               :label="$t('stocked_at')"
               v-slot="slotProps"
            >
               <DatePicker
                  :selectionMode="'single'"
                  v-bind="slotProps"
                  v-model="form.stocked_at"
                  dateFormat="dd/mm/yy"
                  placeholder="dd/mm/yyyy"
               />
            </FormField>
         </div>
         <FormField
            :readonly="readonly"
            fluid
            :error="form._errors.first('quantity')"
            :label="$t('quantity')"
            v-slot="slotProps"
         >
            <InputNumber v-bind="slotProps" v-model="form.quantity" :min="0" />
         </FormField>
         <FormField
            :readonly="readonly"
            fluid
            :error="form._errors.first('currency_code')"
            :label="$t('currency')"
            v-slot="slotProps"
         >
            <SelectCurrency v-bind="slotProps" v-model="form.currency_code" />
         </FormField>
         <FormField
            :readonly="readonly"
            fluid
            :error="form._errors.first('unit_cost')"
            :label="$t('unit_cost')"
            v-slot="slotProps"
         >
            <InputNumber
               v-bind="slotProps"
               v-model="form.unit_cost"
               :max-fraction-digits="3"
               :mode="form.currency_code ? 'currency' : 'decimal'"
               :currency="form.currency_code || undefined"
               :min="0"
            />
         </FormField>
         <FormField
            :readonly="readonly"
            fluid
            :error="form._errors.first('total_cost')"
            :label="$t('total_cost')"
            v-slot="slotProps"
         >
            <InputNumber
               v-bind="slotProps"
               v-model="total_cost"
               :max-fraction-digits="3"
               :mode="form.currency_code ? 'currency' : 'decimal'"
               :currency="form.currency_code || undefined"
               :min="0"
            />
         </FormField>
         <FormField
            :readonly="readonly"
            fluid
            :error="form._errors.first('details')"
            :label="$t('details')"
            v-slot="slotProps"
            class="!flex-auto !max-w-full w-full"
         >
            <Editor v-bind="slotProps" v-model="form.details" />
         </FormField>
      </FormBox>
   </div>
</template>
