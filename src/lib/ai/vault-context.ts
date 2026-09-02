import { getCollections, getNotes, getTags } from "@/lib/supabase/models"
import { getActiveGoogleAccounts } from "@/lib/supabase/models"
import { getDriveConnection } from "@/lib/google-drive/client"

const MAX_NOTES = 40
const MAX_NOTE_CONTENT = 4_000
const MAX_FILES_PER_ACCOUNT = 2_000
const MAX_CONTEXT_CHARS = 80_000
const DRIVE_CONTEXT_TIMEOUT_MS = 8_000

interface DriveContextFile {
  id: string
  name: string
  mimeType: string
  size: number
  modified_at: string
  account_email: string
  parent_ids: string[]
}

async function listDriveFiles(userId: string): Promise<{
  files: DriveContextFile[]
  errors: string[]
}> {
  const accounts = await getActiveGoogleAccounts(userId)
  const results = await Promise.all(accounts.map(async (account) => {
    try {
      const connection = await getDriveConnection(userId, account.id)
      const files: DriveContextFile[] = []
      const folders = ["root"]

      while (folders.length > 0 && files.length < MAX_FILES_PER_ACCOUNT) {
        const folderId = folders.shift()
        if (!folderId) break
        const children = await connection.listFiles(folderId)

        for (const file of children) {
          if (file.mimeType === "application/vnd.google-apps.folder") {
            folders.push(file.id)
          }
          files.push({
            id: file.id,
            name: file.name,
            mimeType: file.mimeType,
            size: Number(file.size ?? 0),
            modified_at: file.modifiedTime,
            account_email: account.account_email,
            parent_ids: file.parents ?? [],
          })
          if (files.length >= MAX_FILES_PER_ACCOUNT) break
        }
      }

      return { files, error: "" }
    } catch {
      return { files: [], error: account.account_email }
    }
  }))

  return {
    files: results.flatMap((result) => result.files),
    errors: results.filter((result) => result.error).map((result) => result.error),
  }
}

export async function buildVaultContext(userId: string): Promise<string> {
  const drivePromise = listDriveFiles(userId)
  const driveTimeout = new Promise<{ files: DriveContextFile[]; errors: string[] }>((resolve) => {
    setTimeout(() => resolve({ files: [], errors: ["Drive inventory timed out"] }), DRIVE_CONTEXT_TIMEOUT_MS)
  })

  const [notes, collections, tags, drive] = await Promise.all([
    getNotes(userId),
    getCollections(userId),
    getTags(userId),
    Promise.race([drivePromise, driveTimeout]),
  ])

  const noteContext = notes.slice(0, MAX_NOTES).map((note) => ({
    id: note.id,
    title: note.title,
    content: note.content.slice(0, MAX_NOTE_CONTENT),
    tags: note.tags,
    collection_id: note.collection_id,
    mood: note.mood,
    updated_at: note.updated_at,
  }))

  const context = JSON.stringify({
    notes: noteContext,
    collections: collections.map(({ id, name, description, mood }) => ({
      id,
      name,
      description,
      mood,
    })),
    tags: tags.map(({ id, name, color }) => ({ id, name, color })),
    drive_files: drive.files,
    drive_errors: drive.errors,
  })

  return context.slice(0, MAX_CONTEXT_CHARS)
}