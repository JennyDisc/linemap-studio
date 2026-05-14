declare module 'vue-draggable-resizable' {
  import { DefineComponent } from 'vue'
  // 使用 Record<string, unknown> 代替 {}，代表這是一個物件類型
  const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, any>
  export default component
}
