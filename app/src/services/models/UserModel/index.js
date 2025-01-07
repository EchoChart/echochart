import { BaseModel } from '@services/models/BaseModel';

/**
 * @typedef {UserRow} ModelType
 * @extends {BaseModel<ModelType>}
 */
export class UserModel extends BaseModel {
   avatar_url = computed({
      get: () => {
         const { getPrimaryColor, isDarkTheme, getSurfaceColor } = useLayout();
         if (this._state.avatar_url) {
            return this._state.avatar_url;
         }
         const bg = getPrimaryColor.value?.['500'].slice(1, 7);
         const color = getSurfaceColor.value?.[isDarkTheme.value ? '700' : '200'].slice(1, 7);
         const name = this.display_name || this.email || '♥';

         return `https://ui-avatars.com/api/?name=${name}&background=${bg}&color=${color}`;
      },
      set: (value) => _set(this._state, 'avatar_url', value)
   });
}
