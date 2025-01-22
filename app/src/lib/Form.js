import Collection from '@lib/Collection';
import { diff, updatedDiff } from 'deep-object-diff';

import Validator from 'validatorjs/dist/validator.js';
import Errors from 'validatorjs/src/errors.js';
import en from 'validatorjs/src/lang/en.js';
import tr from 'validatorjs/src/lang/tr.js';

Validator.setMessages('tr', tr);
Validator.setMessages('en', en);

Validator.setAttributeFormatter((attr) => {
   return attr
      .split('.')
      .map((e) => {
         if (Number.isNaN(Number.parseInt(e))) return e;
      })
      .join(' ');
});

Validator.register('phone', (value) => {
   return value.match(/^[+]?[\d]{0,3}\W?[(]?[\d]{3}[)]?[-\s.]?[\d]{3}[-\s.]?[\d]{4,6}$/im);
});

/**
 * @template T
 * @extends {Collection<T>}
 */
export class Form extends Collection {
   _rules = reactive({});
   _errors = reactive(new Errors());
   _isValid = true;
   _isChanged = computed(() => _size(this._changedData) > 0);
   _autoValidate = ref([]);
   _changedData = computed(() => {
      return diff(this._defaults, this._data);
   });

   constructor({ data, rules, autoValidate = [] }) {
      super(data);
      this._autoValidate = autoValidate;

      this._setRules(rules).#_initWatcher().#_initDialogForm();
   }

   #_initWatcher() {
      watch(
         () => [this._autoValidate, this._data, this._rules],
         ([validateAttributes, changedData, changedRules]) => {
            if (validateAttributes === true) {
               this._isValid = this._validate(updatedDiff(changedData, changedRules));
               return;
            }

            if (_isArray(validateAttributes) && _size(validateAttributes) > 0) {
               const data = _pick(changedData, validateAttributes);
               const rules = _pick(changedRules, validateAttributes);
               this._isValid = this._validate(data, rules);
            }
         },
         { deep: true }
      );
      return this;
   }

   #_initDialogForm() {
      const dialogRef = getCurrentInstance() && inject('dialogRef', null);

      if (dialogRef?.value) {
         this._merge(dialogRef.value?.data?.form);

         watch(
            () => this._toJson,
            () => {
               _set(dialogRef.value, 'data.form', this._data);
            },
            { immediate: true }
         );
      }
      return this;
   }

   _validate(keys = null, rules = this._rules) {
      Validator.useLang(locale.value);

      let values = this._data;

      if (_isArray(keys)) {
         rules = _pick(this._rules, keys);
         values = _pick(this._data, keys);
      }

      const validation = new Validator(values, rules);
      const passed = validation.passes();

      _assign(this._errors, validation.errors);
      this._isValid = passed;

      return this._isValid;
   }

   _reset(attrs = this._defaults) {
      super._reset(attrs);

      this._errors = reactive(new Errors());

      return this;
   }

   _setRules(rules = {}) {
      this._rules = rules;
      return this;
   }
}
