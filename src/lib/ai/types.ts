export interface ChatCompletionMessageParam {
  role: "system" | "user" | "assistant"
  content: string
}

export interface ChatMessage {
  role: "user" | "assistant"
  content: string
}