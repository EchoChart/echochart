export const PRODUCT_CATEGORIES = computed(() => [
   {
      label: i18n.t('fields.device'),
      value: 'device'
   },
   {
      label: i18n.t('fields.battery'),
      value: 'battery'
   },
   {
      label: i18n.t('fields.spare_part'),
      value: 'spare_part'
   },
   {
      label: i18n.t('fields.service'),
      value: 'service'
   }
]);
