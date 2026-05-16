<script setup lang="ts">
import { useUserStore } from '@/stores/useUserStore'
import { useRouter } from 'vue-router'

const userStore = useUserStore()
const router = useRouter()

const handleLineLogout = () => {
  // 清空所有 LocalStorage
  localStorage.clear()

  // 清空 sessionStorage(防止殘留當初登入時的 LINE 狀態)
  sessionStorage.clear()

  // 強制將使用者導向首頁，並讓畫面重置
  router.push({ name: 'orderFlow' }).then(() => {
    // 用 window.location.reload() 強制重新整理網頁清除所有記憶體中的暫存、Pinia 狀態
    window.location.reload()
  })
}
</script>

<template>
  <div class="flex items-center justify-between bg-white px-6 py-4">
    <div class="flex">
      <img src="/img/menuicon.svg" alt="選單icon" class="pr-2" />
      <p class="text-lg font-bold">LINEMap Studio</p>
    </div>
    <div v-if="!userStore.authUserData" class="flex items-center gap-1">
      <img src="/img/warning-icon.svg" alt="警告icon" class="h-8 w-8" />
      <p class="font-semibold">尚未登入驗證</p>
    </div>

    <div v-else class="flex items-center gap-1">
      <p class="mr-2 font-semibold">{{ userStore.authUserData.name }}</p>
      <div class="mr-4 h-10 w-10 overflow-hidden rounded-full">
        <img :src="userStore.authUserData.photo || '/img/user.svg'" alt="使用者大頭照" />
      </div>
      <button
        type="button"
        class="btn-base bg-purple4 hover:bg-purple2 px-2 py-1 text-white"
        @click="handleLineLogout"
      >
        登出
      </button>
    </div>
  </div>
</template>
