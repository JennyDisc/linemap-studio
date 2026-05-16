import { useTokenData } from '@/composables/tokenData'
import router from '@/router'
import type { AxiosInstance, AxiosResponse } from 'axios'
import axios from 'axios'

const { tokenData, removeToken } = useTokenData()

const service: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  // 60秒沒回應就當呼叫失敗(Render 開機需要 30~50 秒不等)
  timeout: 60000
})

// 1.請求攔截器：發出 API 請求前，自動把 Token 放入 Header
service.interceptors.request.use(
  (config) => {
    if (tokenData.value) {
      config.headers['Authorization'] = `Bearer ${tokenData.value}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// 2.回應攔截器：收到後端資料後的初步過濾
service.interceptors.response.use(
  (response: AxiosResponse) => {
    // 後端回傳格式可能是 { status: 'success', data: ... }
    // 在這直接取出 data 部分
    const res = response.data

    // 假設後端回傳結果 status !== 'success' 歸類為業務邏輯錯誤就走這段
    if (res.status !== 'success') {
      return Promise.reject(new Error(res.message || 'Error'))
    }
    return res
  },
  (error) => {
    // 處理 HTTP 狀態碼錯誤(401, 404, 500...)
    const status = error.response?.status
    const message = error.response?.data?.message || '系統發生錯誤'

    if (status === 401) {
      // 登入失效，清除 Token 並返回登入頁
      removeToken()
      alert('登入已逾時，請重新登入')
      router.push({ name: 'orderFlow' })
    }

    // 封裝成統一格式丟回給呼叫 API 的地方
    return Promise.reject({
      message,
      status
    })
  }
)

export default service
