import * as Crypto from "expo-crypto"

/**
 * Generate a secure random string
 * @param length Length of the string to generate
 * @returns Random string
 */
export function generateRandomString(length = 32): string {
  const array = new Uint8Array(length)
  crypto.getRandomValues(array)
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0"))
    .join("")
    .substring(0, length)
}

/**
 * Hash a string using SHA-256
 * @param data String to hash
 * @returns Hashed string
 */
export async function hashString(data: string): Promise<string> {
  return await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, data)
}

/**
 * Hash a string with a salt using SHA-256
 * @param data String to hash
 * @param salt Salt for hashing
 * @returns Hashed string
 */
export async function hashWithSalt(data: string, salt: string): Promise<string> {
  const dataWithSalt = data + salt
  return await hashString(dataWithSalt)
}

/**
 * Generate a secure wallet address
 * @returns Wallet address string
 */
export function generateWalletAddress(): string {
  const chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"
  let result = ""
  const array = new Uint8Array(44)
  crypto.getRandomValues(array)

  for (let i = 0; i < 44; i++) {
    result += chars.charAt(array[i] % chars.length)
  }

  return result
}
