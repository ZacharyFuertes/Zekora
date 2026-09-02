import { getActiveGoogleAccounts, updateGoogleAccount } from "@/lib/supabase/models"
import { getDriveConnection, type DriveConnection } from "./client"
import type { StoragePool, StorageQuota } from "@/types"

export async function getStoragePool(userId: string): Promise<StoragePool> {
  const accounts = await getActiveGoogleAccounts(userId)

  const quotaResults = await Promise.all(
    accounts.map(async (account) => {
      try {
        const connection = await getDriveConnection(userId, account.id)
        const about = await connection.about()
        await updateGoogleAccount(account.id, {
          total_space: about.limit,
          used_space: about.usage,
        })
        return { account, about }
      } catch {
        return { account, about: { limit: account.total_space, usage: account.used_space } }
      }
    })
  )

  const quotas: StorageQuota[] = quotaResults.map(({ account, about }) => {
    const total = about.limit
    const used = about.usage
    const free = Math.max(total - used, 0)
    const freePercent = total > 0 ? Math.round((free / total) * 1000) / 10 : 0
    return {
      account_id: account.id,
      account_email: account.account_email,
      total,
      used,
      free,
      freePercent,
      is_active: account.is_active,
    }
  })

  const total = quotas.reduce((sum, q) => sum + q.total, 0)
  const used = quotas.reduce((sum, q) => sum + q.used, 0)
  const free = Math.max(total - used, 0)
  const usedPercent = total > 0 ? Math.round((used / total) * 1000) / 10 : 0

  return {
    accounts: quotas,
    total,
    used,
    free,
    usedPercent,
  }
}

export async function pickSmartDrive(userId: string): Promise<string> {
  const pool = await getStoragePool(userId)
  if (pool.accounts.length === 0) {
    throw new Error("No storage drives connected")
  }
  const target = pool.accounts.reduce((best, current) =>
    current.free > best.free ? current : best
  )
  return target.account_id
}

export async function pickDriveForUpload(
  userId: string,
  mode: "smart" | "manual",
  manualAccountId?: string
): Promise<string> {
  if (mode === "manual") {
    if (!manualAccountId) {
      throw new Error("Manual upload requires a target account")
    }
    return manualAccountId
  }
  return pickSmartDrive(userId)
}

export function buildFileRouteConnection(
  userId: string,
  accountId: string
): Promise<DriveConnection> {
  return getDriveConnection(userId, accountId)
}

export interface DriveFileEntry {
  id: string
  accountId: string
  account_email: string
  name: string
  mimeType: string
  size: number
  created_at: string
  modified_at: string
  isFolder: boolean
}

export async function listRootFiles(userId: string): Promise<DriveFileEntry[]> {
  const accounts = await getActiveGoogleAccounts(userId)
  const results = await Promise.all(
    accounts.map(async (account) => {
      try {
        const connection = await getDriveConnection(userId, account.id)
        const files = await connection.listFiles("root")
        return files.map((f) => ({
          id: f.id,
          accountId: account.id,
          account_email: account.account_email,
          name: f.name,
          mimeType: f.mimeType,
          size: Number(f.size ?? 0),
          created_at: f.createdTime,
          modified_at: f.modifiedTime,
          isFolder: f.mimeType === "application/vnd.google-apps.folder",
        }))
      } catch {
        return []
      }
    })
  )
  return results.flat().sort((a, b) => b.modified_at.localeCompare(a.modified_at))
}

export async function listRecentFiles(userId: string, limit = 20): Promise<DriveFileEntry[]> {
  const all = await listRootFiles(userId)
  return all.slice(0, limit)
}
