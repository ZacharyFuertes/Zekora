import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { LandingPage } from "@/components/landing/landing-page"

export const metadata: Metadata = {
  title: "Zekora — Encrypted personal cloud vault",
  description:
    "One encrypted vault over every Google Drive you own. Multi-drive pooling, encrypted passwords, a hidden vault, notes, and a vault-aware AI assistant.",
}

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect("/dashboard")
  }

  return <LandingPage />
}
