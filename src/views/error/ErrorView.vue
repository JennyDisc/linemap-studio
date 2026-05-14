<script setup lang="ts">
import BaseButton from '@/components/ui/BaseButton.vue'

const handleClick = () => {
  alert('返回登入步驟')
}
</script>

<template>
  <div class="flex flex-col items-center">
    <p class="text-gray1 mb-2 text-9xl font-bold">404</p>
    <p class="mb-4 text-4xl font-bold">Page Not Found</p>
    <p class="text-gray4 mb-8">The page you are looking for doesn't exist or has been moved.</p>
    <BaseButton @click="handleClick">
      <template #prepend>
        <img src="/img/return.svg" alt="登入icon" />
      </template>
      返回登入步驟
    </BaseButton>
  </div>
</template>
