import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getTags, createTag } from "@/lib/mongodb/tags"

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const tags = await getTags(user.id)
  const serialized = tags.map((t) => ({
    ...t,
    _id: t._id!.toString(),
    created_at: t.created_at.toISOString(),
  }))
  return NextResponse.json({ tags: serialized })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json()
  const tag = await createTag({ user_id: user.id, ...body })
  return NextResponse.json({
    tag: {
      ...tag,
      _id: tag._id!.toString(),
      created_at: tag.created_at.toISOString(),
    },
  })
}
