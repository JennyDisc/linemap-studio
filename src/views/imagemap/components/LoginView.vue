<script setup lang="ts">
import BaseButton from '@/components/ui/BaseButton.vue'
</script>

<template>
  <div class="border-gray2 overflow-hidden rounded-xl border shadow-md">
    <div
      class="flex h-32 w-full items-center justify-center bg-[url(/img/login-banner.svg)] bg-contain bg-center bg-repeat"
    >
      <img src="/img/login-banner-icon.svg" alt="banner icon" />
    </div>
    <div class="flex flex-col items-center p-8">
      <p class="mb-2 text-2xl font-bold">登入</p>
      <p class="text-gray3 mb-6">登入後開始建立您的選單地圖</p>
      <BaseButton class="mb-4">
        <template #prepend>
          <img src="/img/chat.svg" alt="對話icon" />
        </template>
        使用 LINE 帳號登入
      </BaseButton>
      <p class="text-gray3 font-medium">點擊後跳轉至官方授權頁面</p>
    </div>
  </div>
</template>
