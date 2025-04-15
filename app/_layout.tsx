"use client"

import { Stack } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { useFonts } from "expo-font"
import { useEffect } from "react"
import * as SplashScreen from "expo-splash-screen"

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
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
    <>
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
    </>
  )
}
