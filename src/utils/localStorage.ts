import dayjs from 'dayjs'

export const storageKeys = {
  AuthUser: 'auth-user',
  UserProfile: 'user-profile',
  FriendStatus: 'friend-status',
  SystemParams: 'system-params'
} as const

// 取得 storageKeys 這個物件「所有值的型別組合」
type StorageKey = (typeof storageKeys)[keyof typeof storageKeys]
// 解析：
// 1.typeof storageKeys -> 取得物件結構 { readonly AuthUser: 'auth-user',... }
// 2.keyof typeof storageKeys -> 取得所有 Key，即 'AuthUser' | 'UserProfile' | 'FriendStatus'| 'SystemParams'
// 3.type StorageKey -> 'auth-user' | 'user-profile' | 'friend-status' | 'system-params'
// 3.後續用 [key] -> 取得該 Key 對應的值(如對應結果是 'auth-user')。調用時若輸入不存在的 Key，TS 會直接報錯

interface StorageData<T> {
  // 實際要存入的資料
  data: T
  // 過期時間的毫秒值，若為 null 則代表永不過期
  expiry: number | null
}

// 檢查當前時間是否超過設定的有效期限
function isExpired(expiry: number | null): boolean {
  // 沒有設定期限則永久有效
  if (!expiry) return false
  // 使用 dayjs 比較「現在時間」是否「晚於」設定的過期時間
  return dayjs().isAfter(dayjs(expiry))
}

// 取得資料
export function getLocalStorage<T>(key: StorageKey): T | null {
  const rawStorageData = localStorage.getItem(key)
  // 若沒這筆資料直接回傳 null
  if (!rawStorageData) return null

  try {
    const storageData: StorageData<T> = JSON.parse(rawStorageData)

    // 檢查時效
    if (isExpired(storageData.expiry)) {
      // 如果過期了，就從瀏覽器中刪除並回傳 null
      removeLocalStorage(key)
      return null
    }

    return storageData.data
  } catch (error) {
    // 預防資料格式非 JSON (例如手動竄改過) 導致解析失敗
    console.error(`LocalStorage parse error for key: ${key}`, error)
    return null
  }
}

// 存入資料
export function setLocalStorage<T>(
  key: StorageKey,
  data: T,
  lifeTimeMinutes: number | null = null
): void {
  const storageData: StorageData<T> = {
    data,
    expiry: lifeTimeMinutes ? dayjs().add(lifeTimeMinutes, 'minute').valueOf() : null
  }
  localStorage.setItem(key, JSON.stringify(storageData))
}

// 移除資料
export function removeLocalStorage(key: StorageKey): void {
  localStorage.removeItem(key)
}
