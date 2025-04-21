import * as SecureStore from "expo-secure-store"
import { getAuth, signInWithCustomToken, type User } from "firebase/auth"

// Keys for secure storage
const AUTH_TOKEN_KEY = "user_auth_token"
const USER_DATA_KEY = "user_data"

/**
 * Save authentication token to secure storage
 */
export async function saveAuthToken(token: string): Promise<boolean> {
  try {
    await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token)
    return true
  } catch (error) {
    console.error("Error saving auth token:", error)
    return false
  }
}

/**
 * Get authentication token from secure storage
 */
export async function getAuthToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(AUTH_TOKEN_KEY)
  } catch (error) {
    console.error("Error getting auth token:", error)
    return null
  }
}

/**
 * Validate token with Firebase and sign in
 */
export async function validateAndSignIn(token: string): Promise<User | null> {
  try {
    const auth = getAuth()
    const userCredential = await signInWithCustomToken(auth, token)
    return userCredential.user
  } catch (error) {
    console.error("Error validating token:", error)
    return null
  }
}

/**
 * Save user data to secure storage
 */
export async function saveUserData(user: User): Promise<boolean> {
  try {
    const userData = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      providerId: user.providerId,
      createdAt: user.metadata?.creationTime,
      lastLoginAt: user.metadata?.lastSignInTime,
    }

    await SecureStore.setItemAsync(USER_DATA_KEY, JSON.stringify(userData))
    return true
  } catch (error) {
    console.error("Error saving user data:", error)
    return false
  }
}

/**
 * Clear authentication data from secure storage
 * This function was missing and causing the error
 */
export async function clearUserData(): Promise<boolean> {
  try {
    await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY)
    await SecureStore.deleteItemAsync(USER_DATA_KEY)
    console.log("User data and auth token cleared from secure storage")
    return true
  } catch (error) {
    console.error("Error clearing user data:", error)
    return false
  }
}

/**
 * Clear authentication token from secure storage
 */
export async function clearAuthToken(): Promise<boolean> {
  try {
    await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY)
    return true
  } catch (error) {
    console.error("Error clearing auth token:", error)
    return false
  }
}

/**
 * Check if user has a valid auth token
 */
export async function hasValidAuthToken(): Promise<boolean> {
  const token = await getAuthToken()
  return !!token
}
