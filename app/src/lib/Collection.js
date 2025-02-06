/**
 * @template T
 * @description Represents the generic type parameter for the collection. This allows the class to be typed dynamically
 * based on the structure of the data being used. `T` can represent an object or an array, where the keys, indices,
 * and values define the schema for the reactive state.
 */
export default class Collection {
   /**
    * Reactive state of the collection.
    * @type {import('vue').Ref<T>}
    */
   _state = ref();

   /**
    * Default state of the collection.
    * @type {import('vue').Ref<T>}
    */
   _defaults = ref();

   /**
    * Constructor to initialize state with provided data.
    * @param {T} data - Initial data to populate the collection.
    */
   constructor(data = {}) {
      this._state.value = _cloneDeep(data);
      this._defaults.value = _cloneDeep(data);

      const proxy = new Proxy(this, {
         /**
          * Retrieve all keys from the target's state object.
          */
         ownKeys(target) {
            return _keys(target._state.value);
         },
         /**
          * Check if a key exists in the target or its state.
          */
         has(target, key) {
            return Reflect.has(target, key) || _has(target._state.value, key);
         },
         /**
          * Get a property from the target or its state.
          */
         get(target, key, receiver) {
            if (Reflect.has(target, key)) {
               const prop = Reflect.get(target, key, receiver);
               return isRef(prop) ? prop.value : prop;
            }
            return _get(target._state.value, key);
         },
         /**
          * Set a property on the target or its state.
          */
         set(target, key, value, receiver) {
            if (Reflect.has(target, key)) {
               const prop = Reflect.get(target, key, receiver);
               return isRef(prop)
                  ? Reflect.set(prop, 'value', value)
                  : Reflect.set(target, key, value, receiver);
            }
            if (_isNil(value)) return _unset(target._state.value, key);
            else return _set(target._state.value, key, value);
         }
      });

      return proxy;
   }

   /**
    * Set default values of the collection.
    * @param {T} [attributes] - Attributes to set as defaults.
    * @returns {this}
    */
   _setDefaults(attrs = {}) {
      this._defaults = _cloneDeep(attrs);

      return this;
   }

   /**
    * Resets the collection to its default state.
    * @param {T} [attrs] - Attributes to reset to (defaults by default).
    * @returns {this}
    */
   _reset(attrs = this._defaults) {
      this._state = _cloneDeep(attrs);

      return this;
   }

   /**
    * Retrieves the value associated with a given key in the `_state` object.
    * If the key does not exist, it returns the specified default value.
    * @param {keyof T} key - The key to retrieve the value for.
    * @param {any} [value] - The default value to return if the key does not exist.
    * @returns {T[keyof T]} - The value associated with the key, or the default value if the key is not found.
    */
   _get(key, value = null) {
      return _get(this._state, key, value);
   }

   /**
    * Sets a value in the state by key, or replaces the entire state.
    * @param {keyof T} key - Key to set.
    * @param {any} [value] - Value to set.
    * @returns {this}
    */
   _set(key, value = undefined) {
      if (_isObject(key) || _isArray(key)) {
         this._state = key;
      } else {
         _set(this._state, key, value);
      }
      return this;
   }

   /**
    * Merges new attributes into the collection.
    * @param {Partial<T>} attributes - Attributes to merge.
    * @returns {this}
    */
   _merge(attributes) {
      _merge(this._state, attributes);

      return this;
   }

   /**
    * Returns a subset of the state with specified keys.
    * @param {...(keyof T)} keys - Keys to pick from the state.
    * @returns {Partial<T>}
    */
   _only(...keys) {
      return _pick(this._data, keys);
   }

   /**
    * Readonly state of the collection.
    * @type {import('vue').DeepReadonly<T>}
    */
   // get _data() {
   //    return readonly(this._state);
   // }

   _data = computed(() => this._state.value);

   /**
    * Converts the state to a JSON string.
    * @returns {string}
    */
   get _toJson() {
      return JSON.stringify(this._data || '');
   }
}
