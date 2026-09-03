import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { encryptToken } from "@/lib/encryption"
import { createActivityEvent, createPasswordEntry, getPasswordEntries } from "@/lib/supabase/models"

function fields(body: unknown) {
  if (typeof body !== "object" || body === null) return null
  const value = body as Record<string, unknown>
  const title = typeof value.title === "string" ? value.title.trim() : ""
  const username = typeof value.username === "string" ? value.username.trim() : ""
  const url = typeof value.url === "string" ? value.url.trim() : ""
  const password = typeof value.password === "string" ? value.password : ""
  return title && password ? { title, username, url, password } : null
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  return NextResponse.json({ passwords: await getPasswordEntries(user.id) })
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const data = fields(await request.json())
    if (!data) return NextResponse.json({ error: "Title and password are required" }, { status: 400 })

    const entry = await createPasswordEntry({
      user_id: user.id,
      title: data.title,
      username: data.username,
      url: data.url,
      encrypted_password: encryptToken(data.password),
    })
    try {
      await createActivityEvent({ user_id: user.id, event_type: "password_created", resource_type: "password", resource_name: data.title, metadata: {} })
    } catch (error) {
      console.warn("Password saved, but activity event was not recorded", error)
    }
    return NextResponse.json({ password: { ...entry, encrypted_password: undefined } }, { status: 201 })
  } catch (error) {
    console.error("Password creation failed", error)
    const detail = error instanceof Error ? error.message : "Unknown server error"
    return NextResponse.json({
      error: process.env.NODE_ENV === "production"
        ? "Could not save password. Check your database and encryption setup."
        : `Could not save password: ${detail}`,
    }, { status: 500 })
  }
}
