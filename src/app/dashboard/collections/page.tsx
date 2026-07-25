import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getCollections } from "@/lib/mongodb/collections"
import { CollectionsContent } from "./collections-content"

export default async function CollectionsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const collections = await getCollections(user.id)
  const serialized = collections.map((c) => ({
    ...c,
    _id: c._id!.toString(),
    created_at: c.created_at.toISOString(),
  }))

  return <CollectionsContent collections={serialized} />
}
