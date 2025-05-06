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

export default Validator;
