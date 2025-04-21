"use client"

import { Stack } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { useFonts } from "expo-font"
import { useEffect } from "react"
import * as SplashScreen from "expo-splash-screen"
import { AuthProvider } from "../context/auth-context"
import * as Linking from "expo-linking"
import { OnboardingProvider } from "../context/onboarding-context"

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync()

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

  return (
    <AuthProvider>
      <OnboardingProvider>
        <StatusBar style="light" />
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
      </OnboardingProvider>
    </AuthProvider>
  )
}
