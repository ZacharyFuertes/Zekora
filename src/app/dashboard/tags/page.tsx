import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getTags } from "@/lib/mongodb/tags"
import { TagsContent } from "./tags-content"

export default async function TagsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const tags = await getTags(user.id)
  const serialized = tags.map((t) => ({
    ...t,
    _id: t._id!.toString(),
    created_at: t.created_at.toISOString(),
  }))

  return <TagsContent tags={serialized} />
}
