<script setup>
const {
   layoutState,
   surfaces,
   primaryColors,
   presets,
   sidebarModeOptions,
   isDarkTheme,
   setSidebarMode,
   setPreset,
   updateColors,
   toggleDarkMode
} = useLayout();

const presetOptions = ref(Object.keys(presets));
const { isSignedIn } = storeToRefs(useAuthStore());
</script>

<template>
   <div class="app-configurator__panel">
      <div class="app-configurator__content">
         <div class="app-configurator__row">
            <div class="app-configurator__column">
               <span class="app-configurator__label" v-text="$t('dark_mode')" />

               <ToggleButton
                  @change="toggleDarkMode"
                  :modelValue="isDarkTheme"
                  :onIcon="PrimeIcons.MOON"
                  :offIcon="PrimeIcons.SUN"
                  :onLabel="$t('dark')"
                  :offLabel="$t('light')"
                  :aria-label="$t('toggle_dark_mode')"
               />
            </div>
            <div class="app-configurator__column">
               <span
                  class="app-configurator__label"
                  v-text="`${$t('ui_scale')}: ${layoutState.UIScale}`"
               />

               <Slider
                  class="app-configurator__slider"
                  v-model:modelValue="layoutState.UIScale"
                  :step="0.05"
                  :min="0.75"
                  :max="1.1"
                  :aria-label="$t('change_ui_scale')"
               />
            </div>
         </div>
         <div class="app-configurator__section">
            <span class="app-configurator__label">Primary</span>
            <div class="app-configurator__color-buttons">
               <Button
                  v-for="primaryColor of primaryColors"
                  :key="primaryColor.name"
                  :title="primaryColor.name"
                  class="app-configurator__color-button"
                  :class="{
                     'app-configurator__color-button--active':
                        layoutState.primary === primaryColor.name
                  }"
                  :raised="layoutState.primary === primaryColor.name"
                  @click="updateColors('primary', primaryColor)"
                  :style="{
                     backgroundColor: `${primaryColor.name === 'noir' ? (isDarkTheme ? 'var(--text-color)' : 'var(--p-slate-900)') : primaryColor.palette['500']}`
                  }"
               />
            </div>
         </div>
         <div class="app-configurator__section">
            <span class="app-configurator__label">Surface</span>
            <div class="app-configurator__color-buttons">
               <Button
                  v-for="surface of surfaces"
                  :key="surface.name"
                  :title="surface.name"
                  class="app-configurator__color-button"
                  :class="{
                     'app-configurator__color-button--active': layoutState.surface === surface.name
                  }"
                  :raised="layoutState.surface === surface.name"
                  @click="updateColors('surface', surface)"
                  :style="{
                     outlineColor:
                        layoutState.surface === surface.name ? `var(--p-${surface.name}-500)` : '',
                     backgroundColor: `${surface.name === 'noir' ? (isDarkTheme ? 'var(--text-color)' : 'var(--p-slate-900)') : surface.palette['500']}`
                  }"
               />
            </div>
         </div>
         <div class="app-configurator__section">
            <span class="app-configurator__label" v-text="$t('presets')" />
            <SelectButton
               :modelValue="layoutState.preset"
               @change="({ value }) => setPreset(value)"
               :options="presetOptions"
               :allowEmpty="false"
               :aria-label="$t('select_preset')"
            />
         </div>
         <div v-if="isSignedIn" class="app-configurator__section">
            <span class="app-configurator__label" v-text="$t('menu_mode')" />
            <SelectButton
               :modelValue="layoutState.sidebarMode"
               @change="({ value }) => setSidebarMode(value)"
               :options="sidebarModeOptions"
               :allowEmpty="false"
               optionLabel="label"
               optionValue="value"
               :aria-label="$t('select_siderbar_mode')"
            />
         </div>
      </div>
   </div>
</template>

<style lang="scss">
.app-configurator {
   &__panel {
      @apply p-1 bg-surface-0 dark:bg-surface-900;
   }

   &__content {
      @apply flex flex-col gap-8 items-start justify-start;
   }

   &__row {
      @apply self-stretch justify-stretch flex gap-8;
   }

   &__column {
      @apply flex-1 flex flex-col gap-3;
   }

   &__label {
      @apply text-sm text-muted-color font-semibold;
   }

   &__slider {
      @apply my-auto;
   }

   &__section {
      @apply flex flex-col gap-3;
   }

   &__color-buttons {
      @apply flex gap-3 flex-wrap justify-center items-center;
   }

   &__color-button {
      @apply w-5 h-5 !p-0 !rounded-full !border-0 outline-none outline-offset-1;

      &--active {
         @apply scale-150 m-1 !outline-primary-500/75;
      }
   }
}
</style>
