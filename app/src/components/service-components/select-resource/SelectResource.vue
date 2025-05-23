<script setup>
import ResourceTable from '@/components/service-components/resource-table/ResourceTable.vue';
import { useDialog } from 'primevue';

defineOptions({
   inheritAttrs: false
});

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

let dialog = null;
const dialogs = useDialog();

const tableProps = reactive(_merge({}, props.tableProps));
const selectResource = () => {
   dialog = dialogs.open(h(ResourceTable, tableProps, slots), {
      props: {
         header: i18n.t('select_item'),
         class: '!min-w-[clamp(32rem,50%,100vw)] !max-w-min'
      }
   });
   emit('dialog', dialog);
};
watch(
   () => props.tableProps,
   (value) => _merge(tableProps, value),
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
