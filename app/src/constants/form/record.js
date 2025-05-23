export const recordTypes = [
   {
      value: 'trial',
      label: i18n.t('trial')
   },
   {
      value: 'sale',
      label: i18n.t('sale')
   },
   {
      value: 'assemble',
      label: i18n.t('assemble')
   },
   {
      value: 'repair',
      label: i18n.t('repair')
   },
   {
      value: 'promotion',
      label: i18n.t('promotion')
   }
];

export const paymentTypes = [
   {
      value: 'cash',
      label: i18n.t('cash')
   },
   {
      value: 'credit_card',
      label: i18n.t('credit card')
   }
];

export const recordStatuses = new Proxy(
   {
      repair: [
         {
            value: 'pending',
            label: i18n.t('pending')
         },
         {
            value: 'pending_service',
            label: i18n.t('pending_service')
         },
         {
            value: 'client_pending_service_bid',
            label: i18n.t('client_pending_service_bid')
         },
         {
            value: 'client_approved_service_bid',
            label: i18n.t('client_approved_service_bid')
         },
         {
            value: 'client_rejected_service_bid',
            label: i18n.t('client_rejected_service_bid')
         },
         {
            value: 'done',
            label: i18n.t('done')
         }
      ],
      common: [
         {
            value: 'pending',
            label: i18n.t('pending')
         },
         {
            value: 'approved',
            label: i18n.t('approved')
         },
         {
            value: 'rejected',
            label: i18n.t('rejected')
         },
         {
            value: 'pending_client',
            label: i18n.t('pending_client')
         },
         {
            value: 'done',
            label: i18n.t('done')
         }
      ]
   },
   {
      get(target, key, receiver) {
         return _get(target, key, _get(target, 'common'));
      }
   }
);

export const moldTypes = [
   {
      value: 'biopar',
      label: i18n.t('biopar')
   },
   {
      value: 'hard',
      label: i18n.t('hard')
   }
];

export const moldModels = [
   {
      value: 'micro',
      label: i18n.t('micro')
   },
   {
      value: 'full',
      label: i18n.t('full')
   },
   {
      value: 'half',
      label: i18n.t('half')
   },
   {
      value: 'supported',
      label: i18n.t('supported')
   },
   {
      value: 'prob',
      label: i18n.t('prob')
   }
];

export const moldVentilation = {
   min: 0.8,
   max: 3,
   step: 0.2
};

export const moldSpeakerSize = {
   min: 1,
   max: 5,
   step: 1
};

export const moldHopPowers = ['s', 'm', 'p', 'hp', '85', '100', '105'];

export const innerMoldHopPowers = ['65', '80', '100'];
