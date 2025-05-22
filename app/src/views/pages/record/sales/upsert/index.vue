<script setup>
import { currencies } from '@/constants/form/common';
import { paymentTypes, recordStatuses, recordTypes } from '@/constants/form/record';
import Collection from '@/lib/Collection';
import { Form } from '@/lib/Form';
import Upsert from '@/views/pages/stock/Upsert.vue';
import { useToast } from 'primevue';
import AssembleForm from './AssembleForm.vue';

/**
 * @typedef {Tables['record']['Row']&{stock:{product: Tables['product']['Row']&{category:Tables['product_category']['Row'][]}}}} Data
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
   select: {
      type: String,
      default:
         '*,stock:stock_view!inner(*, product(category:product_category(display_name))), client!inner(*)'
   }
});

const toast = useToast();

/**@type {Data} */
const initialFormData = {
   id: undefined,
   client_id: undefined,
   stock_id: undefined,
   user_id: undefined,
   record_type: undefined,
   record_status: undefined,
   amount: undefined,
   payment_type: undefined,
   curreny_code: undefined,
   bid: 3000,
   bid_discount: 900,
   tax: 630,
   attributes: {},
   details: undefined,
   created_at: undefined,
   stock: undefined
};

const fields = _keys(initialFormData);

/**@type {Data & Form<Data>} */
const form = new Form({
   data: _defaults(_pick(props.data, fields), initialFormData),
   rules: {
      stock_id: 'required',
      client_id: 'required',
      bid: [
         ...['sale', 'assemble', 'repair'].map((value) => `required_if:record_type,${value}`),
         'numeric',
         'min:0'
      ],
      bid_discount: 'numeric|min:0|lte:bid',
      payment_type: 'required_with:bid'
   },
   useDialogForm: false
});

const staticRules = form._rules || {};
form._setRules(
   computed(() => {
      const statuses = _get(recordStatuses, form.record_type, [])
         ?.map((e) => e?.value)
         ?.join(',');

      const amount = {
         min: form.stock?.unit_type === 'pcs' ? 1 : 0.01,
         max: availableQuantity?.value
      };

      const isDeviceSideRequired = form?.stock?.product?.category?.some?.(
         (category) => category.display_name === 'device'
      );

      const attributeRules = {
         attributes: {
            'assemble.behind_ear_molds': `required_if:record_type,assemble`,
            assemble: {
               behind_ear_molds: {
                  '*': {
                     type: `required`,
                     model: `required`,
                     side: `required`,
                     ventilation: `required`,
                     speaker_size: `required`
                  }
               }
            },
            [`${form.record_type}.device_side`]: isDeviceSideRequired ? 'required' : ''
         }
      };

      return {
         ...staticRules,
         ...attributeRules,
         record_type: `required|in:${recordTypes.map((e) => e.value).join(',')}`,
         currency_code: `required|in:${currencies.join(',')}`,
         amount: `required_with:stock_id|numeric|min:${amount.min}|max:${amount.max}`,
         record_status: `required|in:${statuses}`
      };
   })
);

const total_bid = computed({
   get: () => form.bid - form.bid_discount + form.tax,
   set: (value) => {
      const d = discount.value * 0.01;
      const t = tax.value * 0.01;

      if (1 - d <= 0) return;

      const effectiveMultiplier = (1 - d) * (1 + t);
      const bid = value / effectiveMultiplier;

      form._set('bid', bid);
   }
});

const discount = computed({
   get: () => {
      if (!form.bid) return 0;
      return (form.bid_discount / form.bid) * 100;
   },
   set: (value) => {
      form._set('bid_discount', form.bid * 0.01 * value);
   }
});

const tax = computed({
   get: () => {
      const base = form.bid - form.bid_discount;
      if (base <= 0) return 0;
      return (form.tax / base) * 100;
   },
   set: (value) => {
      form._set('tax', _round((form.bid - form.bid_discount) * 0.01 * value, 2));
   }
});

const availableQuantity = computed(() => {
   const quantity = _round(
      form?.stock?.id === form?._defaults?.stock_id
         ? form?._defaults.amount + form?.stock?.available_quantity
         : form?.stock?.available_quantity,
      2
   );

   return form.stock?.unit_type === 'pcs' ? _floor(quantity) : quantity;
});

