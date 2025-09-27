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
   <div class="app-configurator">
      <FormBox :legend="$t('app_config.app_settings')">
         <div class="flex gap-[inherit]">
            <FormField
               fluid
               v-slot="slotProps"
               :label="$t('app_config.theme.dark_mode.toggle_dark_mode')"
            >
               <ToggleButton
                  v-bind="slotProps"
                  @change="toggleDarkMode"
                  :modelValue="isDarkTheme"
                  onIcon="pi pi-moon"
                  offIcon="pi pi-sun"
                  :onLabel="$t('app_config.theme.dark_mode.dark')"
                  :offLabel="$t('app_config.theme.dark_mode.light')"
                  :aria-label="$t('app_config.theme.dark_mode.toggle_dark_mode')"
               />
            </FormField>

            <FormField fluid :label="$t('app_config.language.select_language')">
               <template #badges>
                  <Badge
                     severity="info"
                     size="small"
                     class="!p-1"
                     v-tooltip.left="{
                        value: $t('app_config.language.translated_using_artificial_intelligence')
                     }"
                  >
                     <i :class="PrimeIcons.EXCLAMATION_CIRCLE" class="!text-sm" />
                  </Badge>
               </template>
               <template #default="slotProps">
                  <Select
                     v-bind="slotProps"
                     :modelValue="$i18n.locale"
                     :options="SUPPORTED_LOCALES"
                     option-label="label"
                     option-value="value"
                     @change="$router.replace({ params: { locale: $event.value } })"
                  >
                     <template #option="{ option }">
                        <div class="flex gap-2 items-center">
                           <span
                              class="flag !aspect-[44/30] !w-8 !h-[unset]"
                              :class="`flag-${option.value}`"
                           />
                           <span v-text="option.label" />
                        </div>
                     </template>
                     <template #value="{ value }">
                        <div class="flex gap-2 items-center">
                           <span
                              class="flag !aspect-[44/30] !w-8 !h-[unset]"
                              :class="`flag-${value}`"
                           />
                        </div>
                     </template>
                  </Select>
               </template>
            </FormField>
         </div>

         <FormField fluid v-slot="slotProps" :label="$t('app_config.theme.ui_scale')">
            <Slider
               v-bind="slotProps"
               class="!min-w-32"
               v-model:modelValue="layoutState.UIScale"
               :step="0.05"
               :min="0.75"
               :max="1.1"
               :aria-label="$t('app_config.theme.ui_scale')"
            />
         </FormField>

         <FormField fluid v-slot="slotProps" :label="$t('app_config.theme.primary_color')">
            <div class="app-configurator__color-buttons">
               <Button
                  v-bind="slotProps"
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
         </FormField>

         <FormField fluid v-slot="slotProps" :label="$t('app_config.theme.surface_color')">
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
         </FormField>

         <FormField fluid v-slot="slotProps" :label="$t('app_config.theme.preset.select_preset')">
            <SelectButton
               v-bind="slotProps"
               :modelValue="layoutState.preset"
               @change="({ value }) => setPreset(value)"
               :options="presetOptions"
               :allowEmpty="false"
               :aria-label="$t('app_config.theme.preset.select_preset')"
            />
         </FormField>

         <FormField
            fluid
            v-slot="slotProps"
            :label="$t('app_config.sidebar.select_sidebar_mode')"
            v-if="isSignedIn"
         >
            <Select
               v-bind="slotProps"
               :modelValue="layoutState.sidebarMode"
               @change="({ value }) => setSidebarMode(value)"
               :options="sidebarModeOptions"
               :allowEmpty="false"
               optionLabel="label"
               optionValue="value"
               :aria-label="$t('app_config.sidebar.select_sidebar_mode')"
            />
         </FormField>
      </FormBox>
   </div>
</template>

<style lang="scss">
.app-configurator {
   &__color-buttons {
      @apply flex gap-3 flex-wrap justify-center items-center;
   }

   &__color-button {
      @apply w-5 h-5 !p-0 !rounded-full !border-0 outline-none outline-offset-1 !important;

      &--active {
         @apply scale-150 m-1 !outline-primary-500/75;
      }
   }
}
</style>
