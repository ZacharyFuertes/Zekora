import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getGoogleAccounts } from "@/lib/supabase/models"
import { getStoragePool } from "@/lib/google-drive/pool"
import { ConnectedDrivesManager } from "./connected-drives-manager"

export default async function StorageSettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const [accounts, pool] = await Promise.all([
    getGoogleAccounts(user.id),
    getStoragePool(user.id).catch(() => null),
  ])

  return (
    <ConnectedDrivesManager
      accounts={accounts.map((a) => ({
        id: a.id,
        account_email: a.account_email,
        total_space: a.total_space,
        used_space: a.used_space,
        is_active: a.is_active,
        created_at: a.created_at,
      }))}
      pool={pool}
    />
  )
}