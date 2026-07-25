"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { createClient } from "@/lib/supabase/client"
import { AuthCard } from "@/components/auth/auth-card"
import { AuthForm } from "@/components/auth/auth-form"

export default function LoginPage() {
  const supabase = createClient()

  return (
    <div className="min-h-dvh flex items-center justify-center p-4">
      <AuthCard
        title="Welcome back"
        subtitle="Sign in to your vault"
        footerText="Don't have an account?"
        footerLink="/signup"
        footerLinkText="Sign up"
      >
        <AuthForm
          mode="login"
          onSubmit={async ({ email, password }) => {
            const { error } = await supabase.auth.signInWithPassword({
              email,
              password,
            })
            if (error) throw error
          }}
        />
      </AuthCard>
    </div>
  )
}
