import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { listRecentFiles } from "@/lib/google-drive/pool"
import { RecentContent } from "./recent-content"

export default async function RecentPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const files = await listRecentFiles(user.id, 20)

  return (
    <RecentContent
      files={files.map((f) => ({
        id: f.id,
        name: f.name,
        mimeType: f.mimeType,
        size: f.size,
        url: `/api/drive/files/${f.id}?accountId=${f.accountId}`,
        created_at: f.created_at,
        modified_at: f.modified_at,
        account_email: f.account_email,
      }))}
    />
  )
}
