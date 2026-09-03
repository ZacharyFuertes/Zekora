import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { HiddenVaultScene } from "@/components/dashboard/hidden-vault-scene"

export default async function AccessLogsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  return <HiddenVaultScene />
}
