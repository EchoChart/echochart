module.exports = {
   vueFiles: './src/**/*.?(ts|js|vue)',
   languageFiles: './src/plugins/i18n/locales/**/*.?(json)',
   exclude: [],
   detect: ['missing', 'unused'],
   output: false,
   add: true,
   remove: true,
   ci: false,
   separator: '.',
   noEmptyTranslation: ''
};
