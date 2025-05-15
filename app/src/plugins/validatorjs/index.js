import { isValidPhoneNumber } from 'libphonenumber-js';
import Validator from 'validatorjs/dist/validator.js';
import en from 'validatorjs/src/lang/en.js';
import tr from 'validatorjs/src/lang/tr.js';

Validator.setMessages('tr', tr);
Validator.setMessages('en', en);

export const formAttributeFormatter = (attr) => {
   const words = attr
      .split?.(/[\.\s]/g)
      .map?.((e) => {
         if (Number.isNaN(Number.parseInt(e))) return e;
      })
      .filter(Boolean);
   const attributeName = _lowerCase(_startCase(i18n.t(_last(words))));
   return attributeName;
};
Validator.setAttributeFormatter(formAttributeFormatter);

Validator.register('phone', (value) => {
   if (_isString(value) && !_startsWith(value, '+')) value = '+' + value;
   return isValidPhoneNumber(value);
});

Validator.register(
   'lte',
   function (value, requirement) {
      const val = _get(this.validator?.input, requirement, requirement);
      this.ruleValue = val;
      return this.inputValue <= val;
   },
   ':attribute <= :lte'
);

Validator.register(
   'gte',
   function (value, requirement) {
      const val = _get(this.validator?.input, requirement, requirement);
      this.ruleValue = val;
      return this.inputValue >= val;
   },
   ':attribute >= :gte'
);

Validator.register(
   'lt',
   function (value, requirement) {
      const val = _get(this.validator?.input, requirement, requirement);
      this.ruleValue = val;
      return this.inputValue < val;
   },
   ':attribute < :lt'
);

Validator.register(
   'gt',
   function (value, requirement) {
      const val = _get(this.validator?.input, requirement, requirement);
      this.ruleValue = val;
      return this.inputValue > val;
   },
   ':attribute > :gt'
);

export default Validator;
