import { getAuth, signOut } from "firebase/auth"
import * as SecureStore from "expo-secure-store"

// Keys for secure storage
const USER_TOKEN_KEY = "user_auth_token"
const USER_DATA_KEY = "user_data"

/**
 * Save user authentication data to secure storage
 */

export interface User {
    uid: string
    email: string | null
    displayName: string | null
    phoneNumber: string | null
    photoURL: string | null
    providerId: string
    metadata?: {
      creationTime?: string
      lastSignInTime?: string
    }
    stsTokenManager?: {
      accessToken?: string
    }
  }
  
export async function saveUserData(user: User) {
  try {
    // Store user token
    if (user.stsTokenManager?.accessToken) {
      await SecureStore.setItemAsync(USER_TOKEN_KEY, user.stsTokenManager.accessToken)
    }

    // Store user data
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
 * Get user data from secure storage
 */
export async function getUserData() {
  try {
    const userData = await SecureStore.getItemAsync(USER_DATA_KEY)
    return userData ? JSON.parse(userData) : null
  } catch (error) {
    console.error("Error getting user data:", error)
    return null
  }
}

/**
 * Get authentication token from secure storage
 */
export async function getAuthToken() {
  try {
    return await SecureStore.getItemAsync(USER_TOKEN_KEY)
  } catch (error) {
    console.error("Error getting auth token:", error)
    return null
  }
}

/**
 * Clear user authentication data from secure storage
 */
export async function clearUserData() {
  try {
    await SecureStore.deleteItemAsync(USER_TOKEN_KEY)
    await SecureStore.deleteItemAsync(USER_DATA_KEY)
    return true
  } catch (error) {
    console.error("Error clearing user data:", error)
    return false
  }
}

/**
 * Sign out the current user
 */
export async function logoutUser() {
  try {
    const auth = getAuth()
    await signOut(auth)
    await clearUserData()
    return true
  } catch (error) {
    console.error("Error logging out:", error)
    return false
  }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated() {
  const token = await getAuthToken()
  return !!token
}
