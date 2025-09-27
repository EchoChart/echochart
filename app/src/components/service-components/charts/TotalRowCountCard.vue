<script setup lang="ts">
import StatisticCard, {
   StatisticCardProps,
   StatisticCardSlots
} from '@/components/ui/charts/StatisticCard.vue';
import { CustomTableProps } from '@/components/ui/custom-table/CustomTable.vue';
import { parseDayjs } from '@/lib/dayjs';
import { ManipulateType } from 'dayjs';

export type TotalRowCountCardProps = StatisticCardProps & {
   from: string & keyof Tables;
   filters?: CustomTableProps['filters'];
};

const slots = defineSlots<StatisticCardSlots>();

const props = withDefaults(defineProps<TotalRowCountCardProps>(), {
   from: null,
   filters: null
});

const totalRowCount = ref(null);
const sinceDateCount = ref(null);
const loading = ref(true);
const selectLoading = ref(true);

const dateOptions: ComputedRef<
   {
      value: number;
      unit: ManipulateType;
      label?: string;
   }[]
> = computed(() => [
   { value: 1, unit: 'week', label: i18n.t('dashboard.statistics.last_week') },
   { value: 1, unit: 'month', label: i18n.t('dashboard.statistics.last_month') },
   { value: 4, unit: 'month', label: i18n.t('dashboard.statistics.last_quarter') },
   { value: 6, unit: 'month', label: i18n.t('dashboard.statistics.last_half') },
   { value: 1, unit: 'year', label: i18n.t('dashboard.statistics.last_year') }
]);

const selectedDate = ref(dateOptions.value[1]);

const loadTotalStatistics = async () => {
   try {
      loading.value = true;
      return await supabase
         .from(props.from)
         .select('', {
            count: 'exact',
            head: true
         })
         .setHeader('meta', encodeURI(JSON.stringify({ filters: props.filters })))
         .then(({ count }) => (totalRowCount.value = count));
   } finally {
      setTimeout(
         async () => {
            loading.value = false;
         },
         _random(150, 300, false)
      );
   }
};

const loadTotalStatisticsByDate = async (sinceDate = selectedDate.value) => {
   try {
      selectLoading.value = true;

      const date = parseDayjs({ value: new Date(Date.now()).toISOString() })
         .subtract(sinceDate.value, sinceDate.unit)
         .format('YYYY-MM-DDTHH:mm:ss');

      return await supabase
         .from(props.from)
         .select('', {
            count: 'exact',
            head: true
         })
         .setHeader('meta', encodeURI(JSON.stringify({ filters: props.filters })))
         .gte('created_at', date)
         .then(({ count }) => (sinceDateCount.value = count));
   } finally {
      setTimeout(
         async () => {
            selectLoading.value = false;
         },
         _random(150, 300, false)
      );
   }
};

const loadStatistics = async (sinceDate = selectedDate.value) => {
   try {
      loadTotalStatistics();
      loadTotalStatisticsByDate();
   } catch (error) {
      console.error(error);
   }
};

loadStatistics();

watch(() => selectedDate.value, loadTotalStatisticsByDate, { deep: true });

const mounted = useMounted();
</script>

<template>
   <StatisticCard
      v-bind="_omit(props, ['from', 'filters'])"
      :statistic="$t('dashboard.statistics.total') + ': ' + totalRowCount?.toString()"
      :loading
   >
      <template #description v-if="totalRowCount > 0">
         <FormField :loading="selectLoading" v-slot="slotProps">
            <Select
               v-model="selectedDate"
               :options="dateOptions"
               :option-label="'label'"
               v-bind="slotProps"
            >
               <template #value="{ value }">
                  <div class="flex gap-2">
                     <span v-text="value.label" />
                     <span class="text-primary font-medium" v-text="`${sinceDateCount}`" />
                  </div>
               </template>
            </Select>
         </FormField>
      </template>
      <template v-for="slot in _keys(slots)" #[slot]="slotProps" :key="slot">
         <slot :name="slot" v-bind="slotProps" />
      </template>
   </StatisticCard>
</template>
