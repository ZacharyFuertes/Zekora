import { getGoogleAccountDocumentById, updateToken, getGoogleAccountByGoogleId } from "@/lib/supabase/models"
import { decryptToken } from "@/lib/encryption"
import { GOOGLE_OAUTH_CONFIG } from "@/lib/google-oauth"

const DRIVE_BASE = "https://www.googleapis.com/drive/v3"

export interface DriveFile {
  id: string
  name: string
  mimeType: string
  size: number
  createdTime: string
  modifiedTime: string
  parents?: string[]
}

export interface UploadResult {
  file: DriveFile
  accessToken: string
}

async function refreshAccessToken(refreshToken: string) {
  const res = await fetch(GOOGLE_OAUTH_CONFIG.tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: GOOGLE_OAUTH_CONFIG.clientId,
      client_secret: GOOGLE_OAUTH_CONFIG.clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  })
  const data = await res.json()
  if (!res.ok || !data.access_token) {
    throw new Error(data.error_description ?? data.error ?? "Token refresh failed")
  }
  return {
    access_token: data.access_token as string,
    expires_in: (data.expires_in ?? 3600) as number,
  }
}

async function ensureValidToken(userId: string, accountId: string): Promise<string> {
  const doc = await getGoogleAccountDocumentById(userId, accountId)
  if (!doc) throw new Error("Google account not found")

  const now = Date.now()
  const expiry = new Date(doc.token_expiry).getTime()

  if (expiry > now + 60_000) {
    return doc.access_token
  }

  const refreshToken = decryptToken(doc.encrypted_refresh_token)
  const fresh = await refreshAccessToken(refreshToken)
  const newExpiry = new Date(Date.now() + fresh.expires_in * 1000)
  await updateToken(accountId, fresh.access_token, newExpiry)
  return fresh.access_token
}

export interface DriveConnection {
  accountId: string
  getAccessToken: () => Promise<string>
  about: () => Promise<{ limit: number; usage: number }>
  listFiles: (parentId: string) => Promise<DriveFile[]>
  getFile: (fileId: string) => Promise<DriveFile>
  search: (query: string) => Promise<DriveFile[]>
  upload: (name: string, mimeType: string, body: Buffer, parentId?: string) => Promise<UploadResult>
  createFolder: (name: string, parentId?: string) => Promise<DriveFile>
  rename: (fileId: string, name: string) => Promise<DriveFile>
  delete: (fileId: string) => Promise<void>
  move: (fileId: string, folderId: string) => Promise<DriveFile>
  downloadUrl: (fileId: string) => Promise<string>
  streamUrl: (fileId: string) => Promise<{ href: string; headers: Record<string, string> }>
}

