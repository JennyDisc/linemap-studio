import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import pluginVue from 'eslint-plugin-vue'
import { defineConfig } from 'eslint/config'
import skipPrettier from 'eslint-config-prettier'

export default defineConfig([
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts,vue}'],
    plugins: { js },
    extends: ['js/recommended'],
    languageOptions: { globals: globals.browser }
  },
  tseslint.configs.recommended,
  pluginVue.configs['flat/strongly-recommended'],
  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
        extraFileExtensions: ['.vue']
      }
    }
  },
  // 自定義規則
  {
    rules: {
      'vue/multi-word-component-names': 'off', // 允許單一單字的元件名 (如 App.vue)
      '@typescript-eslint/no-explicit-any': 'warn', // 允許暫時用 any，但給警告
      'no-unused-vars': 'warn' // 變數沒用到的時候給警告而不是直接噴紅字
    }
  },
  // 停用與 Prettier 衝突的規則
  skipPrettier
])
