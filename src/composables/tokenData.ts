import { useUserStore } from '@/stores/useUserStore'
import { computed } from 'vue'

export function useTokenData() {
  const userStore = useUserStore()
  const tokenData = computed(() => {
    return userStore.authUserData?.token || ''
  })

  const removeToken = () => {
    userStore.clearAuthUserData()
  }

  return { tokenData, removeToken }
}
