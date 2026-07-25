import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { RecentContent } from "./recent-content"

export default async function RecentPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: files } = await supabase
    .from("files")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20)

  return <RecentContent files={files ?? []} />
}
