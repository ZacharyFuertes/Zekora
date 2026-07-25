import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getNotes, createNote } from "@/lib/mongodb/notes"

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const notes = await getNotes(user.id)
  const serialized = notes.map((n) => ({
    ...n,
    _id: n._id!.toString(),
    created_at: n.created_at.toISOString(),
    updated_at: n.updated_at.toISOString(),
  }))
  return NextResponse.json({ notes: serialized })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json()
  const note = await createNote({ user_id: user.id, ...body })
  return NextResponse.json({
    note: {
      ...note,
      _id: note._id!.toString(),
      created_at: note.created_at.toISOString(),
      updated_at: note.updated_at.toISOString(),
    },
  })
}
