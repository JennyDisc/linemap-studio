import type { ApiResponse } from '@/types/api'
import type { FriendshipStatus, UserData, UserProfile } from '@/types/user'
import request from '@/utils/request'

export const ApiEndpoints = {
  User: 'users'
} as const

export function apiPostLogin(data: any): Promise<ApiResponse<UserData>> {
  return request({
    url: `${ApiEndpoints.User}/login/line`,
    method: 'post',
    data
  })
}

export function apiGetUserProfile(): Promise<ApiResponse<UserProfile>> {
  return request({
    url: `${ApiEndpoints.User}/getUser`,
    method: 'get'
  })
}

export function apiGetCheckFriendship(): Promise<ApiResponse<FriendshipStatus>> {
  return request({
    url: `${ApiEndpoints.User}/check-friendship`,
    method: 'get'
  })
}
