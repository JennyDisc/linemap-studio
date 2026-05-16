<script setup lang="ts">
import { useUserStore } from '@/stores/useUserStore'
import BaseButton from '@/components/ui/BaseButton.vue'

const userStore = useUserStore()
</script>

<template>
  <div class="border-gray2 overflow-hidden rounded-xl border shadow-md">
    <div v-if="userStore.authUserData" class="flex flex-col items-center p-8">
      <p class="mb-2 text-2xl font-bold">加入系統官方帳號</p>
      <p class="text-gray3 mb-6">請掃描下方 QR Code 加入好友，即可開啟選單地圖的推送服務</p>
      <img src="https://qr-official.line.me/gs/M_467hxgqh_GW.png?oat_content=qr" class="mb-2" />
      <BaseButton @click="$emit('next')">
        我已加入好友，進入編輯器
        <template #append>
          <img src="/img/arrow.svg" alt="箭頭icon" />
        </template>
      </BaseButton>
    </div>
    <div v-else class="flex flex-col items-center p-8">
      <p class="mb-2 text-2xl font-bold">請先完成登入驗證</p>
      <p class="text-gray3 mb-6">偵測到您尚未登入，請前往登入步驟完成作業</p>
      <BaseButton @click="$emit('prev', '1')">
        前往登入步驟
        <template #prepend>
          <img src="/img/return.svg" alt="登入icon" />
        </template>
      </BaseButton>
    </div>
  </div>
</template>
