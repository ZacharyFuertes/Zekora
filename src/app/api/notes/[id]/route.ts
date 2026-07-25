import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getNote, updateNote, deleteNote } from "@/lib/mongodb/notes"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const note = await getNote(id)
  if (!note) return NextResponse.json({ error: "Not found" }, { status: 404 })

  return NextResponse.json({
    note: {
      ...note,
      _id: note._id!.toString(),
      created_at: note.created_at.toISOString(),
      updated_at: note.updated_at.toISOString(),
    },
  })
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const body = await request.json()
  const note = await updateNote(id, body)
  if (!note) return NextResponse.json({ error: "Not found" }, { status: 404 })

  return NextResponse.json({
    note: {
      ...note,
      _id: note._id!.toString(),
      created_at: note.created_at.toISOString(),
      updated_at: note.updated_at.toISOString(),
    },
  })
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  await deleteNote(id)
  return NextResponse.json({ success: true })
}
