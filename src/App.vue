<script setup lang="ts">
import { defineAsyncComponent, computed, onMounted, onUnmounted } from 'vue'
import debounce from 'lodash/debounce'
import { useRoute, useRouter } from 'vue-router'
import { MIN_SUPPORTED_WIDTH } from '@/constants/breakpoints'

const route = useRoute()
const router = useRouter()
const DefaultLayout = defineAsyncComponent(() => import('@/layouts/DefaultLayout.vue'))
const SimpleLayout = defineAsyncComponent(() => import('@/layouts/SimpleLayout.vue'))

const layouts = {
  DefaultLayout,
  SimpleLayout
}

const currentLayout = computed(() => {
  const layoutName = route.meta.layout
  return layouts[layoutName] || DefaultLayout
})

// 防止使用者進入系統後改變裝置瀏覽視窗尺寸，全域對視窗設立監聽器
const handleDeviceCheck = () => {
  const isVertical = window.innerHeight > window.innerWidth
  const isBelowBreakpoint = window.innerWidth < MIN_SUPPORTED_WIDTH

  if ((isVertical || isBelowBreakpoint) && router.currentRoute.value.name !== 'error') {
    router.push({
      name: 'error',
      query: { code: 'device-not-supported' }
    })
  }
}

// 防抖版調用，延遲 0.2 秒
const debouncedCheck = debounce(handleDeviceCheck, 200)

onMounted(() => {
  // 立即執行，確保使用者進來時如果裝置不符，能立即排除
  handleDeviceCheck()

  // 監聽視窗縮放並使用防抖版本
  window.addEventListener('resize', debouncedCheck)
})

onUnmounted(() => {
  window.removeEventListener('resize', debouncedCheck)
  debouncedCheck.cancel()
})
</script>

<template>
  <Suspense>
    <template #default>
      <component :is="currentLayout">
        <RouterView />
      </component>
    </template>
  </Suspense>
</template>
