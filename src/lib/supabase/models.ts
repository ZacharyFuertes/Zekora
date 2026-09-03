import { createClient } from "./server"

// Convenience: every query runs through the SSR client, so RLS scopes
// all reads/writes to the authenticated Supabase user (auth.uid()).
async function db() {
  return createClient()
}

function raise(error: { message: string } | null, fallback = "Database error") {
  throw new Error(error?.message ?? fallback)
}

export interface PasswordEntryRow {
  id: string
  user_id: string
  title: string
  username: string
  url: string
  encrypted_password: string
  created_at: string
  updated_at: string
}

export interface ActivityEventRow {
  id: string
  user_id: string
  event_type: string
  resource_type: string
  resource_name: string
  metadata: Record<string, unknown>
  created_at: string
}

export async function getPasswordEntries(userId: string) {
  const sb = await db()
  const { data, error } = await sb
    .from("password_entries")
    .select("id, user_id, title, username, url, created_at, updated_at")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
  if (error) raise(error)
  return (data ?? []) as Omit<PasswordEntryRow, "encrypted_password">[]
}

export async function getPasswordEntry(userId: string, id: string) {
  const sb = await db()
  const { data, error } = await sb
    .from("password_entries")
    .select("*")
    .eq("user_id", userId)
    .eq("id", id)
    .maybeSingle()
  if (error) raise(error)
  return data as PasswordEntryRow | null
}

export async function createPasswordEntry(data: {
  user_id: string
  title: string
  username: string
  url: string
  encrypted_password: string
}) {
  const sb = await db()
  const { data: row, error } = await sb.from("password_entries").insert(data).select().single()
  if (error) raise(error)
  return row as PasswordEntryRow
}

export async function updatePasswordEntry(id: string, userId: string, data: Partial<Pick<PasswordEntryRow, "title" | "username" | "url" | "encrypted_password">>) {
  const sb = await db()
  const { data: row, error } = await sb
    .from("password_entries")
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .maybeSingle()
  if (error) raise(error)
  return row as PasswordEntryRow | null
}

export async function deletePasswordEntry(id: string, userId: string) {
  const sb = await db()
  const { error } = await sb.from("password_entries").delete().eq("id", id).eq("user_id", userId)
  if (error) raise(error)
}

export async function createActivityEvent(data: Omit<ActivityEventRow, "id" | "created_at">) {
  const sb = await db()
  const { error } = await sb.from("activity_events").insert(data)
  if (error) raise(error)
}

export async function getActivityEvents(userId: string, limit = 50) {
  const sb = await db()
  const { data, error } = await sb
    .from("activity_events")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit)
  if (error?.code === "PGRST205" || error?.code === "42P01") return []
  if (error) raise(error)
  return (data ?? []) as ActivityEventRow[]
}

// ============================ notes ============================

export interface NoteRow {
  id: string
  user_id: string
  title: string
  content: string
  type: "standalone" | "file-attachment"
  file_id: string | null
  tags: string[]
  collection_id: string | null
  mood: string | null
  created_at: string
  updated_at: string
}

export async function getNotes(userId: string): Promise<NoteRow[]> {
  const sb = await db()
  const { data, error } = await sb
    .from("notes")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
  if (error) raise(error)
  return (data ?? []) as NoteRow[]
}

export async function getNote(id: string): Promise<NoteRow | null> {
  const sb = await db()
  const { data, error } = await sb
    .from("notes")
    .select("*")
    .eq("id", id)
    .maybeSingle()
  if (error) raise(error)
  return (data as NoteRow | null) ?? null
}

export async function getNotesByFile(userId: string, fileId: string): Promise<NoteRow[]> {
  const sb = await db()
  const { data, error } = await sb
    .from("notes")
    .select("*")
    .eq("user_id", userId)
    .eq("file_id", fileId)
    .order("updated_at", { ascending: false })
  if (error) raise(error)
  return (data ?? []) as NoteRow[]
}

export async function createNote(data: {
  user_id: string
  title: string
  content: string
  type: "standalone" | "file-attachment"
  file_id?: string
  tags: string[]
  collection_id?: string
  mood?: string
}): Promise<NoteRow> {
  const sb = await db()
  const { data: row, error } = await sb
    .from("notes")
    .insert({
      user_id: data.user_id,
      title: data.title,
      content: data.content,
      type: data.type,
      file_id: data.file_id ?? null,
      tags: data.tags,
      collection_id: data.collection_id ?? null,
      mood: data.mood ?? null,
    })
    .select()
    .single()
  if (error) raise(error)
  return row as NoteRow
}

export async function updateNote(
  id: string,
  data: Partial<{
    title: string
    content: string
    type: "standalone" | "file-attachment"
    file_id: string | null
    tags: string[]
    collection_id: string | null
    mood: string | null
  }>
): Promise<NoteRow | null> {
  const sb = await db()
  const { data: row, error } = await sb
    .from("notes")
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .maybeSingle()
  if (error) raise(error)
  return (row as NoteRow | null) ?? null
}

export async function deleteNote(id: string) {
  const sb = await db()
  const { error } = await sb.from("notes").delete().eq("id", id)
  if (error) raise(error)
}

// ========================= collections =========================

export interface CollectionRow {
  id: string
  user_id: string
  name: string
  description: string
  mood: string
  color: string
  icon: string
  created_at: string
}

export async function getCollections(userId: string): Promise<CollectionRow[]> {
  const sb = await db()
  const { data, error } = await sb
    .from("collections")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
  if (error) raise(error)
  return (data ?? []) as CollectionRow[]
}

