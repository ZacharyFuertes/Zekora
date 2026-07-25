export interface FileMetadata {
  id: string
  name: string
  size: number
  type: string
  url: string
  storage_path: string
  user_id: string
  created_at: string
}

export interface UserProfile {
  id: string
  email: string
  created_at: string
}

export interface Note {
  _id: string
  user_id: string
  title: string
  content: string
  type: "standalone" | "file-attachment"
  file_id?: string
  tags: string[]
  collection_id?: string
  mood?: string
  created_at: string
  updated_at: string
}

export interface Collection {
  _id: string
  user_id: string
  name: string
  description: string
  mood: string
  color: string
  icon: string
  created_at: string
}

export interface Tag {
  _id: string
  user_id: string
  name: string
  color: string
  created_at: string
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
