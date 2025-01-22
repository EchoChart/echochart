<script setup>
import Collection from '@/lib/Collection';
const { currentTenant } = storeToRefs(useAuthStore());

defineOptions({
   inheritAttrs: false
});

const props = defineProps({
   mapClass: {
      type: Function
   },
   from: {
      type: String,
      required: true
   },
   select: {
      type: String,
      default: '*',
      required: true
   },
   count: {
      type: Object,
      default: () => ({
         count: 'exact',
         head: true
      })
   }
});
const meta = new Collection({});
const values = props.mapClass ? new props.mapClass([]) : new Collection([]);
const modelValue = defineModel({
   get: () => values,
   set: (value) => values._set(value),
   default: []
});

const attrs = useAttrs();

const totalRecords = ref(0);

const routeLoading = inject('routeLoading', false);
const loading = ref(routeLoading.value);

let abort = new AbortController();

async function getValues(metaObj) {
   try {
      abort?.abort?.();
      abort = new AbortController();

      meta._reset(metaObj);

      loading.value = true;

      const req = supabase
         .from(props.from)
         .select(props.select)
         .abortSignal(abort.signal)
         .throwOnError();

      !_isEmpty(meta._data) && req.setHeader?.('meta', JSON.stringify(meta._data));

      const usePaginator = _get(attrs, 'paginator', true);
      if (usePaginator) {
         const countReq = supabase
            .from(props.from)
            .select?.(props.select, props.count)
            .abortSignal?.(abort.signal)
            .eq?.('tenant_id', currentTenant.value.id);

         !_isEmpty(meta._data) &&
            countReq.setHeader?.('meta', JSON.stringify(_pick(meta._data, ['filters'])));

         countReq.throwOnError?.().then?.(({ count }) => (totalRecords.value = count));
      }

      const { data } = await req.throwOnError();
      modelValue.value = data;
   } finally {
      loading.value = false;
   }
}

const tableProps = computed(() => ({
   totalRecords: totalRecords.value,
   stateKey: props.from,
   loading: loading.value,
   onMeta: async (value) => await getValues(value),
   ...attrs
}));
emitter.on(`${props.from}-update`, () => getValues(meta._data));
const mounted = useMounted();
</script>
<template>
   <CustomTable :value="values?._data" v-bind="tableProps">
      <template v-for="slot in _keys($slots)" #[slot]="slotProps" :key="slot">
         <slot :name="slot" v-if="mounted" v-bind="slotProps" />
      </template>
   </CustomTable>
</template>
