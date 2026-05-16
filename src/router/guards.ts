import { MIN_SUPPORTED_WIDTH } from '@/constants/breakpoints'
import { useUserStore } from '@/stores/useUserStore'
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

    // 2.判斷路由頁面是否需要登入權限
    const userStore = useUserStore()
    // 檢查使用者目前有沒有 Token，判斷「使用者現在是否有登入?」
    const isLogin = !!userStore.authUserData?.token
    // 檢查網址參數裡有沒有 code 或 state，判斷「這是不是 LINE 登入成功後，跳轉回來的那個瞬間?」
    const isLineCallback = !!to.query.code || !!to.query.state

    if (to.meta.needLogin && !isLogin && !isLineCallback) {
      // 如果路由頁面需要登入、使用者還沒登入、不是 LINE 回傳過來，就返回到登入頁
      return next({ name: 'orderFlow' })
    }
    // 如果路由頁面需要登入、使用者正在登入且是 LINE 回傳過來的狀態，就繼續當前作業流程，不重新定向

    next()
  })

  // 頁面標題依據路由而變
  router.afterEach((to) => {
    const title = to.meta?.title as string | undefined
    document.title = title ? `${title} | LINEMap Studio` : 'LINEMap Studio'
  })
}
