import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getDriveConnection, type DriveFile } from "@/lib/google-drive/client"

type Params = { params: Promise<{ fileId: string }> }

function serializeFile(file: DriveFile) {
  return {
    id: file.id,
    name: file.name,
    mimeType: file.mimeType,
    size: Number(file.size ?? 0),
    created_at: file.createdTime,
    modified_at: file.modifiedTime,
  }
}

export async function GET(request: Request, { params }: Params) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { fileId } = await params
  const { searchParams } = new URL(request.url)
  const accountId = searchParams.get("accountId")

  if (!accountId) {
    return NextResponse.json({ error: "accountId is required" }, { status: 400 })
  }

  try {
    const connection = await getDriveConnection(user.id, accountId)
    const fileMeta = await connection.getFile(fileId)
    const { href } = await connection.streamUrl(fileId)
    const token = await connection.getAccessToken()

    const driveRes = await fetch(href, {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (!driveRes.ok) {
      return NextResponse.json(
        { error: `Failed to stream file (${driveRes.status})` },
        { status: driveRes.status }
      )
    }

    const body = driveRes.body
    if (!body) {
      return NextResponse.json({ error: "No content" }, { status: 500 })
    }

    const safeName = fileMeta.name.replace(/[\\/:*?"<>|]/g, "_")

    return new NextResponse(body as ReadableStream, {
      status: 200,
      headers: {
        "Content-Type": fileMeta.mimeType || "application/octet-stream",
        "Content-Length": String(fileMeta.size ?? 0),
        "Content-Disposition": `attachment; filename="${safeName}"`,
        "Cache-Control": "private, no-store",
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to download file"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: Params) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { fileId } = await params
  const { searchParams } = new URL(request.url)
  const accountId = searchParams.get("accountId")
  const body = await request.json()
  const name = body.name as string | undefined

  if (!accountId || !name) {
    return NextResponse.json({ error: "accountId and name are required" }, { status: 400 })
  }

  try {
    const connection = await getDriveConnection(user.id, accountId)
    const file = await connection.rename(fileId, name)
    return NextResponse.json({ file: serializeFile(file) })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to rename file"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: Params) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { fileId } = await params
  const { searchParams } = new URL(request.url)
  const accountId = searchParams.get("accountId")

  if (!accountId) {
    return NextResponse.json({ error: "accountId is required" }, { status: 400 })
  }

  try {
    const connection = await getDriveConnection(user.id, accountId)
    await connection.delete(fileId)
    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete file"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}