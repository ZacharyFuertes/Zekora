import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getTags } from "@/lib/supabase/models"
import { TagsContent } from "./tags-content"

export default async function TagsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const tags = await getTags(user.id)

  return <TagsContent tags={tags} />
}