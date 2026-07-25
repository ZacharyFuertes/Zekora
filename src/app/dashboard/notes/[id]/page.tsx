import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getNote } from "@/lib/mongodb/notes"
import { getCollections } from "@/lib/mongodb/collections"
import { getTags } from "@/lib/mongodb/tags"
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
    const doc = await getNote(id)
    if (doc) {
      note = {
        ...doc,
        _id: doc._id!.toString(),
        created_at: doc.created_at.toISOString(),
        updated_at: doc.updated_at.toISOString(),
      }
    }
  }

  const [collections, tags] = await Promise.all([
    getCollections(user.id),
    getTags(user.id),
  ])

  return (
    <NoteEditor
      note={note}
      isNew={isNew}
      collections={collections.map((c) => ({ ...c, _id: c._id!.toString(), created_at: c.created_at.toISOString() }))}
      tagSuggestions={tags.map((t) => t.name)}
    />
  )
}
