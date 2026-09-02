import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { pickDriveForUpload } from "@/lib/google-drive/pool"
import { getDriveConnection } from "@/lib/google-drive/client"

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get("file") as File | null
  const mode = (formData.get("mode") as string | null) ?? "smart"
  const accountId = (formData.get("accountId") as string | null) ?? undefined
  const parentId = (formData.get("parentId") as string | null) ?? undefined

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 })
  }

  try {
    const targetAccountId = await pickDriveForUpload(
      user.id,
      mode === "manual" ? "manual" : "smart",
      accountId
    )
    const connection = await getDriveConnection(user.id, targetAccountId)
    const buffer = Buffer.from(await file.arrayBuffer())
    const result = await connection.upload(file.name, file.type || "application/octet-stream", buffer, parentId)
    return NextResponse.json({ file: result.file, accountId: targetAccountId })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
