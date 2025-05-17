"use client"

import { Stack } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { useFonts } from "expo-font"
import type React from "react"
import { useEffect, useState } from "react"
import * as SplashScreen from "expo-splash-screen"
import { AuthProvider, useAuth } from "../context/auth-context"
import * as Linking from "expo-linking"
import { OnboardingProvider } from "../context/onboarding-context"
import { ActivityIndicator, View, StyleSheet, Platform } from "react-native"
import { useNetInfo } from "@react-native-community/netinfo"
import NoInternetScreen from "./no-internet"
import BackgroundExecutionManager from "../services/metrics/background-execution-manager"
// import {  } from "react-native"

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync()

// Import headless task for Android
if (Platform.OS === "android") {
  require("./headless-task.ts")
}

function NavigationGuard({ children }: { children: React.ReactNode }) {
  const { user, loading, onboardingCompleted, checkOnboardingStatus } = useAuth()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    // Check onboarding status when auth state changes
    const checkStatus = async () => {
      if (!loading && user) {
        await checkOnboardingStatus()
      }
      setIsChecking(false)
    }

    checkStatus()
  }, [user, loading])

  if (loading || isChecking) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
    )
  }

  return <>{children}</>
}

export default function RootLayout() {
  // Set up deep linking handler
  useEffect(() => {
    // Define the linking configuration
    const config = {
      screens: {
        index: "",
        login: "login",
        "(tabs)": {
          screens: {
            home: "home",
          },
        },
      },
    }

    // Register the deep link handler
    const subscription = Linking.addEventListener("url", handleDeepLink)

    // Check for initial URL that launched the app
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink({ url })
      }
    })

    return () => {
      subscription.remove()
    }
  }, [])

  // Handle deep links
  const handleDeepLink = ({ url }: { url: string }) => {
    console.log("Deep link received:", url)

    // If it's an auth deep link, extract the token
    if (url.startsWith("aetherfit://auth")) {
      try {
        const urlObj = new URL(url)
        const token = urlObj.searchParams.get("token")
        console.log("Auth token from deep link:", token ? "Found token" : "No token")

        // You could handle the token here or let the WebView component handle it
      } catch (error) {
        console.error("Error parsing deep link URL:", error)
      }
    }
  }

  const [fontsLoaded] = useFonts({
    // Add your custom fonts here if needed
  })

  useEffect(() => {
    if (fontsLoaded) {
      // Hide splash screen once fonts are loaded
      SplashScreen.hideAsync()
    }
  }, [fontsLoaded])

  if (!fontsLoaded) {
    return null
  }

  const netInfo = useNetInfo()

  if (netInfo.isConnected == null) {
    return null
  }

  // If offline, show our no-internet UI:
  if (netInfo.isConnected === false) {
    return <NoInternetScreen />
  }

  // Initialize background execution
  useEffect(() => {
    const initializeBackgroundExecution = async () => {
      try {
        const backgroundManager = BackgroundExecutionManager.getInstance()
        await backgroundManager.initialize()
        await backgroundManager.startTracking()

        console.log("Background execution initialized successfully")
      } catch (error) {
        console.error("Failed to initialize background execution:", error)
      }
    }

    // Only initialize once when the app starts
    initializeBackgroundExecution()
  }, [])

  return (
    <AuthProvider>
      <OnboardingProvider>
        <StatusBar style="light" />
        <NavigationGuard>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: "#000000" },
              animation: "fade",
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="onboarding" />
            <Stack.Screen name="login" />
            <Stack.Screen name="signup" />
            <Stack.Screen
              name="(tabs)"
              options={{
                headerShown: false,
                animation: "fade_from_bottom",
              }}
            />
          </Stack>
        </NavigationGuard>
      </OnboardingProvider>
    </AuthProvider>
  )
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000000",
  },
})
