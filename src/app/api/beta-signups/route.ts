import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  let body: unknown

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }

  const email =
    typeof body === "object" && body !== null && "email" in body &&
    typeof body.email === "string"
      ? body.email.trim().toLowerCase()
      : ""

  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address" }, { status: 400 })
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from("beta_signups")
    .insert({ email })

  if (error && error.code !== "23505") {
    return NextResponse.json({ error: "Could not save your signup" }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}