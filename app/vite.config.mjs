import { PrimeVueResolver } from '@primevue/auto-import-resolver';
import vue from '@vitejs/plugin-vue';
import lodash from 'lodash';
import * as path from 'node:path';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import packageVersion from 'vite-plugin-package-version';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
   build: {
      target: 'esnext',
      modulePreload: true
   },
   server: {
      port: 6161
   },
   plugins: [
      packageVersion(),
      vue(),
      Components({
         resolvers: [PrimeVueResolver()]
      }),
      AutoImport({
         vueTemplate: true,
         defaultExportByFilename: true,
         imports: [
            'vue',
            'vue-router',
            '@vueuse/core',
            'pinia',
            {
               from: '@primevue/core/api',
               imports: [
                  'FilterMatchMode',
                  'FilterOperator',
                  'FilterService',
                  'PrimeIcons',
                  'ToastSeverity'
               ]
            },
            {
               from: '@lib/supabase',
               imports: ['supabase', 'currentTenant']
            },
            {
               from: '@composables/useLayout',
               imports: [['default', 'useLayout']]
            },
            {
               from: '@store/index.js',
               imports: ['useAuthStore', 'useAccountStore']
            },
            {
               from: '@plugins/i18n',
               imports: ['locale', 'loadLocaleMessages', 'SUPPORT_LOCALES', ['default', 'i18n']]
            },
            {
               from: 'lodash',
               imports: lodash
                  .toPairs(lodash)
                  .filter(([, value]) => typeof value == 'function')
                  .map(([key]) => [key, '_' + key])
            }
         ],
         eslintrc: {
            enabled: true
         }
      })
   ],
   resolve: {
      alias: {
         '@': path.resolve(__dirname, 'src'),
         '@assets': path.resolve(__dirname, 'src/assets'),
         '@style': path.resolve(__dirname, 'src/assets/style'),
         '@plugins': path.resolve(__dirname, 'src/plugins'),
         '@components': path.resolve(__dirname, 'src/components'),
         '@store': path.resolve(__dirname, 'src/store'),
         '@lib': path.resolve(__dirname, 'src/lib'),
         '@services': path.resolve(__dirname, 'src/services'),
         '@composables': path.resolve(__dirname, 'src/composables'),
         '@types': path.resolve(__dirname, 'src/@types')
      }
   }
});