const stockTableProps = new Collection({
   from: 'stock_view',
   select: '*,product(category:product_category(display_name))',
   filters: {
      global: {
         value: null,
         matchMode: FilterMatchMode.CONTAINS
      },
      'product.category.display_name': {
         operator: FilterOperator.AND,
         constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }]
      },
      display_name: {
         operator: FilterOperator.AND,
         constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }]
      },
      brand: {
         operator: FilterOperator.AND,
         constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }]
      },
      barcode: {
         operator: FilterOperator.AND,
         constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }]
      },
      serial_number: {
         operator: FilterOperator.AND,
         constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }]
      },
      unit_cost: {
         operator: FilterOperator.AND,
         constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }],
         dataType: 'decimal'
      },
      quantity: {
         operator: FilterOperator.AND,
         constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }],
         dataType: 'numeric'
      },
      available_quantity: {
         operator: FilterOperator.AND,
         constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }],
         dataType: 'numeric'
      },
      vendor: {
         operator: FilterOperator.AND,
         constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }]
      },
      stocked_at: {
         operator: FilterOperator.AND,
         constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }],
         dataType: 'date'
      }
   },
   columns: [
      {
         field: 'display_name',
         sortable: true,
         header: i18n.t('product'),
         sortOrder: { value: -1 }
      },
      {
         field: 'unit_cost',
         sortable: true,
         header: i18n.t('unit_cost')
      },
      {
         field: 'vendor',
         sortable: true,
         header: i18n.t('vendor')
      },
      {
         field: 'stocked_at',
         sortable: true,
         header: i18n.t('stocked_at'),
         sortOrder: { value: -1 }
      },
      {
         field: 'available_quantity',
         sortable: true,
         header: i18n.t('available_quantity')
      }
   ],
   selectionMode: 'single',
   frozenValue: computed(() => (form.stock ? [form.stock] : undefined)),
   selection: computed(() => (form.stock ? [form.stock] : undefined)),
   onRowSelect: ({ data }) => {
      form._set('stock_id', data?.id);
      form._set('stock', data);
   }
});

const { ability } = useAuthStore();
const readonly = computed(
   () => ability.cannot('modify', 'record') && ability.cannot('create', 'record')
);

if (props.id) {
   await supabase
      .from('record')
      .select(props.select)
      .eq('id', props.id)
      .single()
      .throwOnError()
      .then(({ data }) => form._setDefaults(_pick(data, fields))._reset());
}

if (props.id || props.data?.id) {
   const updateCallback = (data) => {
      if (data?.id === form.id) form._setDefaults(_pick(data, fields))._reset();
   };
   onMounted(() => emitter.on('sales-update', updateCallback));
   onUnmounted(() => emitter.off('sales-update', updateCallback));
}

