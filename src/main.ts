import App from '@/App.vue'
import '@/assets/css/style.css'
import router from '@/router/index.ts'
// 自訂 veeValidate 驗證規則
import '@/utils/veeValidateSchema.ts'
// primevue 樣式
import Aura from '@primeuix/themes/aura'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import { createApp } from 'vue'
import VueDraggableResizable from 'vue-draggable-resizable'
import 'vue-draggable-resizable/style.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(PrimeVue, {
  theme: {
    preset: Aura
  }
})
app.component('VueDraggableResizable', VueDraggableResizable)
// 初始化 Vue App
app.mount('#app')
