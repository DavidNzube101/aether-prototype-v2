import * as SecureStore from "expo-secure-store"
import * as Crypto from "expo-crypto"
import { getFirestore, doc, getDoc, setDoc, updateDoc } from "firebase/firestore"

// Keys for secure storage
const WALLET_PIN_KEY = "wallet_pin"
const WALLET_PIN_SALT_KEY = "wallet_pin_salt"

// Initialize Firestore
const db = getFirestore()

/**
 * Hash a PIN with a salt using SHA-256
 * @param pin PIN to hash
 * @param salt Salt for hashing
 * @returns Hashed PIN
 */
async function hashPin(pin: string, salt: string): Promise<string> {
  const pinWithSalt = pin + salt
  const hashedPin = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, pinWithSalt)
  return hashedPin
}

/**
 * Generate a random salt
 * @returns Random salt string
 */
function generateSalt(): string {
  const array = new Uint8Array(16)
  crypto.getRandomValues(array)
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("")
}

/**
 * Set a wallet PIN for a user
 * @param userId User ID
 * @param pin PIN to set
 * @returns Success status
 */
export async function setWalletPin(userId: string, pin: string): Promise<boolean> {
  try {
    // Generate a random salt
    const salt = generateSalt()

    // Hash the PIN with the salt
    const hashedPin = await hashPin(pin, salt)

    // Store the salt in secure storage
    await SecureStore.setItemAsync(WALLET_PIN_SALT_KEY, salt)

    // Store the hashed PIN in secure storage
    await SecureStore.setItemAsync(WALLET_PIN_KEY, hashedPin)

    // Update the user's wallet document to indicate PIN protection
    const walletRef = doc(db, "userWallets", userId)
    const walletDoc = await getDoc(walletRef)

    if (walletDoc.exists()) {
      // Update existing wallet document
      await updateDoc(walletRef, {
        pinProtected: true,
        pinHash: hashedPin, // Store the hash in Firestore
        pinSalt: salt, // Store the salt in Firestore
        updatedAt: new Date().toISOString(),
      })
    } else {
      // Create new wallet document
      await setDoc(walletRef, {
        pinProtected: true,
        pinHash: hashedPin,
        pinSalt: salt,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
    }

    return true
  } catch (error) {
    console.error("Error setting wallet PIN:", error)
    return false
  }
}

/**
 * Verify a wallet PIN
 * @param userId User ID
 * @param pin PIN to verify
 * @returns Success status
 */
export async function verifyWalletPin(userId: string, pin: string): Promise<boolean> {
  try {
    // Get the salt from secure storage
    const salt = await SecureStore.getItemAsync(WALLET_PIN_SALT_KEY)

    if (!salt) {
      // If no salt is found, try to get it from Firestore
      const walletRef = doc(db, "userWallets", userId)
      const walletDoc = await getDoc(walletRef)

      if (walletDoc.exists() && walletDoc.data().pinSalt) {
        const firestoreSalt = walletDoc.data().pinSalt
        // Save the salt to secure storage for future use
        await SecureStore.setItemAsync(WALLET_PIN_SALT_KEY, firestoreSalt)

        // Hash the PIN with the retrieved salt
        const hashedPin = await hashPin(pin, firestoreSalt)

        // Compare with the stored hash in Firestore
        return hashedPin === walletDoc.data().pinHash
      }

      return false
    }

    // Hash the PIN with the retrieved salt
    const hashedPin = await hashPin(pin, salt)

    // Get the stored hashed PIN
    const storedHashedPin = await SecureStore.getItemAsync(WALLET_PIN_KEY)

    // Compare the hashed PINs
    return hashedPin === storedHashedPin
  } catch (error) {
    console.error("Error verifying wallet PIN:", error)
    return false
  }
}

/**
 * Remove wallet PIN protection
 * @param userId User ID
 * @returns Success status
 */
export async function removeWalletPin(userId: string): Promise<boolean> {
  try {
    // Remove PIN from secure storage
    await SecureStore.deleteItemAsync(WALLET_PIN_KEY)
    await SecureStore.deleteItemAsync(WALLET_PIN_SALT_KEY)

    // Update the user's wallet document
    const walletRef = doc(db, "userWallets", userId)
    await updateDoc(walletRef, {
      pinProtected: false,
      pinHash: null,
      pinSalt: null,
      updatedAt: new Date().toISOString(),
    })

    return true
  } catch (error) {
    console.error("Error removing wallet PIN:", error)
    return false
  }
}

/**
 * Check if wallet is PIN protected
 * @param userId User ID
 * @returns Protection status
 */
export async function isWalletPinProtected(userId: string): Promise<boolean> {
  try {
    // Check secure storage first
    const storedPin = await SecureStore.getItemAsync(WALLET_PIN_KEY)

    if (storedPin) {
      return true
    }

    // If not found in secure storage, check Firestore
    const walletRef = doc(db, "userWallets", userId)
    const walletDoc = await getDoc(walletRef)

    if (walletDoc.exists()) {
      return walletDoc.data().pinProtected === true
    }

    return false
  } catch (error) {
    console.error("Error checking wallet PIN protection:", error)
    return false
  }
}
