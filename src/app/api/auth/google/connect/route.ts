import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { buildAuthUrl } from "@/lib/google-oauth"

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const state = Buffer.from(
    JSON.stringify({ uid: user.id, ts: Date.now() })
  ).toString("base64url")

  const url = buildAuthUrl(state)
  return NextResponse.json({ url })
}
