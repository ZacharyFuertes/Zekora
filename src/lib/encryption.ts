import crypto from "crypto"

const ALGORITHM = "aes-256-cbc"
const IV_LENGTH = 16

function getEncryptionKey(): Buffer {
  const secret = process.env.ENCRYPTION_KEY
  if (!secret) {
    throw new Error(
      "ENCRYPTION_KEY is not defined. Set a 32-byte (64 hex chars) secret in your environment."
    )
  }

  let bytes: Buffer
  if (/^[0-9a-fA-F]{64}$/.test(secret)) {
    bytes = Buffer.from(secret, "hex")
  } else {
    bytes = crypto.createHash("sha256").update(secret).digest()
  }

  if (bytes.length !== 32) {
    throw new Error("ENCRYPTION_KEY must resolve to exactly 32 bytes.")
  }
  return bytes
}

export function encryptToken(plaintext: string): string {
  const key = getEncryptionKey()
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ])
  return `${iv.toString("base64")}:${encrypted.toString("base64")}`
}

export function decryptToken(payload: string): string {
  const key = getEncryptionKey()
  const [ivB64, dataB64] = payload.split(":")
  if (!ivB64 || !dataB64) {
    throw new Error("Invalid encrypted payload format.")
  }
  const iv = Buffer.from(ivB64, "base64")
  if (iv.length !== IV_LENGTH) {
    throw new Error("Invalid IV length.")
  }
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(dataB64, "base64")),
    decipher.final(),
  ])
  return decrypted.toString("utf8")
}
