import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getStoragePool } from "@/lib/google-drive/pool"

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const pool = await getStoragePool(user.id)
    return NextResponse.json({ pool })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch storage pool"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
