<script setup lang="ts">
import { computed } from 'vue'
import { modalState, closeModal } from '@/composables/useBaseModal'

const hasButtons = computed(() => !!(modalState.cancelText || modalState.confirmText))

const handleConfirm = () => {
  if (modalState.onConfirm) {
    modalState.onConfirm()
  }
  closeModal()
}

const handleClose = () => {
  closeModal()
}
</script>

<template>
  <!-- 背景遮罩 -->
  <div
    v-if="modalState.isOpen"
    class="fixed inset-0 z-[999] flex items-center justify-center bg-black/50"
    @click="handleClose"
  >
    <!-- 彈窗主體 -->
    <div
      class="modal-box min-w-[280px] rounded-xl border bg-white p-5 shadow-2xl sm:min-w-[400px]"
      @click.stop
    >
      <div class="flex justify-end">
        <img
          src="/img/x-mark-icon.svg"
          alt="關閉icon"
          class="h-5 w-5 cursor-pointer"
          @click="handleClose"
        />
      </div>

      <!-- 圖標 -->
      <div v-if="modalState.type || $slots.alertType" class="icon-wrapper">
        <div class="flex justify-center">
          <img :src="`/img/${modalState.type}-icon.svg`" :alt="modalState.type" class="h-12 w-12" />
        </div>

        <slot name="alertType" />
      </div>
      <!-- 標題 -->
      <p v-if="modalState.title" class="mt-4 text-center text-xl font-bold">
        {{ modalState.title }}
      </p>
      <!-- 內容 -->
      <p v-if="modalState.content" class="text-center" :class="[hasButtons ? 'mt-4' : 'mb-4']">
        {{ modalState.content }}
      </p>
      <!-- 按鈕 -->
      <div v-if="hasButtons" class="mt-9 flex justify-center gap-5">
        <button
          v-if="modalState.cancelText"
          type="button"
          class="bg-gray3 btn-base px-4 py-2 font-semibold text-white"
          @click="handleClose"
        >
          {{ modalState.cancelText }}
        </button>
        <button
          v-if="modalState.confirmText"
          type="button"
          class="btn-base bg-[#06F906] px-4 py-2 font-semibold"
          @click="handleConfirm"
        >
          {{ modalState.confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-box {
  animation: modalDown 1s forwards;
}

@keyframes modalDown {
  0% {
    opacity: 0;
    transform: translateY(-100%);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
