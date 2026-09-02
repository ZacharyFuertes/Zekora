import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getCollections } from "@/lib/supabase/models"
import { CollectionsContent } from "./collections-content"

export default async function CollectionsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const collections = await getCollections(user.id)

  return <CollectionsContent collections={collections} />
}