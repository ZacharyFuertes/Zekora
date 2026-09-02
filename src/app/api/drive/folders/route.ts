import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getDriveConnection } from "@/lib/google-drive/client"

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const contentType = request.headers.get("content-type") ?? ""
  const body = contentType.includes("multipart/form-data")
    ? Object.fromEntries(await request.formData())
    : await request.json()
  const accountId = typeof body.accountId === "string" ? body.accountId : undefined
  const name = typeof body.name === "string" ? body.name : undefined
  const parentId = typeof body.parentId === "string" ? body.parentId : undefined

  if (!accountId || !name) {
    return NextResponse.json({ error: "accountId and name are required" }, { status: 400 })
  }

  try {
    const connection = await getDriveConnection(user.id, accountId)
    const folder = await connection.createFolder(name, parentId)
    return NextResponse.json({ folder })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create folder"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
