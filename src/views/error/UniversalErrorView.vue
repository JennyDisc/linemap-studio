<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import BaseButton from '@/components/ui/BaseButton.vue'

const route = useRoute()

const errorMap: Record<string, { title: string; content: string; type: string }> = {
  'device-not-supported': {
    title: '不支援行動裝置或平板使用直向瀏覽',
    content: '本系統為後台管理工具，請使用電腦或將平板轉為橫向操作。',
    type: 'device'
  },
  default: {
    title: '系統發生異常',
    content: '很抱歉，目前系統處理您的請求時發生錯誤，請稍後再試。',
    type: 'default'
  }
}

const errorInfo = computed(() => {
  const code = route.query.code as string
  return errorMap[code] || errorMap.default
})

const handleBackToLogin = () => {
  window.location.href = window.location.origin + '/#/order/flow'
}
</script>

<template>
  <div class="flex flex-col items-center">
    <p class="mb-4 text-4xl font-bold">{{ errorInfo.title }}</p>
    <p class="text-gray4 mb-8">{{ errorInfo.content }}</p>
    <BaseButton @click="handleBackToLogin">
      <template #prepend>
        <img src="/img/return.svg" alt="登入icon" />
      </template>
      返回登入步驟
    </BaseButton>
  </div>
</template>
