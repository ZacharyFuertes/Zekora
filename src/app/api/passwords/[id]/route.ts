import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { decryptToken, encryptToken } from "@/lib/encryption"
import { createActivityEvent, deletePasswordEntry, getPasswordEntry, updatePasswordEntry } from "@/lib/supabase/models"

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  const entry = await getPasswordEntry(user.id, id)
  if (!entry) return NextResponse.json({ error: "Not found" }, { status: 404 })
  try {
    await createActivityEvent({ user_id: user.id, event_type: "password_revealed", resource_type: "password", resource_name: entry.title, metadata: {} })
  } catch (error) {
    console.warn("Password revealed, but activity event was not recorded", error)
  }
  return NextResponse.json({ password: decryptToken(entry.encrypted_password) })
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  const body = await request.json() as Record<string, unknown>
  const updates: Record<string, string> = {}
  for (const key of ["title", "username", "url"] as const) {
    if (typeof body[key] === "string") updates[key] = body[key].trim()
  }
  if (typeof body.password === "string" && body.password) updates.encrypted_password = encryptToken(body.password)
  const entry = await updatePasswordEntry(id, user.id, updates)
  if (!entry) return NextResponse.json({ error: "Not found" }, { status: 404 })
  try {
    await createActivityEvent({ user_id: user.id, event_type: "password_updated", resource_type: "password", resource_name: entry.title, metadata: {} })
  } catch (error) {
    console.warn("Password updated, but activity event was not recorded", error)
  }
  return NextResponse.json({ password: { ...entry, encrypted_password: undefined } })
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  const entry = await getPasswordEntry(user.id, id)
  if (!entry) return NextResponse.json({ error: "Not found" }, { status: 404 })
  await deletePasswordEntry(id, user.id)
  try {
    await createActivityEvent({ user_id: user.id, event_type: "password_deleted", resource_type: "password", resource_name: entry.title, metadata: {} })
  } catch (error) {
    console.warn("Password deleted, but activity event was not recorded", error)
  }
  return NextResponse.json({ success: true })
}
