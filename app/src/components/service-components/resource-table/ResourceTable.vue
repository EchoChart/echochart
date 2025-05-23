<script setup>
import Collection from '@/lib/Collection';

defineOptions({
   inheritAttrs: false
});

const props = defineProps({
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

const totalRecords = ref(5);

const routeLoading = inject('routeLoading', false);
const loading = ref(routeLoading.value);

let ac = new AbortController();

async function getValues(metaObj) {
   if (loading.value) return;

   try {
      ac?.abort?.();
      ac = new AbortController();

      meta._reset(metaObj);

      loading.value = true;

      const req = supabase.from(props.from).select(props.select).abortSignal(ac.signal);

      !_isEmpty(meta._data) && req.setHeader?.('meta', encodeURI(JSON.stringify(meta._data)));

      const usePaginator = _get(attrs, 'paginator', true);
      if (usePaginator) {
         const countReq = supabase
            .from(props.from)
            .select?.(props.select, props.count)
            .abortSignal?.(ac.signal);

         if (!_isEmpty(meta._data)) {
            const encodedMeta = encodeURI(JSON.stringify(_pick(meta._data, ['filters'])));
            countReq.setHeader?.('meta', encodedMeta);
         }

         countReq.then?.(({ count }) => (totalRecords.value = count));
      }

      const { data } = await req.throwOnError();
      modelValue.value = data;
   } finally {
      loading.value = false;
   }
}

const updateCallback = () => getValues(meta._data);
onMounted(() => emitter.on(`${attrs.stateKey || props.from}-update`, updateCallback));
onBeforeUnmount(() => {
   emitter.off(`${attrs.stateKey || props.from}-update`, updateCallback);
   ac.abort?.();
});

const tableProps = computed(() => ({
   totalRecords: totalRecords.value,
   stateKey: props.from,
   loading: loading.value,
   value: values._data,
   onMeta: async (value) => await getValues(value),
   ...attrs
}));

const mounted = useMounted();
</script>
<template>
   <CustomTable v-bind="tableProps">
      <template v-for="slot in _keys($slots)" #[slot]="slotProps" :key="slot">
         <slot :name="slot" v-if="mounted" v-bind="slotProps" />
      </template>
   </CustomTable>
</template>
