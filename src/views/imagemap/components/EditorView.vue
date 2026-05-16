<script setup lang="ts">
import { useRectManager } from '@/composables/useRectManager'
import EditorForm from '@/views/imagemap/components/editor/EditorForm.vue'
import EditorCanvas from '@/views/imagemap/components/editor/EditorCanvas.vue'
import { useUserStore } from '@/stores/useUserStore'

const userStore = useUserStore()
const rectStore = useRectManager()
</script>

<template>
  <div>
    <div v-if="userStore.authUserData" class="flex justify-between">
      <div class="w-1/3 rounded-md border p-2">
        <EditorForm :store="rectStore" />
      </div>
      <div class="w-2/3 p-2">
        <EditorCanvas :store="rectStore" />
      </div>
    </div>
    <div
      v-else
      class="border-gray2 flex flex-col items-center overflow-hidden rounded-xl border p-8 shadow-md"
    >
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
