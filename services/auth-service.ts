import {
    getAuth,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    sendPasswordResetEmail,
    signOut,
  } from "firebase/auth"
  import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore"
  import * as SecureStore from "expo-secure-store"
  
  // Keys for secure storage
  const USER_TOKEN_KEY = "user_auth_token"
  const USER_DATA_KEY = "user_data"
  
  // Initialize Firestore
  const db = getFirestore()
  
  /**
   * User interface
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
  
  /**
   * Sign in with email and password
   * @param email User email
   * @param password User password
   * @returns User object
   */
  export async function signInWithEmail(email: string, password: string): Promise<User> {
    const auth = getAuth()
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
  
    // Save user data to secure storage
    await saveUserData(userCredential.user as User)
  
    // Check if wallet data exists, if not initialize it
    await initializeUserWallet(userCredential.user.uid)
  
    return userCredential.user as User
  }
  
  /**
   * Create a new user account
   * @param email User email
   * @param password User password
   * @returns User object
   */
  export async function createAccount(email: string, password: string): Promise<User> {
    const auth = getAuth()
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
  
    // Save user data to secure storage
    await saveUserData(userCredential.user as User)
  
    // Initialize wallet data for new user
    await initializeUserWallet(userCredential.user.uid)
  
    return userCredential.user as User
  }
  
  /**
   * Initialize user wallet in Firestore
   * @param userId User ID
   */
  export async function initializeUserWallet(userId: string): Promise<void> {
    try {
      const userRef = doc(db, "users", userId)
      const userDoc = await getDoc(userRef)
  
      if (userDoc.exists()) {
        const userData = userDoc.data()
  
        // Only initialize wallet if it doesn't exist
        if (userData.walletBalance === undefined) {
          await setDoc(
            userRef,
            {
              walletBalance: 0,
              walletAddress: generateWalletAddress(),
              updatedAt: new Date().toISOString(),
            },
            { merge: true },
          )
        }
      } else {
        // Create new user document with wallet data
        await setDoc(userRef, {
          walletBalance: 0,
          walletAddress: generateWalletAddress(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
      }
    } catch (error) {
      console.error("Error initializing user wallet:", error)
      throw error
    }
  }
  
  /**
   * Generate a random wallet address
   * @returns Random wallet address
   */
  function generateWalletAddress(): string {
    const chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"
    let result = ""
    for (let i = 0; i < 44; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }
  
  /**
   * Save user authentication data to secure storage
   * @param user User object
   */
  export async function saveUserData(user: User): Promise<boolean> {
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
  
  /**
   * Reset password
   * @param email User email
   */
  export async function resetPassword(email: string): Promise<void> {
    const auth = getAuth()
    await sendPasswordResetEmail(auth, email)
  }
  