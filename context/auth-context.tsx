"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { initializeApp } from "firebase/app"
import { onAuthStateChanged, type User, signOut } from "firebase/auth"
import { initializeAuth, getReactNativePersistence } from "firebase/auth"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { saveUserData, clearUserData, getAuthToken } from "../utils/auth-utils"
import { getUserProfile } from "../utils/user-service"

// Initialize Firebase - replace with your config
const firebaseConfig = {
  apiKey: "AIzaSyCauUU-mT9RDw3UXhBhw3H-OTGVOdHDCbM",
  authDomain: "aether-atombase.firebaseapp.com",
  projectId: "aether-atombase",
  storageBucket: "aether-atombase.firebasestorage.app",
  messagingSenderId: "439269810531",
  appId: "1:439269810531:web:1b3347c5c512705a503356",
  measurementId: "G-4WN80R3MMJ",
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
})

type AuthContextType = {
  user: User | null
  loading: boolean
  onboardingCompleted: boolean | null
  checkOnboardingStatus: () => Promise<boolean>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  onboardingCompleted: null,
  checkOnboardingStatus: async () => false,
  logout: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser)
        await saveUserData(firebaseUser)

        // Check onboarding status when user is authenticated
        await checkOnboardingStatus()
      } else {
        // Check if we have a stored token
        const token = await getAuthToken()
        if (!token) {
          setUser(null)
          setOnboardingCompleted(null)
          await clearUserData()
        }
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const checkOnboardingStatus = async (): Promise<boolean> => {
    if (user?.uid) {
      try {
        const userProfile = await getUserProfile(user.uid)
        const completed = userProfile?.onboardingCompleted || false
        setOnboardingCompleted(completed)
        return completed
      } catch (error) {
        console.error("Error checking onboarding status:", error)
        setOnboardingCompleted(false)
        return false
      }
    }
    return false
  }

  const logout = async () => {
    try {
      console.log("Attempting to sign out...")
      await signOut(auth)
      console.log("Firebase sign out successful")

      setUser(null)
      setOnboardingCompleted(null)

      console.log("Clearing user data from secure storage...")
      await clearUserData()
      console.log("Logout process completed")
    } catch (error) {
      console.error("Error logging out:", error)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        onboardingCompleted,
        checkOnboardingStatus,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
