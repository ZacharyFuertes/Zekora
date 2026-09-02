import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getNotes } from "@/lib/supabase/models"
import { NotesContent } from "./notes-content"

export default async function NotesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const notes = await getNotes(user.id)

  return <NotesContent notes={notes} />
}