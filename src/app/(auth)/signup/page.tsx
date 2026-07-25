"use client"

import { createClient } from "@/lib/supabase/client"
import { AuthCard } from "@/components/auth/auth-card"
import { AuthForm } from "@/components/auth/auth-form"

export default function SignupPage() {
  const supabase = createClient()

  return (
    <div className="min-h-dvh flex items-center justify-center p-4">
      <AuthCard
        title="Create your vault"
        subtitle="Start storing your digital treasures"
        footerText="Already have an account?"
        footerLink="/login"
        footerLinkText="Sign in"
      >
        <AuthForm
          mode="signup"
          onSubmit={async ({ email, password }) => {
            const { error } = await supabase.auth.signUp({
              email,
              password,
              options: {
                emailRedirectTo: `${window.location.origin}/auth/callback`,
              },
            })
            if (error) throw error
          }}
        />
      </AuthCard>
    </div>
  )
}
