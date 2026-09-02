import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getDriveConnection } from "@/lib/google-drive/client"
import { getGoogleAccounts } from "@/lib/supabase/models"

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const accountId = searchParams.get("accountId")
  const folderId = searchParams.get("folderId") ?? "root"
  const query = searchParams.get("q")

  try {
    const accounts = accountId && accountId !== "root"
      ? [{ id: accountId }]
      : await getGoogleAccounts(user.id)

    const connectionResults = await Promise.allSettled(
      accounts.map(async (account) => ({
        accountId: account.id,
        connection: await getDriveConnection(user.id, account.id),
      }))
    )

    const liveConnections = connectionResults
      .filter((r): r is PromiseFulfilledResult<{ accountId: string; connection: Awaited<ReturnType<typeof getDriveConnection>> }> => r.status === "fulfilled")
      .map((r) => r.value)

    const results = await Promise.all(
      liveConnections.map(async ({ accountId: id, connection }) => {
        try {
          const files = query
            ? await connection.search(query)
            : await connection.listFiles(folderId)
          return {
            accountId: id,
            files: files.map((f) => ({
              id: f.id,
              accountId: id,
              name: f.name,
              mimeType: f.mimeType,
              size: Number(f.size ?? 0),
              created_at: f.createdTime,
              modified_at: f.modifiedTime,
              isFolder: f.mimeType === "application/vnd.google-apps.folder",
            })),
          }
        } catch {
          return { accountId: id, files: [], error: "Failed to load files for this account" }
        }
      })
    )

    return NextResponse.json({ results })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to list files"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
