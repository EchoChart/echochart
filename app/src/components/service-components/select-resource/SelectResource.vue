<script setup>
import ResourceTable from '@/components/service-components/resource-table/ResourceTable.vue';
import { useDialog } from 'primevue';
import { useI18n } from 'vue-i18n';

defineOptions({
   inheritAttrs: false
});
const { t, te } = useI18n();

const emit = defineEmits(['dialog']);
const props = defineProps({
   optionLabel: {
      type: String,
      default: null
   },
   optionValue: {
      type: String,
      default: 'id'
   },
   tableProps: {
      type: Object,
      default: () => ({})
   }
});
const attrs = useAttrs();
const slots = useSlots();
const tableProps = reactive(_merge({}, _cloneDeep(props.tableProps)));

let dialog = null;
const dialogs = useDialog();

const dialogContent = h(ResourceTable, tableProps, slots);
const selectResource = () => {
   dialog = dialogs.open(dialogContent, {
      props: {
         header: t('common.select'),
         class: '!min-w-[clamp(32rem,50%,100vw)] !max-w-min'
      }
   });
   emit('dialog', dialog);
};
watch(
   () => props.tableProps,
   (value) => _merge(tableProps, _cloneDeep(value)),
   { deep: true }
);
</script>
<template>
   <slot />
   <InputGroup :class="attrs.class">
      <InputText v-bind="attrs" readonly />
      <InputGroupAddon>
         <Button :icon="PrimeIcons.SEARCH_PLUS" @click="selectResource" />
      </InputGroupAddon>
   </InputGroup>
</template>
