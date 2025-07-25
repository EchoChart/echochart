import tailwindConfig from '@/../tailwind.config.js';
import Collection from '@/lib/Collection';
import router from '@/router';
import { $t, updatePreset, updateSurfacePalette } from '@primeuix/themes';
import aura from '@primeuix/themes/aura';
import lara from '@primeuix/themes/lara';
import material from '@primeuix/themes/material';
import nora from '@primeuix/themes/nora';
import { breakpointsTailwind } from '@vueuse/core';
import tailwindColors from 'tailwindcss/colors';

delete tailwindColors.lightBlue;
delete tailwindColors.warmGray;
delete tailwindColors.trueGray;
delete tailwindColors.coolGray;
delete tailwindColors.blueGray;

const colors = _merge(tailwindConfig.theme?.extend?.colors, tailwindColors);

const layoutState = Collection.create(
   _merge(
      {
         isDark: usePreferredDark(),
         preset: 'aura',
         primary: 'orange',
         surface: 'viva',
         sidebarMode: 'static',
         sidebarModeDesktop: 'static',
         sidebarActive: false,
         activeMenuItem: {},
         UIScale: 1
      },
      JSON.parse(localStorage.getItem('app-state'))
   )
);

const breakpoints = useBreakpoints(breakpointsTailwind);

const setPrimary = (value) => {
   layoutState.primary = value;
};

const setSurface = (value) => {
   layoutState.surface = value;
};

const setPreset = (value) => {
   layoutState.preset = value;
};

const setActiveMenuItem = (item) => {
   layoutState.activeMenuItem = item?.value || item;
};

const sidebarModeOptions = computed(() => [
   { label: i18n.t('app_config.sidebar.modes.static'), value: 'static' },
   { label: i18n.t('app_config.sidebar.modes.auto'), value: 'auto' },
   { label: i18n.t('app_config.sidebar.modes.mini'), value: 'mini' },
   { label: i18n.t('app_config.sidebar.modes.reveal'), value: 'reveal' },
   { label: i18n.t('app_config.sidebar.modes.overlay'), value: 'overlay' }
]);

const setSidebarMode = (mode) => {
   layoutState.sidebarModeDesktop = mode;
   if (mode === 'overlay') {
      layoutState.sidebarModeDesktop = null;
   }
   layoutState.sidebarMode = mode;
   layoutState.sidebarModeDesktop = mode;
};

const toggleDark = useToggle(
   useDark({
      selector: ':root',
      attribute: 'color-scheme',
      valueDark: 'dark',
      valueLight: 'light',
      storageKey: 'color-scheme',
      onChanged: (isDark, defaultHandler, mode) => {
         _set(layoutState, 'isDark', isDark);
         defaultHandler(mode);
      }
   })
);
const toggleDarkMode = (e, value = !layoutState.isDark) => {
   if (!document.startViewTransition) {
      toggleDark(value);

      return;
   }

   return document.startViewTransition(() => toggleDark(value));
};

const sidebarToggle = () => {
   layoutState.sidebarActive = !layoutState.sidebarActive;
};

const resetSidebar = () => {
   layoutState.sidebarActive = false;
};

const primaryColors = ref(
   _toPairs(_omit(colors, ['white', 'black', 'transparent', 'current', 'inherit'])).reduce(
      (acc, [name, palette]) => {
         acc.push({ name, palette: { 0: '#ffffff', ...palette } });
         return acc;
      },
      [{ name: 'noir', palette: {} }]
   )
);

const surfaces = ref(primaryColors.value.filter(({ name }) => name !== 'noir'));

const presets = {
   aura,
   lara,
   material,
   nora
};

const getPresetExt = () => {
   const color = primaryColors.value.find((c) => c.name === layoutState.primary);

   if (color.name === 'noir') {
      return {
         semantic: {
            primary: {
               50: '{surface.50}',
               100: '{surface.100}',
               200: '{surface.200}',
               300: '{surface.300}',
               400: '{surface.400}',
               500: '{surface.500}',
               600: '{surface.600}',
               700: '{surface.700}',
               800: '{surface.800}',
               900: '{surface.900}',
               950: '{surface.950}'
            },
            colorScheme: {
               light: {
                  primary: {
                     color: '{primary.950}',
                     contrastColor: '#ffffff',
                     hoverColor: '{primary.800}',
                     activeColor: '{primary.700}'
                  },
                  highlight: {
                     background: '{primary.950}',
                     focusBackground: '{primary.700}',
                     color: '#ffffff',
                     focusColor: '#ffffff'
                  }
               },
               dark: {
                  primary: {
                     color: '{primary.50}',
                     contrastColor: '{primary.950}',
                     hoverColor: '{primary.200}',
                     activeColor: '{primary.300}'
                  },
                  highlight: {
                     background: '{primary.50}',
                     focusBackground: '{primary.300}',
                     color: '{primary.950}',
                     focusColor: '{primary.950}'
                  }
               }
            }
         }
      };
   } else {
      return {
         semantic: {
            primary: color.palette,
            colorScheme: {
               light: {
                  primary: {
                     color: '{primary.500}',
                     contrastColor: '#ffffff',
                     hoverColor: '{primary.600}',
                     activeColor: '{primary.700}'
                  },
                  highlight: {
                     background: '{primary.50}',
                     focusBackground: '{primary.100}',
                     color: '{primary.700}',
                     focusColor: '{primary.800}'
                  }
               },
               dark: {
                  primary: {
                     color: '{primary.400}',
                     contrastColor: '{surface.900}',
                     hoverColor: '{primary.300}',
                     activeColor: '{primary.200}'
                  },
                  highlight: {
                     background: 'color-mix(in srgb, {primary.400}, transparent 84%)',
                     focusBackground: 'color-mix(in srgb, {primary.400}, transparent 76%)',
                     color: 'rgba(255,255,255,.87)',
                     focusColor: 'rgba(255,255,255,.87)'
                  }
               }
            }
         }
      };
   }
};

