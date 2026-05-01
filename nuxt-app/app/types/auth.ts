export interface AuthToken {
  token: string
  expiration: string
}

export interface AuthUser {
  userID: number
  name: string
  email: string
  government: string | null
  userGroups: string[] | null
  isAuthenticated: boolean
  isOffline: boolean
  isEmailVerified?: boolean
  roles: string[]
}
