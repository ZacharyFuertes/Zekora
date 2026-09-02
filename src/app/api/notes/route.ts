import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getNotes, createNote } from "@/lib/supabase/models"

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const notes = await getNotes(user.id)
  return NextResponse.json({ notes })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json()
  const note = await createNote({ user_id: user.id, ...body })
  return NextResponse.json({ note })
}