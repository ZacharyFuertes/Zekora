const SCOPES = [
  "https://www.googleapis.com/auth/drive",
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile",
]

export const GOOGLE_OAUTH_CONFIG = {
  clientId: process.env.GOOGLE_CLIENT_ID ?? "",
  clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
  redirectUri: process.env.GOOGLE_REDIRECT_URI ?? "",
  authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
  tokenUrl: "https://oauth2.googleapis.com/token",
  userInfoUrl: "https://openidconnect.googleapis.com/v1/userinfo",
  scopes: SCOPES,
} as const

export function getGoogleRedirectUri(): string {
  const configured = process.env.GOOGLE_REDIRECT_URI
  if (configured) return configured

  const vercelUrl = process.env.VERCEL_URL
  if (vercelUrl) return `https://${vercelUrl}/api/auth/google/callback`
  return "http://localhost:3000/api/auth/google/callback"
}

export function buildAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: GOOGLE_OAUTH_CONFIG.clientId,
    redirect_uri: getGoogleRedirectUri(),
    response_type: "code",
    scope: GOOGLE_OAUTH_CONFIG.scopes.join(" "),
    state,
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: "true",
  })
  return `${GOOGLE_OAUTH_CONFIG.authUrl}?${params.toString()}`
}
