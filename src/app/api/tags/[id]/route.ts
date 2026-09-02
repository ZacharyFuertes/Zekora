import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { deleteTag } from "@/lib/supabase/models"

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  await deleteTag(id)
  return NextResponse.json({ success: true })
}
