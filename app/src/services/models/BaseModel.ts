// BaseModel.ts
// Base class for all models, extending Collection and adding date formatting functionality

import Collection from '@/lib/Collection';
import { isValidDate, localeDateString } from '@/lib/dayjs';

/**
 * Base model class that extends Collection and adds automatic date formatting
 * @template T - Type of items in the collection
 */
export class BaseModel<T = any> extends Collection<T> {
   /**
    * Constructor that passes arguments to the parent Collection constructor
    * @param args - Arguments for the Collection constructor
    * @returns This instance for method chaining
    */
   constructor(...args: ConstructorParameters<typeof Collection<T>>) {
      super(...args);
      return this;
   }

   _dateProperties = new Map();

   /**
    * Factory method to create a new BaseModel instance with date formatting
    * @template T - Type of items in the collection
    * @param args - Arguments for the constructor
    * @returns Proxy-wrapped instance with automatic date formatting
    */
   static create<T = any>(...args: ConstructorParameters<typeof BaseModel<T>>) {
      // Create base instance and wrap in Proxy for date formatting
      const proxy = super.create<T>(...args) as BaseModel<T> & BaseModel<T>['_data'];

      // Return Proxy with custom getter for date formatting
      return new Proxy(proxy, {
         get(target, key) {
            const value = _get(target, key, undefined);

            if (!value) return value;

            if (_isString(value) && isValidDate({ value })) {
               if (target._dateProperties.get(key)) {
                  return localeDateString({ value: value, validate: false });
               }

               if (isValidDate({ value })) {
                  target._dateProperties.set(key, true);
                  return localeDateString({ value: value, validate: false });
               }
            }

            return value;
         }
      });
   }
}
