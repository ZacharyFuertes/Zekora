import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getGoogleRedirectUri, GOOGLE_OAUTH_CONFIG } from "@/lib/google-oauth"
import { encryptToken } from "@/lib/encryption"
import {
  getGoogleAccountByGoogleId,
  createGoogleAccount,
  updateGoogleAccount,
} from "@/lib/supabase/models"

async function exchangeCodeForToken(code: string) {
  const res = await fetch(GOOGLE_OAUTH_CONFIG.tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: GOOGLE_OAUTH_CONFIG.clientId,
      client_secret: GOOGLE_OAUTH_CONFIG.clientSecret,
      redirect_uri: getGoogleRedirectUri(),
      grant_type: "authorization_code",
    }),
  })
  const data = await res.json()
  if (!res.ok) {
    throw new Error(data.error_description ?? data.error ?? "Token exchange failed")
  }
  return data
}

async function fetchUserInfo(accessToken: string) {
  const res = await fetch(GOOGLE_OAUTH_CONFIG.userInfoUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  const data = await res.json()
  if (!res.ok || !data.email) {
    throw new Error("Failed to fetch Google account info")
  }
  return data
}

async function fetchStorageQuota(accessToken: string) {
  const res = await fetch(
    "https://www.googleapis.com/drive/v3/about?fields=storageQuota",
    { headers: { Authorization: `Bearer ${accessToken}` } }
  )
  if (!res.ok) return null
  const data = await res.json()
  return data.storageQuota as { limit?: string; usage?: string }
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get("code")
  const error = url.searchParams.get("error")
  const stateParam = url.searchParams.get("state")

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL("/login?error=google_auth", url.origin))
  }

  if (error || !code) {
    return NextResponse.redirect(
      new URL("/dashboard/settings?error=google_denied", url.origin)
    )
  }

  if (stateParam) {
    try {
      const parsed = JSON.parse(Buffer.from(stateParam, "base64url").toString("utf8"))
      if (parsed.uid && parsed.uid !== user.id) {
        return NextResponse.redirect(
          new URL("/dashboard/settings?error=google_state", url.origin)
        )
      }
    } catch {
      return NextResponse.redirect(
        new URL("/dashboard/settings?error=google_state", url.origin)
      )
    }
  }

  try {
    const tokens = await exchangeCodeForToken(code)

    if (!tokens.refresh_token) {
      return NextResponse.redirect(
        new URL("/dashboard/settings?error=google_offline", url.origin)
      )
    }

    const profile = await fetchUserInfo(tokens.access_token)
    const encryptedRefresh = encryptToken(tokens.refresh_token)
    const expiry = new Date(Date.now() + (tokens.expires_in ?? 3600) * 1000)
    const quota = await fetchStorageQuota(tokens.access_token)

    const existing = await getGoogleAccountByGoogleId(profile.sub)

    if (existing) {
      await updateGoogleAccount(existing.id, {
        account_email: profile.email,
        encrypted_refresh_token: encryptedRefresh,
        access_token: tokens.access_token,
        token_expiry: expiry,
        is_active: true,
        used_space: Number(quota?.usage ?? 0),
        total_space: Number(quota?.limit ?? 15 * 1024 * 1024 * 1024),
      })
    } else {
      await createGoogleAccount({
        user_id: user.id,
        account_email: profile.email,
        encrypted_refresh_token: encryptedRefresh,
        access_token: tokens.access_token,
        token_expiry: expiry,
        google_id: profile.sub,
      })
    }

    return NextResponse.redirect(
      new URL("/dashboard/settings?connected=1", url.origin)
    )
  } catch {
    return NextResponse.redirect(
      new URL("/dashboard/settings?error=google_failed", url.origin)
    )
  }
}
