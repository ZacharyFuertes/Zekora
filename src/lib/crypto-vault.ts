const MAGIC = new TextEncoder().encode("ZEKORA-ZK1")
const SALT_LENGTH = 16
const IV_LENGTH = 12
const KEY_ITERATIONS = 310_000

function cryptoApi() {
  if (typeof window === "undefined" || !window.crypto?.subtle) {
    throw new Error("Web Crypto API is unavailable")
  }
  return window.crypto
}

/** Derive an AES-GCM key from a password using PBKDF2. */
async function deriveKey(password: string, salt: BufferSource): Promise<CryptoKey> {
  const crypto = cryptoApi()
  const material = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  )
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: KEY_ITERATIONS,
      hash: "SHA-256",
    },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  )
}

/** Check if bytes contain the expected vault encryption header. */
export function isEncryptedVaultPayload(bytes: Uint8Array) {
  return (
    bytes.length > MAGIC.length + SALT_LENGTH + IV_LENGTH &&
    MAGIC.every((value, index) => bytes[index] === value)
  )
}

/**
 * Encrypts vault data with a password using AES-GCM.
 * Output format: MAGIC(9 bytes) || salt(16 bytes) || iv(12 bytes) || ciphertext
 */
export async function encryptVaultBytes(bytes: Uint8Array, password: string) {
  if (password.length < 8) throw new Error("Vault password must be at least 8 characters")
  const crypto = cryptoApi()
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH))
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH))
  const key = await deriveKey(password, salt as BufferSource)
  const ciphertext = new Uint8Array(
    await crypto.subtle.encrypt(
      { name: "AES-GCM", iv: iv as unknown as BufferSource },
      key,
      bytes as unknown as BufferSource
    )
  )
  const output = new Uint8Array(
    MAGIC.length + salt.length + iv.length + ciphertext.length
  )
  output.set(MAGIC, 0)
  output.set(salt, MAGIC.length)
  output.set(iv, MAGIC.length + salt.length)
  output.set(ciphertext, MAGIC.length + salt.length + iv.length)
  return output
}

/**
 * Decrypts vault data with a password.
 * Returns the original bytes if the payload doesn't have the expected MAGIC header,
 * to maintain backward compatibility with non-encrypted data.
 */
export async function decryptVaultBytes(bytes: Uint8Array, password: string) {
  if (!isEncryptedVaultPayload(bytes)) {
    console.warn(
      "Decryption skipped: payload does not match expected vault format. " +
        "The data may not be encrypted, or the format has changed."
    )
    return bytes
  }
  const crypto = cryptoApi()
  const saltStart = MAGIC.length
  const ivStart = saltStart + SALT_LENGTH
  const dataStart = ivStart + IV_LENGTH
  const key = await deriveKey(password, bytes.slice(saltStart, ivStart) as BufferSource)
  try {
    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: bytes.slice(ivStart, dataStart) as unknown as BufferSource },
      key,
      bytes.slice(dataStart) as unknown as BufferSource
    )
    return new Uint8Array(decrypted)
  } catch (err) {
    console.error("Vault decryption failed:", err)
    return bytes
  }
}

export async function decryptVaultBlob(blob: Blob, password: string) {
  const decrypted = await decryptVaultBytes(new Uint8Array(await blob.arrayBuffer()), password)
  return new Blob([decrypted.buffer as ArrayBuffer], { type: blob.type })
}