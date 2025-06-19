import { isValidPhoneNumber } from 'libphonenumber-js';
import Validator from 'validatorjs/dist/validator.js';

import de from 'validatorjs/src/lang/de.js';
import en from 'validatorjs/src/lang/en.js';
import fr from 'validatorjs/src/lang/fr.js';
import ja from 'validatorjs/src/lang/ja.js';
import ko from 'validatorjs/src/lang/ko.js';
import pl from 'validatorjs/src/lang/pl.js';
import ru from 'validatorjs/src/lang/ru.js';
import tr from 'validatorjs/src/lang/tr.js';
import zh from 'validatorjs/src/lang/zh.js';

Validator.setMessages('en', en);
Validator.setMessages('tr', tr);
Validator.setMessages('fr', fr);
Validator.setMessages('de', de);
Validator.setMessages('pl', pl);
Validator.setMessages('ru', ru);
Validator.setMessages('cn', zh);
Validator.setMessages('jp', ja);
Validator.setMessages('ko', ko);
Validator.setMessages('tr', tr);

export const formAttributeFormatter = (attr) => {
   const words = i18n
      .t(attr)
      .split?.(/[\.\s]/g)
      .map?.((e) => {
         if (Number.isNaN(Number.parseInt(e))) return e;
      })
      .filter(Boolean);

   const field = _last(words) === 'display_name' ? 'name' : _last(words);
   const attributeName = i18n.t('fields.' + field);
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
