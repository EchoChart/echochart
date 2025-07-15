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

export const PRODUCT_CATEGORY_PROPS = {
   device: { severity: 'warn', icon: 'pi pi-headphones' },
   ['spare part']: { severity: 'info', icon: PrimeIcons.WRENCH },
   ['service']: { severity: 'secondary', icon: PrimeIcons.FILE },
   battery: { severity: 'success', icon: PrimeIcons.BOLT }
};
