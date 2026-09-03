import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { PasswordManager } from "@/components/dashboard/password-manager"

export default async function PasswordsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  return <PasswordManager />
}
