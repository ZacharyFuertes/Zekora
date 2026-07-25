import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getNotes } from "@/lib/mongodb/notes"
import { NotesContent } from "./notes-content"

export default async function NotesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const notes = await getNotes(user.id)
  const serialized = notes.map((n) => ({
    ...n,
    _id: n._id!.toString(),
    created_at: n.created_at.toISOString(),
    updated_at: n.updated_at.toISOString(),
  }))

  return <NotesContent notes={serialized} />
}
