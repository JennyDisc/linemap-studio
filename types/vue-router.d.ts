import 'vue-router'

export type Meta = {
  title: string
  needLogin: boolean
  layout: 'DefaultLayout' | 'SimpleLayout'
}

declare module 'vue-router' {
  interface RouteMeta {
    title: string
    needLogin: boolean
    layout: 'DefaultLayout' | 'SimpleLayout'
  }
}
