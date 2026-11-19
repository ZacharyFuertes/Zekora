"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { LoginForm } from "@/components/auth/login-form"
import { LoginBackdrop } from "@/components/ui/login-backdrop"
import styles from "./login.module.css"

export default function LoginPage() {
  const supabase = createClient()
  const [transitioning, setTransitioning] = useState(false)

  return (
    <main className={`${styles.page} ${transitioning ? styles.transitioning : ""}`}>
      <LoginBackdrop zooming={transitioning} />
      <div className={styles.content}>
        <div className={styles.stage}>
          <LoginForm
            onSuccess={() => setTransitioning(true)}
            onSubmit={async ({ email, password }) => {
              const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
              })
              if (error) throw error
            }}
          />
        </div>

      </div>
      {transitioning && (
        <div className={styles.vaultLoading} role="status" aria-live="polite">
          OPENING THE VAULT<span className={styles.vaultLoadingDots} aria-hidden="true">...</span>
        </div>
      )}
    </main>
  )
}
