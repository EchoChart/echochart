/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution');

module.exports = {
   root: true,
   env: {
      node: true
   },
   extends: [
      'plugin:vue/vue3-essential',
      'eslint:recommended',
      '@vue/eslint-config-prettier',
      '@vue/eslint-config-typescript',
      './.eslintrc-auto-import.json',
      'plugin:@typescript-eslint/recommended'
   ],
   plugins: ['@typescript-eslint'],
   parserOptions: {
      ecmaVersion: 'latest'
   },
   rules: {
      'no-unused-vars': 'warn',
      'prettier/prettier': [
         'warn',
         {
            endOfLine: 'auto'
         }
      ],
      'vue/multi-word-component-names': 'off',
      'vue/no-reserved-component-names': 'off',
      'vue/component-tags-order': [
         'error',
         {
            order: ['script', 'template', 'style']
         }
      ]
   }
};
