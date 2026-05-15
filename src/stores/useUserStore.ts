import type { FriendshipStatus, UserData, UserProfile } from '@/types/user'
import {
  getLocalStorage,
  removeLocalStorage,
  setLocalStorage,
  storageKeys
} from '@/utils/localStorage'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  // storageKeys=AuthUser
  const authUserData = ref<UserData | null>(getLocalStorage<UserData>(storageKeys.AuthUser))
  const setAuthUserData = (data: UserData) => {
    authUserData.value = data
    setLocalStorage(storageKeys.AuthUser, data, 10080)
  }
  const clearAuthUserData = () => {
    authUserData.value = null
    removeLocalStorage(storageKeys.AuthUser)
  }

  // storageKeys=UserProfile
  const userProfileData = ref<UserProfile | null>(
    getLocalStorage<UserProfile>(storageKeys.UserProfile)
  )
  const setUserProfileData = (data: UserProfile) => {
    userProfileData.value = data
    setLocalStorage(storageKeys.UserProfile, data, 10080)
  }
  const clearUserProfileData = () => {
    userProfileData.value = null
    removeLocalStorage(storageKeys.UserProfile)
  }

  // storageKeys=FriendStatus
  const friendStatusData = ref<FriendshipStatus | null>(
    getLocalStorage<FriendshipStatus>(storageKeys.FriendStatus)
  )
  const setFriendStatusData = (data: FriendshipStatus) => {
    friendStatusData.value = data
    setLocalStorage(storageKeys.FriendStatus, data, 10080)
  }
  const clearFriendStatusData = () => {
    friendStatusData.value = null
    removeLocalStorage(storageKeys.FriendStatus)
  }

  return {
    authUserData,
    setAuthUserData,
    clearAuthUserData,
    userProfileData,
    setUserProfileData,
    clearUserProfileData,
    friendStatusData,
    setFriendStatusData,
    clearFriendStatusData
  }
})
