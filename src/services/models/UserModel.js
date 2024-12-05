import BaseModel from '@services/models/BaseModel';

export class UserModel extends BaseModel {
    avatar_url = computed(() => {
        const { getPrimaryColor, isDarkTheme, getSurfaceColor } = useLayout();
        if (this._state.avatar_url) {
            return this._state.avatar_url;
        }
        const bg = getPrimaryColor.value?.['500'].slice(1, 7);
        const color = getSurfaceColor.value?.[isDarkTheme.value ? '700' : '200'].slice(1, 7);
        const name = this._state.display_name ?? this._state.email;

        return `https://ui-avatars.com/api/?name=${name}&background=${bg}&color=${color}`;
    });
}
