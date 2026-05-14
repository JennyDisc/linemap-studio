// 告知搜尋引擎 Components 特定 PrimeVue 元件的存放路徑
import { PrimeVueResolver } from '@primevue/auto-import-resolver'
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
// 掃描程式碼中沒看過的元件標籤並自動引入對應的 PrimeVue 元件
import Components from 'unplugin-vue-components/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  base: process.env.VITE_APP_ENV === 'production' ? '/linemap-studio/' : '/',
  // 擴充功能
  plugins: [
    vue(),
    tailwindcss(),
    // 自動化工具
    Components({
      // 指引
      resolvers: [
        // PrimeVue 的元件解析器，會自動找出程式碼中使用的 PrimeVue 元件並引入
        PrimeVueResolver()
      ]
    })
  ],
  // 解析路徑
  resolve: {
    // 別名
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      types: fileURLToPath(new URL('./types', import.meta.url))
    }
  }
})