const updateColors = (type, color) => {
   if (type === 'primary') {
      setPrimary(color.name);
   } else if (type === 'surface') {
      setSurface(color.name);
   }

   applyTheme(type, color);
};

function applyTheme(type, color) {
   if (type === 'primary') {
      updatePreset(getPresetExt());
   } else if (type === 'surface') {
      updateSurfacePalette(color.palette);
   }
}
watch(
   () => layoutState._toJson,
   (newlayoutState) => {
      localStorage.setItem('app-state', newlayoutState);
   },
   { immediate: true }
);

nextTick(() => {
   watch(
      () => layoutState.UIScale,
      (newScale) => {
         if (newScale > 0) document.documentElement.style.setProperty('--ui-scale', newScale);
      },
      { immediate: true }
   );

   watch(
      () => layoutState.preset,
      () => {
         const presetValue = presets[layoutState.preset];
         const surfacePalette = surfaces.value.find((s) => s.name === layoutState.surface)?.palette;

         $t()
            .preset(presetValue)
            .preset(getPresetExt())
            .surfacePalette(surfacePalette)
            .use({ useDefaultOptions: true });
      },
      { immediate: true }
   );
});

export default () => {
   const isDarkTheme = computed(() => layoutState.isDark);

   const getPrimary = computed(() => layoutState.primary);

   const getPrimaryColor = computed(() => colors[layoutState.primary]);

   const getSurface = computed(() => layoutState.surface);

   const getSurfaceColor = computed(() => colors[layoutState.surface]);

   const {
      ability: { can }
   } = useAuthStore();

   const routes = computed(() => {
      function routesToNestedObject(routes) {
         const root = {};

         routes
            .sort((a, b) => a.path?.length - b.path?.length)
            .forEach((route) => {
               const cleanedPath = route.path.replace(/\/:[^/]+/g, '');
               const segments = cleanedPath?.split('/').filter(Boolean);

               let current = root;
               segments?.forEach((segment) => {
                  if (!current[segment]) {
                     current[segment] = { route, items: {} };
                  }
                  current = current[segment].items;
               });
            });

         function toNestedArray(obj, parentKey = '', isVisible = false, lastIndex = 0) {
            return _toPairs(obj)
               .map(([key, { items, route }], i) => {
                  const { meta, name } = route;
                  const currentKey = parentKey ? `${parentKey}_${i + 1}` : `${i}`;
                  const index = meta.index || ++lastIndex;
                  let visible = meta?.visible;

                  const children = toNestedArray(items, currentKey, visible || true, index).filter(
                     (c) => c.visible
                  );

                  visible ??= meta?.requiredPermissions?.every?.(({ action, subject }) =>
                     can?.(action, subject)
                  );

                  visible ??= children.length > 0 ? true : isVisible;
                  return {
                     key: currentKey,
                     name,
                     label: i18n.t(meta.label || key),
                     icon: meta.icon,
                     visible,
                     route: { ...route, replace: meta?.replace },
                     index,
                     ...(_size(children) > 0 && {
                        items: children
                     })
                  };
               })
               .sort((a, b) => a.index - b.index);
         }

         return toNestedArray(root);
      }

      const routes = router?.getRoutes();

      const nestedRoutes = routesToNestedObject(routes);

      return nestedRoutes;
   });

   const namedRoutes = computed(() => {
      function renameItemsToChildren(acc, value) {
         if (value.items) {
            value.children ??= {};
            value.items.forEach((item) => {
               _merge(value.children, renameItemsToChildren({}, item));
            });
            delete value.items;
         }
         acc[value.route?.name || value.label] = value;
         return acc;
      }
      return routes.value.reduce(renameItemsToChildren, {});
   });

   return {
      layoutState: layoutState,
      surfaces: readonly(surfaces),
      primaryColors: readonly(primaryColors),
      isDarkTheme: readonly(isDarkTheme),
      getPrimary: readonly(getPrimary),
      getSurface: readonly(getSurface),
      getPrimaryColor: readonly(getPrimaryColor),
      getSurfaceColor: readonly(getSurfaceColor),
      presets: readonly(presets),
      sidebarModeOptions: readonly(sidebarModeOptions),
      routes: readonly(routes),
      namedRoutes: readonly(namedRoutes),
      breakpoints: readonly(breakpoints),
      sidebarToggle,
      setActiveMenuItem,
      toggleDarkMode,
      setPrimary,
      setSurface,
      setSidebarMode,
      setPreset,
      resetSidebar,
      updateColors,
      getPresetExt
   };
};
