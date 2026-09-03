import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto"
import { createClient } from "@/lib/supabase/server"

const SESSION_COOKIE = "hidden_vault_session"
const SESSION_AGE = 60 * 60 * 8

function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex")
  const hash = scryptSync(password, salt, 64).toString("hex")
  return `${salt}:${hash}`
}

function verifyPassword(password: string, stored: string) {
  const [salt, expected] = stored.split(":")
  if (!salt || !expected) return false
  const actual = scryptSync(password, salt, 64).toString("hex")
  return timingSafeEqual(Buffer.from(actual, "hex"), Buffer.from(expected, "hex"))
}

async function zekoraUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return { supabase, user }
}

export async function GET() {
  const { supabase, user } = await zekoraUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: account, error } = await supabase
    .from("hidden_vault_accounts")
    .select("id, email, session_token_hash, session_expires_at")
    .eq("user_id", user.id)
    .maybeSingle()
  if (error && error.code !== "PGRST205") return NextResponse.json({ error: "Could not check Hidden Vault" }, { status: 500 })

  const session = (await cookies()).get(SESSION_COOKIE)?.value
  const unlocked = Boolean(account?.session_token_hash && account.session_expires_at && session && account.session_token_hash === hashSession(session) && new Date(account.session_expires_at) > new Date())
  return NextResponse.json({ exists: Boolean(account), unlocked, email: account?.email ?? null })
}

function hashSession(session: string) {
  return scryptSync(session, "hidden-vault-session", 32).toString("hex")
}

export async function POST(request: Request) {
  const { supabase, user } = await zekoraUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const body = await request.json() as { action?: string; email?: string; password?: string }
  const action = body.action
  const email = body.email?.trim().toLowerCase() ?? ""
  const password = body.password ?? ""

  if (action === "logout") {
    await supabase.from("hidden_vault_accounts").update({ session_token_hash: null, session_expires_at: null }).eq("user_id", user.id)
    const response = NextResponse.json({ ok: true })
    response.cookies.delete(SESSION_COOKIE)
    return response
  }

  if (!email || password.length < 8) return NextResponse.json({ error: "Use an email and a password with at least 8 characters" }, { status: 400 })
  const { data: account } = await supabase.from("hidden_vault_accounts").select("*").eq("user_id", user.id).maybeSingle()

  if (action === "signup") {
    if (account) return NextResponse.json({ error: "A Hidden Vault already exists. Sign in instead." }, { status: 409 })
    const { error } = await supabase.from("hidden_vault_accounts").insert({ user_id: user.id, email, password_hash: hashPassword(password) })
    if (error) return NextResponse.json({ error: "Could not create Hidden Vault" }, { status: 500 })
  } else if (action === "login") {
    if (!account || account.email !== email || !verifyPassword(password, account.password_hash)) return NextResponse.json({ error: "Invalid Hidden Vault credentials" }, { status: 401 })
  } else {
    return NextResponse.json({ error: "Unknown action" }, { status: 400 })
  }

  const session = randomBytes(32).toString("hex")
  const { error } = await supabase.from("hidden_vault_accounts").update({ session_token_hash: hashSession(session), session_expires_at: new Date(Date.now() + SESSION_AGE * 1000).toISOString(), updated_at: new Date().toISOString() }).eq("user_id", user.id)
  if (error) return NextResponse.json({ error: "Could not unlock Hidden Vault" }, { status: 500 })
  const response = NextResponse.json({ ok: true, unlocked: true })
  response.cookies.set(SESSION_COOKIE, session, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: SESSION_AGE, path: "/" })
  return response
}
