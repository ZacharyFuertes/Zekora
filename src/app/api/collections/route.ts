import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getCollections, createCollection } from "@/lib/mongodb/collections"

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const collections = await getCollections(user.id)
  const serialized = collections.map((c) => ({
    ...c,
    _id: c._id!.toString(),
    created_at: c.created_at.toISOString(),
  }))
  return NextResponse.json({ collections: serialized })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json()
  const collection = await createCollection({ user_id: user.id, ...body })
  return NextResponse.json({
    collection: {
      ...collection,
      _id: collection._id!.toString(),
      created_at: collection.created_at.toISOString(),
    },
  })
}
