import Validator from '@/plugins/validatorjs';
import Collection from '@lib/Collection';
import { detailedDiff, diff, updatedDiff } from 'deep-object-diff';
import Errors from 'validatorjs/src/errors.js';

/**
 * @template T
 * @extends {Collection<T>}
 */
export class Form extends Collection {
   /**
    * Reactive rules object.
    * @type {import('vue').Reactive<import('validatorjs').Rules>}
    */
   _rules = reactive({});

   /**
    * Reactive errors object.
    * @type {import('vue').Reactive<Errors>}
    */
   _errors = reactive(new Errors());

   /**
    * Whether the form is valid or not.
    * @type {boolean}
    */
   _isValid = true;

   /**
    * Computed property indicating whether any data has changed.
    * @type {ComputedRef<boolean>}
    */
   _isChanged = computed(() => _size(this._changedData) > 0);

   /**
    * Reactive array of attributes to auto-validate.
    * @type {Ref<Array|string|null>}
    */
   _autoValidate = ref([]);

   /**
    * Reactive flag indicating whether the form uses a dialog.
    * @type {Ref<boolean>}
    */
   _useDialogForm = ref(false);

   /**
    * Computed property indicating the changed data.
    * @type {ComputedRef<Object>}
    */
   _changedData = computed(() => {
      return diff(this._defaults, this._data);
   });

   /**
    * Computed property indicating the categorized changed data.
    * @type {ComputedRef<Object>}
    */
   _detailedChagedData = computed(() => {
      return detailedDiff(this._defaults, this._data);
   });

   /**
    * Constructor for Form class.
    *
    * @param {Object} options - Options object.
    * @param {Object} [options.data={}] - Initial data.
    * @param {import('validatorjs').Rules} [options.rules={}] - Validation rules.
    * @param {Array<string>|null} [options.autoValidate=[]] - Attributes to auto-validate.
    * @param {boolean} [options.useDialogForm=true] - Whether the form uses a dialog.
    */
   constructor({ data = {}, rules = {}, autoValidate = [], useDialogForm = true }) {
      super(data);
      this._autoValidate = autoValidate;
      this._useDialogForm = useDialogForm;

      this._setRules(rules).#_initWatcher();

      if (this._useDialogForm) this.#_initDialogForm();
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

   /**
    * Validates the form data.
    *
    * @param {Array<string>|null} [keys=null] - Attributes to validate.
    * @param {import('validatorjs').Rules} [rules=this._rules] - Validation rules.
    * @returns {boolean} - Whether validation passed.
    */
   _validate(keys = null, rules = this._rules) {
      Validator.useLang(locale.value);

      let values = this._data;

      if (_isArray(keys)) {
         rules = _pick(rules, keys);
         values = _pick(this._data, keys);
      }

      const validation = new Validator(values, rules);

      validation.form = this;

      const passed = validation.passes();

      _assign(this._errors, validation.errors);
      this._isValid = passed;

      return this._isValid;
   }

   /**
    * Resets the form data to default values.
    *
    * @param {Object} [attrs=this._defaults] - Default attributes.
    * @returns {this} - Form instance for chaining.
    */
   _reset(attrs = this._defaults) {
      super._reset(attrs);

      this._errors = reactive(new Errors());

      return this;
   }

   /**
    * Sets the validation rules for the form.
    *
    * @param {import('validatorjs').Rules} [rules={}] - Validation rules.
    * @returns {this} - Form instance for chaining.
    */
   _setRules(rules = {}) {
      this._rules = reactive(rules);
      return this;
   }
}