export async function getDriveConnection(
  userId: string,
  accountId: string
): Promise<DriveConnection> {
  let token = await ensureValidToken(userId, accountId)

  async function authorizedToken(): Promise<string> {
    const refreshed = await ensureValidToken(userId, accountId)
    token = refreshed
    return token
  }

  function driveHeaders() {
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    }
  }

  async function driveFetch(path: string, init?: RequestInit) {
    let res = await fetch(`${DRIVE_BASE}${path}`, init)
    if (res.status === 401) {
      token = await authorizedToken()
      res = await fetch(`${DRIVE_BASE}${path}`, {
        ...init,
        headers: { ...(init?.headers ?? {}), Authorization: `Bearer ${token}` },
      })
    }
    if (!res.ok) {
      const body = await res.text()
      throw new Error(`Drive API error (${res.status}): ${body}`)
    }
    return res
  }

  return {
    accountId,
    getAccessToken: authorizedToken,
    async about() {
      const res = await driveFetch("/about?fields=storageQuota")
      const data = await res.json()
      const quota = data.storageQuota ?? {}
      return {
        limit: Number(quota.limit ?? 15 * 1024 * 1024 * 1024),
        usage: Number(quota.usage ?? 0),
      }
    },
    async listFiles(parentId) {
      const q = parentId && parentId !== "root"
        ? `'${parentId}' in parents and trashed=false and 'me' in owners`
        : `'root' in parents and trashed=false`
      const res = await driveFetch(
        `/files?q=${encodeURIComponent(q)}&pageSize=1000&fields=files(id,name,mimeType,size,createdTime,modifiedTime,parents)&orderBy=folder,name`
      )
      const data = await res.json()
      return (data.files ?? []) as DriveFile[]
    },
    async getFile(fileId) {
      const res = await driveFetch(
        `/files/${fileId}?fields=id,name,mimeType,size,createdTime,modifiedTime,parents`
      )
      return res.json() as Promise<DriveFile>
    },
    async search(query) {
      const q = `name contains '${query.replace(/'/g, "\\'")}' and trashed=false`
      const res = await driveFetch(
        `/files?q=${encodeURIComponent(q)}&pageSize=200&fields=files(id,name,mimeType,size,createdTime,modifiedTime,parents)`
      )
      const data = await res.json()
      return (data.files ?? []) as DriveFile[]
    },
    async upload(name, mimeType, body, parentId) {
      const metadata: Record<string, unknown> = { name, mimeType: mimeType || "application/octet-stream" }
      if (parentId) metadata.parents = [parentId]

      const boundary = `ZaekoraBoundary${Date.now()}`
      const parts: Buffer[] = []
      parts.push(Buffer.from(
        `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n` +
        `${JSON.stringify(metadata)}\r\n`
      ))
      parts.push(Buffer.from(
        `--${boundary}\r\nContent-Type: ${mimeType || "application/octet-stream"}\r\n` +
        `Content-Transfer-Encoding: binary\r\n\r\n`
      ))
      parts.push(body)
      parts.push(Buffer.from(`\r\n--${boundary}--`))

      const res = await driveFetch(
        `/files?uploadType=multipart&fields=id,name,mimeType,size,createdTime,modifiedTime,parents`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": `multipart/related; boundary=${boundary}`,
          },
          body: Buffer.concat(parts),
        }
      )
      const file = await res.json()
      return { file: file as DriveFile, accessToken: token }
    },
    async createFolder(name, parentId) {
      const metadata: Record<string, unknown> = {
        name,
        mimeType: "application/vnd.google-apps.folder",
      }
      if (parentId) metadata.parents = [parentId]
      const res = await driveFetch(
        `/files?fields=id,name,mimeType,size,createdTime,modifiedTime,parents`,
        {
          method: "POST",
          headers: driveHeaders(),
          body: JSON.stringify(metadata),
        }
      )
      return res.json() as Promise<DriveFile>
    },
    async rename(fileId, name) {
      const res = await driveFetch(`/files/${fileId}?fields=id,name,modifiedTime`, {
        method: "PATCH",
        headers: driveHeaders(),
        body: JSON.stringify({ name }),
      })
      return res.json() as Promise<DriveFile>
    },
    async delete(fileId) {
      const res = await driveFetch(`/files/${fileId}`, {
        method: "DELETE",
        headers: driveHeaders(),
      })
      if (res.status !== 204) {
        const body = await res.text().catch(() => "")
        if (body) throw new Error(body)
      }
    },
    async move(fileId, folderId) {
      const res = await driveFetch(`/files/${fileId}?addParents=${folderId}&removeParents=root&fields=id,name,parents`, {
        method: "PATCH",
        headers: driveHeaders(),
      })
      return res.json() as Promise<DriveFile>
    },
    async downloadUrl(fileId) {
      return `${DRIVE_BASE}/files/${fileId}?alt=media`
    },
    async streamUrl(fileId) {
      token = await authorizedToken()
      return {
        href: `${DRIVE_BASE}/files/${fileId}?alt=media`,
        headers: { Authorization: `Bearer ${token}` },
      }
    },
  }
}

export async function getDriveConnectionByGoogleId(
  userId: string,
  googleId: string
): Promise<{ connection: DriveConnection; accountId: string }> {
  const account = await getGoogleAccountByGoogleId(googleId)
  if (!account || account.user_id !== userId) {
    throw new Error("Google account not found")
  }
  const accountId = account.id
  return { connection: await getDriveConnection(userId, accountId), accountId }
}
