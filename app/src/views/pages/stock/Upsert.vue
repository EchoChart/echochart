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

/**
 * @type {Data}
 */
const initialFormData = {
   id: undefined,
   product_id: null,
   serial_number: null,
   barcode: null,
   unit_type: 'pcs',
   unit_cost: 0,
   unit_discount: 0,
   unit_tax: 0,
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
      unit_discount: 'required|lte:unit_cost',
      quantity: 'required|min:1',
      unit_type: 'required',
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
   get: () => (form.unit_cost - form.unit_discount + form.unit_tax) * form.quantity,
   set: (value) => {
      const d = discount.value / 100;
      const t = tax.value / 100;
      const q = form.quantity;

      if (q === 0 || 1 - d <= 0) return; // avoid division by zero or invalid math

      const effectiveMultiplier = (1 - d) * (1 + t);
      const unit_cost = value / (q * effectiveMultiplier);

      _set(form, 'unit_cost', unit_cost);
   }
});

const discount = computed({
   get: () => {
      if (!form.unit_cost) return 0;
      return (form.unit_discount / form.unit_cost) * 100;
   },
   set: (value) => {
      _set(form, 'unit_discount', form.unit_cost * 0.01 * value);
   }
});

const tax = computed({
   get: () => {
      const base = form.unit_cost - form.unit_discount;
      if (base <= 0) return 0;
      return (form.unit_tax / base) * 100;
   },
   set: (value) => {
      _set(form, 'unit_tax', (form.unit_cost - form.unit_discount) * 0.01 * value);
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
         <span class="form-box place-content-start">
            <FormField
               :readonly
               fluid
               :error="form._errors.first('product_id')"
               :label="$t('product')"
               v-slot="slotProps"
            >
               <SelectProduct v-bind="slotProps" :category v-model="form.product_id" />
            </FormField>
            <FormField
               :readonly
               fluid
               :error="form._errors.first('vendor')"
               :label="$t('vendor')"
               v-slot="slotProps"
            >
               <SelectStockVendor v-bind="slotProps" v-model="form.vendor" />
            </FormField>
            <FormField
               :readonly
               fluid
               :error="form._errors.first('barcode')"
               :label="$t('barcode')"
               v-slot="slotProps"
            >
               <InputText v-bind="slotProps" v-model="form.barcode" />
            </FormField>
            <FormField
               :readonly
               fluid
               :error="form._errors.first('serial_number')"
               :label="$t('serial_number')"
               v-slot="slotProps"
            >
               <InputText v-bind="slotProps" v-model="form.serial_number" />
            </FormField>
            <FormField
               :readonly
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
         </span>
         <span class="form-box place-content-start">
            <FormField
               :readonly
               fluid
               :error="form._errors.first('quantity')"
               :label="$t('quantity')"
               v-slot="slotProps"
            >
               <InputGroup>
                  <InputNumber
                     v-model="form.quantity"
                     showButtons
                     buttonLayout="horizontal"
                     :step="form.unit_type === 'pcs' ? 1 : 0.1"
                     v-bind="slotProps"
                  />
                  <InputGroupAddon class="!p-0 !min-w-fit">
                     <SelectStockUnitType class="!border-0" v-model="form.unit_type" />
                  </InputGroupAddon>
               </InputGroup>
            </FormField>
            <FormField
               :readonly
               fluid
               :error="form._errors.first('currency_code')"
               :label="$t('currency')"
               v-slot="slotProps"
            >
               <SelectCurrency v-bind="slotProps" v-model="form.currency_code" />
            </FormField>
            <FormField
               :readonly
               fluid
               :error="form._errors.first('unit_cost')"
               :label="$t('unit_cost')"
               v-slot="slotProps"
            >
               <InputNumber
                  v-bind="slotProps"
                  v-model="form.unit_cost"
                  :max-fraction-digits="2"
                  :mode="form.currency_code ? 'currency' : 'decimal'"
                  :currency="form.currency_code || undefined"
                  :min="0"
                  :step="0.01"
                  showButtons
                  buttonLayout="horizontal"
               />
            </FormField>
            <FormField
               :readonly
               fluid
               :error="form._errors.first('unit_discount')"
               :label="$t('unit_discount')"
               v-slot="slotProps"
            >
               <InputNumber
                  v-bind="slotProps"
                  v-model="form.unit_discount"
                  :max-fraction-digits="2"
                  :mode="form.currency_code ? 'currency' : 'decimal'"
                  :currency="form.currency_code || undefined"
                  :min="0"
                  :max="form.unit_cost"
                  :step="0.01"
                  showButtons
                  buttonLayout="horizontal"
               />
            </FormField>
            <FormField
               :readonly
               fluid
               :error="form._errors.first('unit_tax')"
               :label="$t('unit_tax')"
               v-slot="slotProps"
            >
               <InputNumber
                  v-bind="slotProps"
                  v-model="form.unit_tax"
                  :max-fraction-digits="2"
                  :mode="form.currency_code ? 'currency' : 'decimal'"
                  :currency="form.currency_code || undefined"
                  :min="0"
                  :step="0.01"
                  showButtons
                  buttonLayout="horizontal"
               />
            </FormField>
         </span>
         <span class="form-box place-content-start">
            <FormField
               :readonly
               fluid
               :error="form._errors.first('discount')"
               :label="$t('discount')"
               v-slot="slotProps"
            >
               <InputNumber
                  v-bind="slotProps"
                  v-model="discount"
                  :max-fraction-digits="0"
                  :min="0"
                  :max="100"
                  :suffix="'%'"
                  :step="1"
                  showButtons
                  buttonLayout="horizontal"
               />
            </FormField>
            <FormField
               :readonly
               fluid
               :error="form._errors.first('tax')"
               :label="$t('tax')"
               v-slot="slotProps"
            >
               <InputNumber
                  v-bind="slotProps"
                  v-model="tax"
                  :max-fraction-digits="0"
                  :min="0"
                  :max="100"
                  :suffix="'%'"
                  :step="1"
                  showButtons
                  buttonLayout="horizontal"
               />
            </FormField>
            <FormField
               :readonly
               fluid
               :error="form._errors.first('total_cost')"
               :label="$t('total_cost')"
               v-slot="slotProps"
            >
               <InputNumber
                  v-bind="slotProps"
                  v-model="total_cost"
                  :max-fraction-digits="2"
                  :mode="form.currency_code ? 'currency' : 'decimal'"
                  :currency="form.currency_code || undefined"
                  :min="0"
                  :step="0.01"
                  showButtons
                  buttonLayout="horizontal"
               />
            </FormField>
         </span>
         <FormField
            :readonly
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
