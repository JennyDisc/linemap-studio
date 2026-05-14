import { useLocalStorage } from '@vueuse/core'

export function useTokenData() {
  // 利用套件 VueUse 的 useLocalStorage 讓 Vue 的變數與瀏覽器的 LocalStorage 能同步
  // 'auth_token' 儲存在 LocalStorage 中的 Key 名
  // 當 tokenData.value 改變時，瀏覽器的 LocalStorage 會自動更新
  const tokenData = useLocalStorage<string>('auth_token', '')

  // 從後端 API 取得的 access_token 字串並儲存到 tokenData
  const setToken = (newToken: string) => {
    tokenData.value = newToken
  }

  // 移除 Token
  const removeToken = () => {
    tokenData.value = ''
  }

  return { tokenData, setToken, removeToken }
}
