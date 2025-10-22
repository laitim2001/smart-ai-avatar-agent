/**
 * User-related type definitions
 * Sprint 2: User Settings and Preferences
 */

export interface UserSettings {
  id: string
  userId: string
  defaultAvatarId: string | null
  defaultAvatarUrl: string | null
  emailNotifications: boolean
  pushNotifications: boolean
  theme: 'light' | 'dark' | 'system'
  language: 'zh-TW' | 'en-US'
  createdAt: Date
  updatedAt: Date
}

export interface ActivityLog {
  id: string
  userId: string
  action: string
  metadata: Record<string, unknown> | null
  ipAddress: string | null
  userAgent: string | null
  createdAt: Date
}

export interface UserPreferences {
  defaultAvatarId: string | null
  defaultAvatarUrl: string | null
}

export interface UpdateSettingsRequest {
  defaultAvatarId?: string
  defaultAvatarUrl?: string
  emailNotifications?: boolean
  pushNotifications?: boolean
  theme?: 'light' | 'dark' | 'system'
  language?: 'zh-TW' | 'en-US'
}

export interface UpdatePreferencesRequest {
  defaultAvatarId?: string
  defaultAvatarUrl?: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export interface ActivityLogResponse {
  activities: ActivityLog[]
  pagination: {
    total: number
    limit: number
    offset: number
    hasMore: boolean
  }
}
