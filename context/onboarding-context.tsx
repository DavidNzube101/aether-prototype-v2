"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"
import { useRouter, usePathname } from "expo-router"
import { useAuth } from "./auth-context"
import { hasCompletedOnboarding } from "../utils/user-service"

type OnboardingContextType = {
  isOnboardingCompleted: boolean
  setOnboardingCompleted: (value: boolean) => void
  checkOnboardingStatus: () => Promise<void>
}

const OnboardingContext = createContext<OnboardingContextType>({
  isOnboardingCompleted: false,
  setOnboardingCompleted: () => {},
  checkOnboardingStatus: async () => {},
})

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [isOnboardingCompleted, setIsOnboardingCompleted] = useState<boolean>(false)
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const setOnboardingCompleted = (value: boolean) => {
    setIsOnboardingCompleted(value)
  }

  const checkOnboardingStatus = async () => {
    if (user?.uid) {
      try {
        const completed = await hasCompletedOnboarding(user.uid)
        setIsOnboardingCompleted(completed)

        // Redirect to onboarding if not completed and not already on login or onboarding screen
        if (!completed && !pathname.includes("/login") && !pathname.includes("/KYU/onboarding")) {
          router.replace("/KYU/onboarding")
        }
      } catch (error) {
        console.error("Error checking onboarding status:", error)
      }
    }
  }

  // Check onboarding status when user changes
  useEffect(() => {
    if (!loading && user) {
      checkOnboardingStatus()
    }
  }, [user, loading])

  return (
    <OnboardingContext.Provider
      value={{
        isOnboardingCompleted,
        setOnboardingCompleted,
        checkOnboardingStatus,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  )
}

export const useOnboarding = () => useContext(OnboardingContext)
