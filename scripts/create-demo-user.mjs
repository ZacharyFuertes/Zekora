/*
 * Zekora — Create demo user (zach@gmail.com / 123456789)
 * ------------------------------------------------------
 * Creates the user via the Supabase Admin API with email confirmed,
 * so they can sign in immediately at /login.
 *
 * Requires SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY to point at a
 * LIVE Supabase project.
 *
 * Usage:
 *   npm run db:demo-user
 */
const fs = await import("fs")
const path = await import("path")

const EMAIL = "zach@gmail.com"
const PASSWORD = "123456789"

function loadEnv(name, fallback) {
  if (process.env[name]) return process.env[name]
  const envPath = path.join(process.cwd(), ".env.local")
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, "utf8")
    for (const raw of content.split(/\r?\n/)) {
      const line = raw.trim()
      const prefix = name + "="
      if (line.startsWith(prefix)) {
        return line.slice(prefix.length).replace(/^"|"$/g, "")
      }
    }
  }
  return fallback
}

async function main() {
  const supabaseUrl = loadEnv("NEXT_PUBLIC_SUPABASE_URL", "")
  const serviceRole = loadEnv("SUPABASE_SERVICE_ROLE_KEY", "")

  if (!supabaseUrl || !serviceRole) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required."
    )
  }

  if (!/^https:\/\/.+\.supabase\.co$/.test(supabaseUrl)) {
    throw new Error(`Supabase URL looks invalid: ${supabaseUrl}`)
  }

  console.log(`Creating demo user ${EMAIL} on ${supabaseUrl}...`)

  const res = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
    method: "POST",
    headers: {
      apikey: serviceRole,
      Authorization: `Bearer ${serviceRole}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: EMAIL,
      password: PASSWORD,
      email_confirm: true,
    }),
  })

  const data = await res.json()

  if (res.ok) {
    console.log("✓ Demo user created. Sign in at /login with:")
    console.log(`  email:    ${EMAIL}`)
    console.log(`  password: ${PASSWORD}`)
    return
  }

  if (res.status === 409 && /already registered/i.test(data.msg ?? "")) {
    console.log("Demo user already exists. Nothing to do.")
    return
  }

  throw new Error(data.msg ?? `Failed (${res.status}): ${JSON.stringify(data)}`)
}

main().catch((err) => {
  console.error("Failed to create demo user:", err.message)
  process.exit(1)
})