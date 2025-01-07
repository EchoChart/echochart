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
   <div class="config-panel p-1 bg-surface-0 dark:bg-surface-900">
      <div class="flex flex-col gap-8 items-start justify-start">
         <div class="self-stretch justify-stretch flex gap-4">
            <div class="flex flex-col gap-3">
               <span class="text-sm text-muted-color font-semibold" v-text="$t('dark_mode')" />

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
            <div class="flex-1 flex flex-col gap-4">
               <span
                  class="text-sm text-muted-color font-semibold"
                  v-text="`${$t('ui_scale')}: ${layoutState.UIScale}`"
               />

               <Slider
                  class="my-auto"
                  v-model:modelValue="layoutState.UIScale"
                  :step="0.01"
                  :min="0.8"
                  :max="1.1"
                  :aria-label="$t('change_ui_scale')"
               />
            </div>
         </div>
         <div class="flex flex-col gap-3">
            <span class="text-sm text-muted-color font-semibold">Primary</span>
            <div class="flex gap-3 flex-wrap justify-center items-center">
               <Button
                  v-for="primaryColor of primaryColors"
                  :key="primaryColor.name"
                  :title="primaryColor.name"
                  class="w-5 h-5 !p-0 !rounded-full !border-0 outline-none outline-offset-1"
                  :class="
                     layoutState.primary === primaryColor.name
                        ? 'scale-150 m-1 !outline-primary-500/75'
                        : ''
                  "
                  :raised="layoutState.primary === primaryColor.name"
                  @click="updateColors('primary', primaryColor)"
                  :style="{
                     backgroundColor: `${primaryColor.name === 'noir' ? (isDarkTheme ? 'var(--text-color)' : 'var(--p-slate-900)') : primaryColor.palette['500']}`
                  }"
               />
            </div>
         </div>
         <div class="flex flex-col gap-3">
            <span class="text-sm text-muted-color font-semibold">Surface</span>
            <div class="flex gap-3 flex-wrap justify-center items-center">
               <Button
                  v-for="surface of surfaces"
                  :key="surface.name"
                  :title="surface.name"
                  class="w-5 h-5 !p-0 !rounded-full !border-0 outline-none outline-offset-1"
                  :class="layoutState.surface === surface.name ? `scale-150 m-1` : ''"
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
         <div class="flex flex-col gap-3">
            <span class="text-sm text-muted-color font-semibold" v-text="$t('presets')" />
            <SelectButton
               :modelValue="layoutState.preset"
               @change="({ value }) => setPreset(value)"
               :options="presetOptions"
               :allowEmpty="false"
               :aria-label="$t('select_preset')"
            />
         </div>
         <div v-if="isSignedIn" class="hidden sm:flex flex-col gap-3">
            <span class="text-sm text-muted-color font-semibold" v-text="$t('menu_mode')" />
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
