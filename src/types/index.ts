export interface FileMetadata {
  id: string
  name: string
  mimeType: string
  size: number
  url: string
  created_at: string
  modified_at: string
  account_email?: string
}

export interface UserProfile {
  id: string
  email: string
  created_at: string
}

export interface Note {
  id: string
  user_id: string
  title: string
  content: string
  type: "standalone" | "file-attachment"
  file_id?: string | null
  tags: string[]
  collection_id?: string | null
  mood?: string | null
  created_at: string
  updated_at: string
}

export interface Collection {
  id: string
  user_id: string
  name: string
  description: string
  mood: string
  color: string
  icon: string
  created_at: string
}

export interface Tag {
  id: string
  user_id: string
  name: string
  color: string
  created_at: string
}

export interface GoogleAccount {
  id: string
  account_email: string
  total_space: number
  used_space: number
  is_active: boolean
  created_at: string
}

export interface StorageQuota {
  account_id: string
  account_email: string
  total: number
  used: number
  free: number
  freePercent: number
  is_active: boolean
}

export interface StoragePool {
  accounts: StorageQuota[]
  total: number
  used: number
  free: number
  usedPercent: number
}

export interface DriveNavItem {
  id: string
  name: string
  mimeType: string
  size: number
  created_at: string
  modified_at: string
  isFolder: boolean
  account_email?: string
}

export const MOODS = [
  { id: "calm", label: "Calm", color: "#a78bfa" },
  { id: "focus", label: "Focus", color: "#34d399" },
  { id: "late-night", label: "Late Night", color: "#818cf8" },
  { id: "inspiration", label: "Inspiration", color: "#fbbf24" },
  { id: "archive", label: "Archive", color: "#f87171" },
  { id: "work", label: "Work", color: "#60a5fa" },
] as const

export const COLLECTION_ICONS = [
  "folder", "heart", "star", "book", "music", "image",
  "video", "code", "pen", "archive",
] as const