export async function getCollection(id: string): Promise<CollectionRow | null> {
  const sb = await db()
  const { data, error } = await sb
    .from("collections")
    .select("*")
    .eq("id", id)
    .maybeSingle()
  if (error) raise(error)
  return (data as CollectionRow | null) ?? null
}

export async function createCollection(data: {
  user_id: string
  name: string
  description?: string
  mood?: string
  color?: string
  icon?: string
}): Promise<CollectionRow> {
  const sb = await db()
  const { data: row, error } = await sb
    .from("collections")
    .insert({
      user_id: data.user_id,
      name: data.name,
      description: data.description ?? "",
      mood: data.mood ?? "calm",
      color: data.color ?? "#a78bfa",
      icon: data.icon ?? "folder",
    })
    .select()
    .single()
  if (error) raise(error)
  return row as CollectionRow
}

export async function deleteCollection(id: string) {
  const sb = await db()
  const { error } = await sb.from("collections").delete().eq("id", id)
  if (error) raise(error)
}

// ============================ tags ============================

export interface TagRow {
  id: string
  user_id: string
  name: string
  color: string
  created_at: string
}

export async function getTags(userId: string): Promise<TagRow[]> {
  const sb = await db()
  const { data, error } = await sb
    .from("tags")
    .select("*")
    .eq("user_id", userId)
    .order("name", { ascending: true })
  if (error) raise(error)
  return (data ?? []) as TagRow[]
}

export async function createTag(data: {
  user_id: string
  name: string
  color?: string
}): Promise<TagRow> {
  const sb = await db()

  const existing = await sb
    .from("tags")
    .select("*")
    .eq("user_id", data.user_id)
    .eq("name", data.name)
    .maybeSingle()
  if (existing.data) return existing.data as TagRow

  const { data: row, error } = await sb
    .from("tags")
    .insert({
      user_id: data.user_id,
      name: data.name,
      color: data.color ?? "#a78bfa",
    })
    .select()
    .single()

  if (error) {
    // Unique (user_id, name) race — return the row that won.
    const { data: winner, error: winnerError } = await sb
      .from("tags")
      .select("*")
      .eq("user_id", data.user_id)
      .eq("name", data.name)
      .maybeSingle()
    if (winnerError || !winner) raise(error)
    return winner as TagRow
  }

  return row as TagRow
}

export async function deleteTag(id: string) {
  const sb = await db()
  const { error } = await sb.from("tags").delete().eq("id", id)
  if (error) raise(error)
}

// ========================= google_accounts =========================

export interface GoogleAccountRow {
  id: string
  user_id: string
  account_email: string
  encrypted_refresh_token: string
  access_token: string
  token_expiry: string
  total_space: number
  used_space: number
  is_active: boolean
  google_id: string
  created_at: string
  updated_at: string
}

export async function getGoogleAccounts(userId: string): Promise<GoogleAccountRow[]> {
  const sb = await db()
  const { data, error } = await sb
    .from("google_accounts")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
  if (error) raise(error)
  return (data ?? []) as GoogleAccountRow[]
}

export async function getActiveGoogleAccounts(userId: string): Promise<GoogleAccountRow[]> {
  const sb = await db()
  const { data, error } = await sb
    .from("google_accounts")
    .select("*")
    .eq("user_id", userId)
    .eq("is_active", true)
    .order("created_at", { ascending: true })
  if (error) raise(error)
  return (data ?? []) as GoogleAccountRow[]
}

export async function getGoogleAccountDocumentById(
  userId: string,
  id: string
): Promise<GoogleAccountRow | null> {
  const sb = await db()
  const { data, error } = await sb
    .from("google_accounts")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle()
  if (error) raise(error)
  return (data as GoogleAccountRow | null) ?? null
}

export async function getGoogleAccountByGoogleId(
  googleId: string
): Promise<GoogleAccountRow | null> {
  const sb = await db()
  const { data, error } = await sb
    .from("google_accounts")
    .select("*")
    .eq("google_id", googleId)
    .maybeSingle()
  if (error) raise(error)
  return (data as GoogleAccountRow | null) ?? null
}

export async function createGoogleAccount(data: {
  user_id: string
  account_email: string
  encrypted_refresh_token: string
  access_token: string
  token_expiry: Date
  google_id: string
}): Promise<GoogleAccountRow> {
  const sb = await db()
  const { data: row, error } = await sb
    .from("google_accounts")
    .insert({
      user_id: data.user_id,
      account_email: data.account_email,
      encrypted_refresh_token: data.encrypted_refresh_token,
      access_token: data.access_token,
      token_expiry: data.token_expiry.toISOString(),
      google_id: data.google_id,
    })
    .select()
    .single()
  if (error) raise(error)
  return row as GoogleAccountRow
}

export async function updateGoogleAccount(
  id: string,
  data: Partial<{
    account_email: string
    encrypted_refresh_token: string
    access_token: string
    token_expiry: Date
    total_space: number
    used_space: number
    is_active: boolean
    google_id: string
  }>
) {
  const sb = await db()
  const { token_expiry, ...rest } = data
  const patch: Record<string, string | number | boolean> = { ...rest }
  if (token_expiry) patch.token_expiry = token_expiry.toISOString()
  const { error } = await sb
    .from("google_accounts")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id)
  if (error) raise(error)
}

export async function updateToken(id: string, accessToken: string, tokenExpiry: Date) {
  const sb = await db()
  const { error } = await sb
    .from("google_accounts")
    .update({
      access_token: accessToken,
      token_expiry: tokenExpiry.toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
  if (error) raise(error)
}

export async function deleteGoogleAccount(id: string) {
  const sb = await db()
  const { error } = await sb.from("google_accounts").delete().eq("id", id)
  if (error) raise(error)
}