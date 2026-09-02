import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import {
  getGoogleAccounts,
  getGoogleAccountDocumentById,
  deleteGoogleAccount,
} from "@/lib/supabase/models"

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const accounts = await getGoogleAccounts(user.id)
  return NextResponse.json({ accounts: accounts.map((a) => ({
    id: a.id,
    account_email: a.account_email,
    total_space: a.total_space,
    used_space: a.used_space,
    is_active: a.is_active,
    created_at: a.created_at,
  })) })
}

export async function DELETE(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const accountId = body.accountId as string | undefined
  if (!accountId) {
    return NextResponse.json({ error: "accountId is required" }, { status: 400 })
  }

  const account = await getGoogleAccountDocumentById(user.id, accountId)
  if (!account) {
    return NextResponse.json({ error: "Account not found" }, { status: 404 })
  }

  await deleteGoogleAccount(accountId)
  return NextResponse.json({ success: true })
}