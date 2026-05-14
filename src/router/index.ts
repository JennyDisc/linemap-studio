import type { Meta } from 'types/vue-router'
import { type RouteRecordRaw, createRouter, createWebHashHistory } from 'vue-router'
import { setupGuards } from './guards'

export const routes: Array<RouteRecordRaw & { meta: Meta }> = [
  {
    name: 'orderFlow',
    path: '/order/flow',
    component: () => import('@/views/imagemap/OrderFlowView.vue'),
    meta: {
      title: '選單地圖工具',
      needLogin: false,
      layout: 'DefaultLayout'
    }
  },
  {
    name: 'error',
    path: '/error',
    component: () => import('@/views/error/UniversalErrorView.vue'),
    meta: {
      title: '系統訊息',
      needLogin: false,
      layout: 'SimpleLayout'
    }
  },
  // 前面對應不到的路由全歸於此
  {
    path: '/:pathMatch(.*)*',
    name: 'notFound',
    component: () => import('@/views/error/ErrorView.vue'),
    meta: {
      title: '頁面不存在',
      needLogin: false,
      layout: 'SimpleLayout'
    }
  }
]

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  scrollBehavior: () => {
    return { left: 0, top: 0 }
  },
  routes
})

setupGuards(router)

export default router
