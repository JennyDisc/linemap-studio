<script setup lang="ts">
import BaseButton from '@/components/ui/BaseButton.vue'
import { useUserStore } from '@/stores/useUserStore'

const userStore = useUserStore()

// 點擊登入紐後轉跳 LINE Login 的授權頁面
const handleLineLogin = () => {
  // 產生隨機字串防止 CSRF 攻擊(存入 sessionStorage 後續比對用)
  const state = Math.random().toString(36).substring(7)
  // 存入 sessionStorage 後續比對用
  sessionStorage.setItem('line_login_state', state)

  // LINE Login URL
  // 格式：https://access.line.me/oauth2/v2.1/authorize?
  // response_type=code：固定寫死，code 表示要拿授權碼
  // client_id：LINE Channel ID
  // redirect_uri：授權後要回到的網址
  // state：剛產生的隨機字串
  // scope：要跟 LINE 申請哪些權限。openid(必填)為拿 ID Token；profile是拿使用者的名字、照片。(註：%20表示空格。同時申請多個權限，必須用「空格」將它們隔開)
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: import.meta.env.VITE_LINE_CHANNEL_ID,
    redirect_uri: import.meta.env.VITE_LINE_REDIRECT_URI,
    state: state,
    scope: 'openid profile'
  })

  const lineUrl = `https://access.line.me/oauth2/v2.1/authorize?${params.toString()}`

  // 執行跳轉
  window.location.href = lineUrl
}
</script>

<template>
  <div class="border-gray2 overflow-hidden rounded-xl border shadow-md">
    <div
      class="flex h-32 w-full items-center justify-center bg-[url(/img/login-banner.svg)] bg-contain bg-center bg-repeat"
    >
      <img src="/img/login-banner-icon.svg" alt="banner icon" />
    </div>
    <div v-if="!userStore.authUserData" class="flex flex-col items-center p-8">
      <p class="mb-2 text-2xl font-bold">登入</p>
      <p class="text-gray3 mb-6">登入後開始建立您的選單地圖</p>
      <BaseButton class="mb-4" @click="handleLineLogin">
        <template #prepend>
          <img src="/img/chat.svg" alt="對話icon" />
        </template>
        使用 LINE 帳號登入
      </BaseButton>
      <p class="text-gray3 font-medium">點擊後跳轉至官方授權頁面</p>
    </div>

    <div v-else class="flex flex-col items-center p-8">
      <p class="mb-2 text-2xl font-bold">登入成功</p>
      <p class="text-gray3 mb-4">您已完成 LINE 帳號授權</p>
      <div class="mb-6 flex items-center justify-center">
        <div class="mr-4 h-16 w-16 overflow-hidden rounded-full">
          <img :src="userStore.authUserData.photo || '/img/user.svg'" alt="使用者大頭照" />
        </div>
        <p>Hi, {{ userStore.authUserData.name }}</p>
      </div>
      <BaseButton class="mb-4" @click="$emit('next')">
        <template #prepend>
          <img src="/img/chat.svg" alt="對話icon" />
        </template>
        繼續執行下一步
      </BaseButton>
    </div>
  </div>
</template>
