export const RECORD_TYPES = computed(() => [
   {
      value: 'trial',
      label: i18n.t('fields.trial')
   },
   {
      value: 'sale',
      label: i18n.t('fields.sale')
   },
   {
      value: 'assemble',
      label: i18n.t('fields.assemble')
   },
   {
      value: 'repair',
      label: i18n.t('fields.repair')
   },
   {
      value: 'promotion',
      label: i18n.t('fields.promotion')
   }
]);

export const PAYMENT_TYPES = computed(() => [
   {
      value: 'cash',
      label: i18n.t('fields.cash')
   },
   {
      value: 'credit_card',
      label: i18n.t('fields.credit_card')
   }
]);

export const RECORD_STATUSES = computed(
   () =>
      new Proxy(
         {
            repair: [
               {
                  value: 'pending',
                  label: i18n.t('fields.pending')
               },
               {
                  value: 'pending_service',
                  label: i18n.t('fields.pending_service')
               },
               {
                  value: 'client holds service bid',
                  label: i18n.t('fields.client holds service bid')
               },
               {
                  value: 'client_approved_service_bid',
                  label: i18n.t('fields.client_approved_service_bid')
               },
               {
                  value: 'client_rejected_service_bid',
                  label: i18n.t('fields.client_rejected_service_bid')
               },
               {
                  value: 'done',
                  label: i18n.t('fields.done')
               }
            ],
            common: [
               {
                  value: 'pending',
                  label: i18n.t('fields.pending')
               },
               {
                  value: 'approved',
                  label: i18n.t('fields.approved')
               },
               {
                  value: 'rejected',
                  label: i18n.t('fields.rejected')
               },
               {
                  value: 'pending_client',
                  label: i18n.t('fields.pending_client')
               },
               {
                  value: 'done',
                  label: i18n.t('fields.done')
               }
            ]
         },
         {
            get(target, key, receiver) {
               return _get(target, key, _get(target, 'common'));
            }
         }
      )
);

export const MOLD_TYPES = computed(() => [
   {
      value: 'biopar',
      label: i18n.t('fields.biopar')
   },
   {
      value: 'hard',
      label: i18n.t('fields.hard')
   }
]);

export const MOLD_MODELS = computed(() => [
   {
      value: 'micro',
      label: i18n.t('fields.micro')
   },
   {
      value: 'full',
      label: i18n.t('fields.full')
   },
   {
      value: 'half',
      label: i18n.t('fields.half')
   },
   {
      value: 'supported',
      label: i18n.t('fields.supported')
   },
   {
      value: 'prob',
      label: i18n.t('fields.prob')
   }
]);

export const INNER_MOLD_MODELS = computed(() => [
   {
      value: 'ITE',
      label: i18n.t('const.earmold.inner.models.ITE')
   },
   {
      value: 'ITC',
      label: i18n.t('const.earmold.inner.models.ITC')
   },
   {
      value: 'CIC',
      label: i18n.t('const.earmold.inner.models.CIC')
   }
]);

export const MOLD_VENTILATION = {
   min: 0,
   max: 3,
   step: 0.2
};

export const MOLD_SPEAKER_SIZE = {
   min: 1,
   max: 5,
   step: 1
};

export const MOLD_SPEAKER_POWERS = ['s', 'm', 'p', 'hp', '85', '100', '105'];

export const INNER_MOLD_SPEAKER_POWERS = ['65', '80', '100'];
