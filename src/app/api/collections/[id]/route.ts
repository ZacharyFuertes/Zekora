import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { deleteCollection } from "@/lib/mongodb/collections"

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  await deleteCollection(id)
  return NextResponse.json({ success: true })
}
