import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getGoogleAccounts } from "@/lib/supabase/models"
import { FileExplorer } from "@/components/vault/FileExplorer"

export default async function FilesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const accounts = await getGoogleAccounts(user.id)

  return (
    <FileExplorer
      accounts={accounts.map((a) => ({
        id: a.id,
        account_email: a.account_email,
        total_space: a.total_space,
        used_space: a.used_space,
        is_active: a.is_active,
        created_at: a.created_at,
      }))}
    />
  )
}
