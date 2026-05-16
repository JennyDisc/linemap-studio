<script setup lang="ts">
import { ref, onMounted, inject } from 'vue'
import OrderStepper from '@/components/OrderStepper.vue'
import LoginView from '@/views/imagemap/components/LoginView.vue'
import FriendCheckView from '@/views/imagemap/components/FriendCheckView.vue'
import EditorView from '@/views/imagemap/components/EditorView.vue'
import { apiPostLogin } from '@/api/user.ts'
import type { ModalOptions } from '@/composables/useBaseModal'
import { useUserStore } from '@/stores/useUserStore'

const openModal = inject<(options: ModalOptions) => void>('openModal')!
const userStore = useUserStore()
const currentStep = ref('1')
const isLineLoading = ref(false)

const stepConfig = [
  { title: '登入', value: '1' },
  { title: '確認好友狀態', value: '2' },
  { title: '選單地圖編輯器', value: '3' }
]

// 登入成功後 LINE Login 會帶著 code 和 state 回到 redirect_uri 指定的網址
const handleLineCallback = async (code: string, returnedState: string) => {
  const savedState = sessionStorage.getItem('line_login_state')

  // 比對 state 是否一致，防止 CSRF 攻擊
  if (!savedState || returnedState !== savedState) {
    openModal({
      type: 'error',
      title: '驗證錯誤',
      content: '偵測到不安全的登入請求，請重新操作。',
      confirmText: '確認'
    })
    return
  }

  try {
    isLineLoading.value = true
    const { data } = await apiPostLogin({ code: code })

    if (data.token) {
      userStore.setAuthUserData(data)
      // state 比對正確後清除 sessionStorage 紀錄
      sessionStorage.removeItem('line_login_state')
      currentStep.value = '2'
    }
  } catch (error) {
    console.error('後端登入失敗', error)
  } finally {
    isLineLoading.value = false
  }
}

onMounted(async () => {
  // 沒有登入過，檢查網址上是否有 code 和 state 參數
  const url = new URL(window.location.href)
  let code = url.searchParams.get('code')
  let state = url.searchParams.get('state')

  // 網址上有 code，代表是 LINE 授權後跳轉回來的
  if (code && state) {
    isLineLoading.value = true

    // 清理 LINE 授權後跳轉回來後的網址參數(code 和 state)
    const cleanUrl = window.location.origin + window.location.pathname + window.location.hash
    window.history.replaceState({}, '', cleanUrl)

    // 網址乾淨後再執行登入邏輯
    await handleLineCallback(code, state)
  }
})
</script>

<template>
  <div>
    <div v-if="isLineLoading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <p class="loading-text">安全驗證中，請稍候...</p>
    </div>
    <OrderStepper :steps="stepConfig" v-model="currentStep">
      <template #content-1="{ activateCallback }">
        <LoginView @next="activateCallback('2')" />
      </template>

      <template #content-2="{ activateCallback }">
        <FriendCheckView @next="activateCallback('3')" @prev="activateCallback" />
      </template>

      <template #content-3="{ activateCallback }">
        <EditorView @prev="activateCallback" />
      </template>
    </OrderStepper>
  </div>
</template>

<style scoped>
/* 半透明蓋在原本的畫面上 */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

/* 簡單的轉圈圈動畫 */
.loading-spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #f3f3f3;
  border-top: 5px solid #06c755;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

.loading-text {
  color: #333;
  font-size: 16px;
  font-weight: bold;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
