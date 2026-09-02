import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getNote } from "@/lib/supabase/models"
import { getCollections } from "@/lib/supabase/models"
import { getTags } from "@/lib/supabase/models"
import { NoteEditor } from "./note-editor"

export default async function NotePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { id } = await params
  const isNew = id === "new"

  let note = null
  if (!isNew) {
    note = await getNote(id)
  }

  const [collections, tags] = await Promise.all([
    getCollections(user.id),
    getTags(user.id),
  ])

  return (
    <NoteEditor
      note={note}
      isNew={isNew}
      collections={collections}
      tagSuggestions={tags.map((t) => t.name)}
    />
  )
}