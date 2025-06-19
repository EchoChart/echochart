import { PropertyName, PropertyPath } from 'lodash';
import { Ref } from 'vue';

// Define the interface for Collection
export interface ICollection<T = any> {
   /**
    * Set default values of the collection.
    * @param attrs - Default attributes to set.
    * @returns {Collection<T>} - The updated instance of Collection.
    */
   _setDefaults(attrs: Partial<T>): this;

   /**
    * Resets the collection to its default state.
    * @param attrs - Attributes to reset the collection with, defaults to current defaults.
    * @returns {Collection<T>} - The updated instance of Collection.
    */
   _reset(attrs?: T): this;

   /**
    * Retrieves the value associated with a given key in the `_state` object. If the key does not exist, it returns the specified default value.
    * @param key - Key of the property to retrieve.
    * @param value - Default value if the key is not found.
    * @returns {T[keyof T]} - The value associated with the key, or the default value if the key is not found.
    */
   _get(key: keyof T, value?: any): T[keyof T];

   /**
    * Sets a value in the state by key, or replaces the entire state.
    * @param key - Key of the property to set or an object/array to replace the entire state.
    * @param value - Value to set for the property (if key is not an object/array).
    * @returns {Collection<T>} - The updated instance of Collection.
    */
   _set(key: keyof T | Partial<T> | T, value?: any): this;

   /**
    * Merges new attributes into the collection.
    * @param attributes - Attributes to merge into the collection.
    * @returns {Collection<T>} - The updated instance of Collection.
    */
   _merge(attributes: Partial<T>): this;

   /**
    * Returns a subset of the state with specified keys.
    * @param keys - Keys to include in the subset.
    * @returns {Partial<T>} - Object containing only the specified keys and their values.
    */
   _only(...keys: (keyof T)[]): Partial<T>;
}

/**
 * Represents a generic type parameter for the collection. This allows the class to be typed dynamically based on the structure of the data being used.
 * `T` can represent an object or an array, where keys, indices, and values define the schema for the reactive state.
 */
export default class Collection<T = any> implements ICollection<T> {
   /**
    * Reactive state of the collection.
    */
   protected _state: T | T[] = ref<T>({} as T) as T | T[];

   /**
    * Default state of the collection.
    */
   _defaults: Partial<T> = ref<Partial<T>>({} as Partial<T>) as Partial<T>;

   /**
    * Constructor to initialize the state with provided data.
    * @param data - Initial data for the collection.
    */
   constructor(data: T = {} as T) {
      _set(this._defaults as unknown as Ref<Partial<T>>, 'value', _cloneDeep(data));
      _set(this._state as Ref<T>, 'value', _cloneDeep(data));
      return this;
   }

   static create<T = any>(data: T = {} as T): Collection<T> & Collection<T>['_data'] {
      const instance = new this<T>(data);
      const proxy = new Proxy(instance, {
         /**
          * Retrieve all keys from the target's state object.
          * @returns {string[]} Array of keys from the state object.
          */
         ownKeys(target: Collection<T>): string[] {
            return _keys((target._state as Ref<T>).value);
         },
         /**
          * Check if a key exists in the target or its state.
          * @param key - Key to check for existence.
          * @returns {boolean} True if the key exists, false otherwise.
          */
         has(target: Collection<T>, key: string | symbol): boolean {
            return Reflect.has(target, key) || _has((target._state as Ref<T>).value, key);
         },
         /**
          * Get a property from the target or its state.
          * @param key - Key of the property to get.
          * @param receiver - Proxy handler receiver.
          * @returns {*} Value of the property.
          */
         get(
            target: Collection<T>,
            key: string | symbol,
            receiver: ProxyHandler<T & object>
         ): Partial<Collection<T> | T> {
            if (Reflect.has(target, key)) {
               const prop = Reflect.get(target, key, receiver);
               return unref(prop);
            }
            return _get((target._state as Ref<T>).value, key, null);
         },
         /**
          * Set a property on the target or its state.
          * @param key - Key of the property to set.
          * @param value - Value to set for the property.
          * @param receiver - Proxy handler receiver.
          * @returns {boolean} True if the operation succeeded, false otherwise.
          */
         set(
            target: Collection<T>,
            key: string,
            value: any,
            receiver: ProxyHandler<T & object>
         ): boolean {
            if (Reflect.has(target, key)) {
               const prop = Reflect.get(target, key, receiver);
               return isRef(prop)
                  ? Reflect.set(prop, 'value', value)
                  : Reflect.set(target, key, value, receiver);
            }

            if (_isNil(value)) return _unset((target._state as Ref<T>).value, key);
            else
               return !!_set((target._state as unknown as Ref<T & object>).value, `${key}`, value);
         }
      });
      return proxy as unknown as Collection<T> & Ref<T>['value'];
   }

   /**
    * Set default values of the collection.
    * @param attrs - Default attributes to set.
    * @returns {Collection<T>} - The updated instance of Collection.
    */
   _setDefaults(attrs: Partial<T> = {}): this {
      this._defaults = _cloneDeep(attrs);

      return this;
   }

   /**
    * Resets the collection to its default state.
    * @param attrs - Attributes to reset the collection with, defaults to current defaults.
    * @returns {Collection<T>} - The updated instance of Collection.
    */
   _reset(attrs: T = this._defaults as T): this {
      (this._state as T) = _cloneDeep(attrs);

      return this;
   }

   /**
    * Retrieves the value associated with a given key in the `_state` object. If the key does not exist, it returns the specified default value.
    * @param key - Key of the property to retrieve.
    * @param value - Default value if the key is not found.
    * @returns {T[keyof T]} - The value associated with the key, or the default value if the key is not found.
    */
   _get(key: keyof T | PropertyName, value: any = null): T[keyof T] {
      return _get(this._state, key, value);
   }

   /**
    * Sets a value in the state by key, or replaces the entire state.
    * @param key - Key of the property to set or an object/array to replace the entire state.
    * @param value - Value to set for the property (if key is not an object/array).
    * @returns {Collection<T>} - The updated instance of Collection.
    */
   _set(key: PropertyPath | keyof T | Partial<T> | T, value?: any): this {
      if (_isObject(key) || _isArray(key)) {
         (this._state as T) = key as T;
      } else {
         _set(this._state as object, key as PropertyPath, value);
      }
      return this;
   }

   /**
    * Merges new attributes into the collection.
    * @param attributes - Attributes to merge into the collection.
    * @returns {Collection<T>} - The updated instance of Collection.
    */
   _merge(attributes: Partial<T>): this {
      _merge(this._state, attributes);

      return this;
   }

   /**
    * Returns a subset of the state with specified keys.
    * @param keys - Keys to include in the subset.
    * @returns {Partial<T>} - Object containing only the specified keys and their values.
    */
   _only(...keys: (keyof T)[]): Partial<T> {
      return _pick(this._state as T, keys);
   }

   /**
    * Readonly state of the collection.
    */
   get _data() {
      return this._state as Ref<T>['value'];
   }

   /**
    * Converts the state to a JSON string.
    * @returns {string} - String representation of the state in JSON format.
    */
   get _toJson(): string {
      return JSON.stringify(unref(this._data) || '');
   }
}
