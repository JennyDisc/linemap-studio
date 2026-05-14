<script setup lang="ts">
import BaseButton from '@/components/ui/BaseButton.vue'
</script>

<template>
  <div class="border-gray2 overflow-hidden rounded-xl border shadow-md">
    <div class="flex flex-col items-center p-8">
      <p class="mb-2 text-2xl font-bold">加入系統官方帳號</p>
      <p class="text-gray3 mb-6">請掃描下方 QR Code 加入好友，即可開啟選單地圖的推送服務</p>
      <img src="https://qr-official.line.me/gs/M_467hxgqh_GW.png?oat_content=qr" class="mb-2" />
      <BaseButton>
        我已加入好友，進入編輯器
        <template #append>
          <img src="/img/arrow.svg" alt="箭頭icon" />
        </template>
      </BaseButton>
    </div>
  </div>
</template>
