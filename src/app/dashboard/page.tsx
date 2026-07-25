import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getCollections } from "@/lib/mongodb/collections"
import { getTags } from "@/lib/mongodb/tags"
import { DashboardContent } from "./dashboard-content"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const [filesResult, collections, tags] = await Promise.all([
    supabase
      .from("files")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    getCollections(user.id),
    getTags(user.id),
  ])

  const files = filesResult.data

  return (
    <DashboardContent
      files={files ?? []}
      collections={collections.map((c) => ({
        ...c,
        _id: c._id!.toString(),
        created_at: c.created_at.toISOString(),
      }))}
      tags={tags.map((t) => ({
        ...t,
        _id: t._id!.toString(),
        created_at: t.created_at.toISOString(),
      }))}
    />
  )
}
