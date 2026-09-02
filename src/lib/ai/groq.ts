import type { ChatCompletionMessageParam } from "./types"

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"

export async function createGroqCompletion(
  messages: ChatCompletionMessageParam[]
): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) throw new Error("GROQ_API_KEY is not configured")

  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.GROQ_MODEL ?? "openai/gpt-oss-20b",
      messages,
      temperature: 0.2,
      max_tokens: 1200,
    }),
    signal: AbortSignal.timeout(30_000),
  })

  const payload = await response.json().catch(() => null) as {
    choices?: Array<{ message?: { content?: unknown } }>
    error?: { message?: unknown }
  } | null

  if (!response.ok) {
    const message = typeof payload?.error?.message === "string"
      ? payload.error.message
      : `Groq request failed (${response.status})`
    throw new Error(message)
  }

  const content = payload?.choices?.[0]?.message?.content
  if (typeof content !== "string" || !content.trim()) {
    throw new Error("Groq returned an empty response")
  }
  return content.trim()
}