const save = async () => {
   form._set('attributes', _pick(form.attributes, [form.record_type]));

   if (!form._validate()) return;

   const payload = _omit(form._data, 'stock');
   const { data } = await supabase
      .from('record')
      .upsert(payload)
      .eq('id', form.id)
      .select()
      .single()
      .throwOnError();

   if (form.id) form._setDefaults(_merge(data, form._data))._reset();

   emitter.emit('sales-update', data);

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
      <FormBox @reset="() => form._reset()" :form :readonly @submit="save">
         <FormBox :legend="$t('information')" class="!flex-auto">
            <FormField
               :label="$t('record_type')"
               :error="form?._errors?.first('record_type')"
               fluid
               :readonly
               v-slot="slotProps"
            >
               <Select
                  v-bind="slotProps"
                  option-label="label"
                  option-value="value"
                  :options="recordTypes"
                  v-model="form.record_type"
               />
            </FormField>
            <FormField
               :label="$t('stock_select')"
               :error="form?._errors?.first('stock_id')"
               fluid
               :readonly
            >
               <SelectResource
                  :placeholder="form.stock?.display_name"
                  :table-props="stockTableProps._data"
               >
                  <template #header>
                     <span class="flex-1 flex justify-end gap-4 flex-wrap-reverse">
                        <KeywordSearchInput v-model="stockTableProps._data.filters.global.value" />
                        <CustomLink
                           v-if="$can('create', 'stock')"
                           :to="{ name: 'stock-add' }"
                           v-slot="{ navigate }"
                        >
                           <Button variant="outlined" :label="$t('add')" @click="navigate" />
                        </CustomLink>
                     </span>
                  </template>
                  <template #expansion="{ data }">
                     <Upsert :id="data.id" />
                  </template>
               </SelectResource>
            </FormField>
            <FormField
               :label="$t('device_side')"
               v-if="form.stock?.product?.category?.find?.((c) => c.display_name === 'device')"
               :error="form?._errors?.first(`attributes.${form.record_type}.device_side`)"
               :readonly
               fluid
               v-slot="slotProps"
            >
               <SelectButton
                  :options="[
                     { value: 'left', label: $t('left') },
                     { value: 'dual', label: $t('dual') },
                     { value: 'right', label: $t('right') }
                  ]"
                  :allow-empty="false"
                  option-value="value"
                  option-label="label"
                  v-bind="slotProps"
                  class="!min-w-fit"
                  :model-value="form._get(`attributes.${form.record_type}.device_side`)"
                  @value-change="form._set(`attributes.${form.record_type}.device_side`, $event)"
               />
            </FormField>
            <FormField
               :label="$t('record_status')"
               :error="form?._errors?.first('record_status')"
               fluid
               :readonly
               v-slot="slotProps"
            >
               <Select
                  v-bind="slotProps"
                  option-label="label"
                  option-value="value"
                  :options="recordStatuses[form.record_type]"
                  v-model="form.record_status"
               />
            </FormField>
            <FormField
               fluid
               :error="form?._errors?.first('client_id')"
               :label="$t('client')"
               v-slot="slotProps"
            >
               <SelectClient v-bind="slotProps" v-model="form.client_id" />
            </FormField>
         </FormBox>
         <FormBox :legend="$t('financial')" class="!flex-auto">
            <FormField
               :readonly
               fluid
               :error="form?._errors?.first('amount')"
               :label="$t('amount')"
               v-slot="slotProps"
               :disabled="!availableQuantity"
            >
               <InputNumber
                  v-bind="slotProps"
                  v-model="form.amount"
                  :max-fraction-digits="form.stock?.unit_type === 'pcs' ? 0 : 2"
                  :min="0"
                  :max="availableQuantity"
                  :suffix="` / ${availableQuantity || 0} ${form.stock?.unit_type}`"
                  :step="form.stock?.unit_type === 'pcs' ? 1 : 0.01"
                  showButtons
                  buttonLayout="horizontal"
               />
            </FormField>
            <FormField
               :readonly
               fluid
               :error="form?._errors?.first('payment_type')"
               :label="$t('payment_type')"
               v-slot="slotProps"
            >
               <Select
                  v-bind="slotProps"
                  :options="paymentTypes"
                  option-label="label"
                  option-value="value"
                  v-model="form.payment_type"
               />
            </FormField>
            <FormField
               :readonly
               fluid
               :error="form?._errors?.first('currency_code')"
               :label="$t('currency')"
               v-slot="slotProps"
            >
               <SelectCurrency v-bind="slotProps" v-model="form.currency_code" />
            </FormField>
            <span class="form_box !flex-auto place-content-start">
               <FormField
                  :readonly
                  fluid
                  :error="form?._errors?.first('bid')"
                  :label="$t('bid')"
                  v-slot="slotProps"
               >
                  <InputNumber
                     v-bind="slotProps"
                     v-model="form.bid"
                     :mode="form.currency_code ? 'currency' : 'decimal'"
                     :currency="form.currency_code || undefined"
                     :max-fraction-digits="2"
                     :min="0"
                     :step="0.01"
                     showButtons
                     buttonLayout="horizontal"
                  />
               </FormField>
               <FormField
                  :readonly
                  fluid
                  :error="form?._errors?.first('bid_discount')"
                  :label="$t('bid_discount')"
                  v-slot="slotProps"
               >
                  <InputNumber
                     v-bind="slotProps"
                     v-model="form.bid_discount"
                     :max-fraction-digits="2"
                     :min="0"
                     :max="form.bid"
                     :step="0.01"
                     showButtons
                     buttonLayout="horizontal"
                  />
               </FormField>
               <FormField
                  :readonly
                  fluid
                  :error="form?._errors?.first('tax')"
                  :label="$t('tax')"
                  v-slot="slotProps"
               >
                  <InputNumber
                     v-bind="slotProps"
                     v-model="form.tax"
                     :max-fraction-digits="2"
                     :min="0"
                     :step="0.01"
                     showButtons
                     buttonLayout="horizontal"
                  />
               </FormField>
            </span>
            <span class="form_box !flex-auto place-content-start">
               <FormField
                  :readonly
                  fluid
                  :error="form?._errors?.first('total_bid')"
                  :label="$t('total_bid')"
                  v-slot="slotProps"
               >
                  <InputNumber
                     v-bind="slotProps"
                     v-model="total_bid"
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
                  :error="form?._errors?.first('discount')"
                  :label="$t('discount')"
                  v-slot="slotProps"
               >
                  <InputNumber
                     v-bind="slotProps"
                     v-model="discount"
                     :max-fraction-digits="2"
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
                  :error="form?._errors?.first('tax')"
                  :label="$t('tax')"
                  v-slot="slotProps"
               >
                  <InputNumber
                     v-bind="slotProps"
                     v-model="tax"
                     :max-fraction-digits="2"
                     :min="0"
                     :suffix="'%'"
                     :step="1"
                     showButtons
                     buttonLayout="horizontal"
                  />
               </FormField>
            </span>
         </FormBox>
         <AssembleForm
            v-if="form.record_type === 'assemble'"
            class="!flex-auto w-full"
            :form
            :readonly
         />
         <FormField
            :readonly
            fluid
            :error="form?._errors?.first('details')"
            :label="$t('details')"
            v-slot="slotProps"
            class="!flex-auto !max-w-full w-full h-fit"
         >
            <Editor v-bind="slotProps" v-model="form.details" />
         </FormField>
      </FormBox>
   </div>
</template>
