import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getCollections, createCollection } from "@/lib/supabase/models"

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const collections = await getCollections(user.id)
  return NextResponse.json({ collections })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json()
  const collection = await createCollection({ user_id: user.id, ...body })
  return NextResponse.json({ collection })
}