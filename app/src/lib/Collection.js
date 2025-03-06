/**
 * @template T
 * @description Represents a generic type parameter for the collection. This allows the class to be typed dynamically based on the structure of the data being used.
 * `T` can represent an object or an array, where keys, indices, and values define the schema for the reactive state.
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
    * Constructor to initialize the state with provided data.
    * @param {T} [data={}] - Initial data to populate the collection. Defaults to an empty object if no data is provided.
    */
   constructor(data = {}) {
      this._state.value = _cloneDeep(data);
      this._defaults.value = _cloneDeep(data);

      const proxy = new Proxy(this, {
         /**
          * Retrieve all keys from the target's state object.
          * @param {Collection} target - The target instance of Collection
          * @returns {string[]} Array of keys from the state object.
          */
         ownKeys(target) {
            return _keys(target._state.value);
         },
         /**
          * Check if a key exists in the target or its state.
          * @param {Collection} target - The target instance of Collection
          * @param {string | symbol} key - Key to check for existence.
          * @returns {boolean} True if the key exists, false otherwise.
          */
         has(target, key) {
            return Reflect.has(target, key) || _has(target._state.value, key);
         },
         /**
          * Get a property from the target or its state.
          * @param {Collection} target - The target instance of Collection
          * @param {string | symbol} key - Key to retrieve.
          * @param {ProxyHandler<T>} receiver - Proxy handler receiver object.
          * @returns {*} Value of the property.
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
          * @param {Collection} target - The target instance of Collection
          * @param {string | symbol} key - Key to set.
          * @param {*} value - Value to set.
          * @param {ProxyHandler<T>} receiver - Proxy handler receiver object.
          * @returns {boolean} True if the operation succeeded, false otherwise.
          */
         set(target, key, value, receiver) {
            if (Reflect.has(target, key)) {
               const prop = Reflect.get(target, key, receiver);
               return isRef(prop)
                  ? Reflect.set(prop, 'value', value)
                  : Reflect.set(target, key, value, receiver);
            }
            if (_isNil(value) && !_isNil(_get(target._state, key, null)))
               return _unset(target._state.value, key);
            else return _set(target._state.value, key, value);
         }
      });

      return proxy;
   }

   /**
    * Set default values of the collection.
    * @param {T} [attrs={}] - Attributes to set as defaults. Defaults to an empty object if no data is provided.
    * @returns {Collection} - The updated instance of Collection.
    */
   _setDefaults(attrs = {}) {
      this._defaults = _cloneDeep(attrs);

      return this;
   }

   /**
    * Resets the collection to its default state.
    * @param {T} [attrs=this._defaults] - Attributes to reset to. Defaults to the current default values if no data is provided.
    * @returns {Collection} - The updated instance of Collection.
    */
   _reset(attrs = this._defaults) {
      this._state = _cloneDeep(attrs);

      return this;
   }

   /**
    * Retrieves the value associated with a given key in the `_state` object. If the key does not exist, it returns the specified default value.
    * @param {keyof T} key - The key to retrieve the value for.
    * @param {*} [value=null] - The default value to return if the key does not exist. Defaults to null.
    * @returns {T[keyof T]} - The value associated with the key, or the default value if the key is not found.
    */
   _get(key, value = null) {
      return _get(this._state, key, value);
   }

   /**
    * Sets a value in the state by key, or replaces the entire state.
    * @param {keyof T | Partial<T>} [key] - Key to set, or new attributes to merge into the state.
    * @param {*} [value=undefined] - Value to set. Not used if `key` is an object or array.
    * @returns {Collection} - The updated instance of Collection.
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
    * @returns {Collection} - The updated instance of Collection.
    */
   _merge(attributes) {
      _merge(this._state, attributes);

      return this;
   }

   /**
    * Returns a subset of the state with specified keys.
    * @param {...(keyof T)} keys - Keys to pick from the state.
    * @returns {Partial<T>} - Object containing only the specified keys and their values.
    */
   _only(...keys) {
      return _pick(this._state, keys);
   }

   /**
    * Readonly state of the collection.
    * @type {import('vue').ComputedRef<Readonly<T>>}
    */
   _data = computed(() => this._state.value);

   /**
    * Converts the state to a JSON string.
    * @returns {string} - String representation of the state in JSON format.
    */
   get _toJson() {
      return JSON.stringify(this._data || '');
   }
}
