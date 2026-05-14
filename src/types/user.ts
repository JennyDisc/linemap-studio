export interface UserData {
  token: string
  name: string
  photo: string
}

export interface UserProfile {
  _id: string
  displayName: string
  pictureUrl: string
  lineUserId: string
  createdAt: string
}

export interface FriendshipStatus {
  isFriend: boolean
}
