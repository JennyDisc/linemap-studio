export type ApiStatus = 'success' | 'error'

export interface ApiResponse<T = any> {
  status: ApiStatus
  data: T
  message?: string
}
