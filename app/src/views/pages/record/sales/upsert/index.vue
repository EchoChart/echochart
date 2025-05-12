<script setup>
import { currencies } from '@/constants/form/common';
import { paymentTypes, recordStatuses, recordTypes } from '@/constants/form/record';
import { Form } from '@/lib/Form';
import StockList from '@/views/pages/stock/device/Index.vue';
import { useDialog, useToast } from 'primevue';
import AssemblyForm from './AssemblyForm.vue';

/**
 * @typedef {Tables['record']['Row']} Data
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
   bid: undefined,
   bid_discount: undefined,
   attributes: {},
   details: undefined,
   created_at: undefined,
   stock: undefined
};

const fields = _keys(initialFormData);

/**@type {Data & Form<Data>} */
const form = new Form({
   data: _defaults(_pick(props.data, fields), initialFormData),
   useDialogForm: false
});

const available_quantity = computed(() =>
   _round(
      form?.stock?.id === form?._defaults?.stock_id
         ? form?._defaults.amount + form?.stock?.available_quantity
         : form?.stock?.available_quantity,
      2
   )
);

form._rules = computed(() => {
   const statuses = _get(recordStatuses, form.record_type, [])
      ?.map((e) => e?.value)
      ?.join(',');

   const amount = {
      min: form.stock?.unit_type === 'pcs' ? 1 : 0.01,
      max: available_quantity?.value
   };

   return {
      record_type: `required|in:${recordTypes.map((e) => e.value).join(',')}`,
      bid: 'numeric|min:0',
      bid_discount: 'numeric|min:0|lte:bid',
      'attributes.currency_code': `required|in:${currencies.join(',')}`,
      amount: `numeric|between:${amount.min},${amount.max}`,
      record_status: `required|in:${statuses}`
   };
});

if (props.id || props.data?.id) {
   const updateCallback = (data) => {
      if (data?.id === form.id) form._setDefaults(_pick(data, fields))._reset();
   };
   onMounted(() => emitter.on('sales-update', updateCallback));
   onUnmounted(() => emitter.off('sales-update', updateCallback));
}

const { ability } = useAuthStore();
const readonly = computed(
   () => ability.cannot('modify', 'record') && ability.cannot('create', 'record')
);

const dialogs = useDialog();
const selectStock = () => {
   const dialog = dialogs.open(
      h(StockList, {
         filters: {
            'product.category.display_name': {
               operator: FilterOperator.AND,
               constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }]
            }
         },
         columns: {
            5: {
               field: 'available_quantity',
               sortable: true,
               header: i18n.t('available_quantity')
            }
         },
         selectionMode: 'single',
         frozenValue: form.stock ? [form.stock] : undefined,
         selection: form.stock,
         'onUpdate:selection': (value) => (form.stock = value || form.stock),
         onRowSelect: ({ data }) => {
            form._set('stock_id', data?.id);
            dialog.close();
         }
      }),
      {
         props: {
            header: i18n.t('select_stock'),
            class: '!min-w-[clamp(32rem,50%,100vw)] !max-w-min'
         }
      }
   );
};

const routeLoading = inject('routeLoading', false);
if (!routeLoading.value && props.id) {
   await supabase
      .from('record')
      .select('*,stock:stock_view!inner(*), client!inner(*)')
      .eq('id', props.id)
      .single()
      .throwOnError()
      .then(({ data }) => form._setDefaults(_pick(data, fields))._reset());
}

const save = async () => {
   if (form.record_type !== 'assembly') {
      delete form.attributes.mold_type;
      delete form.attributes.mold_model;
      delete form.attributes.mold_ventilation;
   }

   if (!form._validate()) return;

   const payload = _omit(form._data, 'stock');
   const { data } = await supabase
      .from('record')
      .upsert(payload)
      .eq('id', form.id)
      .select()
      .single()
      .throwOnError();

   if (form.id) form._setDefaults(_pick(data, fields))._reset();

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
         <FormBox :legend="$t('information')">
            <FormField
               :label="$t('record_type')"
               :error="form._errors.first('record_type')"
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
               :error="form._errors.first('stock_select')"
               fluid
               :readonly
               v-slot="slotProps"
            >
               <InputGroup v-bind="slotProps">
                  <InputText :model-value="form.stock?.display_name" readonly />
                  <InputGroupAddon>
                     <Button :icon="PrimeIcons.SEARCH_PLUS" @click="selectStock" />
                  </InputGroupAddon>
               </InputGroup>
            </FormField>
            <FormField
               :label="$t('record_status')"
               :error="form._errors.first('record_status')"
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
         <FormBox :legend="$t('financial')">
            <FormField
               :readonly
               fluid
               :error="form._errors.first('amount')"
               :label="$t('amount')"
               v-slot="slotProps"
            >
               <InputNumber
                  v-bind="slotProps"
                  v-model="form.amount"
                  :max-fraction-digits="form.stock?.unit_type === 'pcs' ? 0 : 2"
                  :min="0"
                  :max="available_quantity"
                  :suffix="` / ${available_quantity || 0} ${form.stock?.unit_type}`"
                  :step="form.stock?.unit_type === 'pcs' ? 1 : 0.01"
                  showButtons
                  buttonLayout="horizontal"
               />
            </FormField>
            <FormField
               :readonly
               fluid
               :error="form._errors.first('attributes.currency_code')"
               :label="$t('currency')"
               v-slot="slotProps"
            >
               <SelectCurrency v-bind="slotProps" v-model="form.attributes.currency_code" />
            </FormField>
            <FormField
               :readonly
               fluid
               :error="form._errors.first('payment_type')"
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
            <span class="form_box !flex-auto">
               <FormField
                  :readonly
                  fluid
                  :error="form._errors.first('bid')"
                  :label="$t('bid')"
                  v-slot="slotProps"
               >
                  <InputNumber
                     v-bind="slotProps"
                     v-model="form.bid"
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
                  :error="form._errors.first('bid_discount')"
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
            </span>
         </FormBox>
         <AssemblyForm
            v-if="form.record_type === 'assembly'"
            class="!flex-auto w-full"
            :form
            :readonly
         />
         <FormField
            :readonly
            fluid
            :error="form._errors.first('details')"
            :label="$t('details')"
            v-slot="slotProps"
            class="!flex-auto !max-w-full w-full h-fit"
         >
            <Editor v-bind="slotProps" v-model="form.details" />
         </FormField>
      </FormBox>
   </div>
</template>
