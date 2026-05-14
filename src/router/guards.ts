import { MIN_SUPPORTED_WIDTH } from '@/constants/breakpoints'
import type { Router } from 'vue-router'

export function setupGuards(router: Router) {
  // 處理權限與路由匹配
  router.beforeEach((to, _from, next) => {
    // 處理對應不到路由 URL 在路由表就中處理了，此處可省略不寫

    // 1.檢查使用者當前裝置
    // 判斷是否為手機裝置
    const isMobile = /Android|webOS|iPhone|iPod|IEMobile|Opera Mini/i.test(navigator.userAgent)
    // 判斷裝置是否以「直向」瀏覽
    const isVertical = window.innerHeight > window.innerWidth
    // 設立螢幕寬度斷點，避免 1024px 以下裝置瀏覽後台系統的不佳體驗
    const isBelowBreakpoint = window.innerWidth < MIN_SUPPORTED_WIDTH

    // 不允許手機或螢幕過小的裝置進入系統
    if ((isMobile || isVertical || isBelowBreakpoint) && to.name !== 'error') {
      return next({
        name: 'error',
        query: { code: 'device-not-supported' }
      })
    }

    // 2.處理登入權限
    const isLogin = false // 這裡應替換為你的 Auth Store 狀態
    if (to.meta.needLogin && !isLogin) {
      return next({ path: 'orderFlow' })
    }

    next()
  })

  // 頁面標題依據路由而變
  router.afterEach((to) => {
    const title = to.meta?.title as string | undefined
    document.title = title ? `${title} | LINEMap Studio` : 'LINEMap Studio'
  })
}
