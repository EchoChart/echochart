import { isValidPhoneNumber } from 'libphonenumber-js';
import Validator from 'validatorjs/dist/validator.js';
import en from 'validatorjs/src/lang/en.js';
import tr from 'validatorjs/src/lang/tr.js';

Validator.setMessages('tr', tr);
Validator.setMessages('en', en);

Validator.setAttributeFormatter((attr) => {
   return attr
      .replace?.(/(\.|_|-)/g, ' ')
      .split?.('.')
      .map?.((e) => {
         if (Number.isNaN(Number.parseInt(e))) return e;
      })
      .join?.(' ');
});

Validator.register('phone', (value) => {
   if (_isString(value) && !_startsWith(value, '+')) value = '+' + value;
   return isValidPhoneNumber(value);
});
Validator.register(
   'lte',
   function (value, requirement) {
      return this.inputValue <= _get(this.validator?.input, requirement, requirement);
   },
   ':attribute <= :lte'
);
Validator.register(
   'gte',
   function (value, requirement) {
      return this.inputValue >= _get(this.validator?.input, requirement, requirement);
   },
   ':attribute >= :gte'
);
Validator.register(
   'lt',
   function (value, requirement) {
      return this.inputValue < _get(this.validator?.input, requirement, requirement);
   },
   ':attribute < :lt'
);
Validator.register(
   'gt',
   function (value, requirement) {
      return this.inputValue > _get(this.validator?.input, requirement, requirement);
   },
   ':attribute > :gt'
);
Validator.register(
   'record_status',
   function (value) {
      const record_type = _get(this.validator?.input, 'record_type', null);
      if (!record_type) return false;
      if (record_type === 'repair') {
         return [
            'pending',
            'at_service',
            'bid_pending',
            'bid_approved',
            'bid_rejected',
            'done'
         ].includes(value);
      } else return ['pending', 'approved', 'rejected', 'client_pending', 'done'].includes(value);
   },
   i18n.t('invalid')
);

Validator.register(
   'record_amount',
   function (value) {
      const form = this.validator.form;
      const available_quantity =
         form.stock?.id === form._defaults?.stock_id
            ? form._defaults?.amount + form.stock?.available_quantity
            : form.stock?.available_quantity;

      return available_quantity >= value;
   },
   i18n.t('invalid')
);

export default Validator;
