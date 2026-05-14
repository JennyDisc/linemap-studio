<script setup lang="ts">
import { ref } from 'vue'
import OrderStepper from '@/components/OrderStepper.vue'
import LoginView from '@/views/imagemap/components/LoginView.vue'
import FriendCheckView from '@/views/imagemap/components/FriendCheckView.vue'
import EditorView from '@/views/imagemap/components/EditorView.vue'

const currentStep = ref('1')

const stepConfig = [
  { title: '登入', value: '1' },
  { title: '確認好友狀態', value: '2' },
  { title: '選單地圖編輯器', value: '3' }
]
</script>

<template>
  <OrderStepper :steps="stepConfig" v-model="currentStep">
    <template #content-1="{ activateCallback }">
      <LoginView @next="activateCallback('2')" />
    </template>

    <template #content-2="{ activateCallback }">
      <FriendCheckView @next="activateCallback('3')" />
    </template>

    <template #content-3>
      <EditorView />
    </template>
  </OrderStepper>
</template>
