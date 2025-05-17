"use client"
import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
} from "react-native"
import { useRouter } from "expo-router"
import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import AuthWebViewModal from "../components/auth/auth-webview-modal"
import * as Linking from "expo-linking"
import { useAuth } from "../context/auth-context"

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
const auth = getAuth(app)

const devUrl = Platform.OS === "ios" ? "http://10.88.0.3:1309/login" : "http://10.0.2.2:1309/login" // 10.0.2.2 for android emulator
const developmentEnvironment: boolean = false

const WEB_AUTH_URL = developmentEnvironment ? devUrl : "https://aether-fit.vercel.app/login" // Prod URL

export default function Login() {
  const router = useRouter()
  const { user, onboardingCompleted, checkOnboardingStatus } = useAuth()

  const [loading, setLoading] = useState(false)
  const [authError, setAuthError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [showAuthWebView, setShowAuthWebView] = useState(false)

  // Set up deep linking handler
  useEffect(() => {
    // Register the deep link handler
    const subscription = Linking.addEventListener("url", handleDeepLink)

    return () => {
      subscription.remove()
    }
  }, [])

  // Handle deep links
  const handleDeepLink = ({ url }: { url: string }) => {
    console.log("Deep link received in login screen:", url)

    // If it's an auth deep link, extract the token
    if (url.startsWith("aetherfit://auth")) {
      setShowAuthWebView(false) // Close the WebView if it's open
    }
  }

  // Check if user is already authenticated and redirect accordingly
  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      if (user) {
        setLoading(true)

        // Check onboarding status
        const isOnboardingCompleted = await checkOnboardingStatus()

        // Navigate based on onboarding status
        if (isOnboardingCompleted) {
          router.replace("/(tabs)/home")
        } else {
          router.replace("/KYU/onboarding")
        }

        setLoading(false)
      }
    }

    checkAuthAndRedirect()
  }, [user])

  // Handle authentication success
  const handleAuthSuccess = async () => {
    setShowAuthWebView(false)
    setSuccessMessage("Authentication successful!")
    setLoading(true)

    // Check onboarding status after successful authentication
    const isOnboardingCompleted = await checkOnboardingStatus()

    // Short delay to show success message before navigation
    setTimeout(() => {
      if (isOnboardingCompleted) {
        router.replace("/(tabs)/home")
      } else {
        router.replace("/KYU/onboarding")
      }
    }, 1000)
  }

  // Open authentication WebView
  const handleAuthenticate = () => {
    setAuthError("")
    setSuccessMessage("")
    setShowAuthWebView(true)
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <View style={styles.logoContainer}>
          <Image source={require("../assets/logo.png")} style={styles.logo} />
          <Text style={styles.appName}>Aether Fit</Text>
        </View>

        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>
          Gamifying the Fitness market — Leveraging cryptocurrency staking to incentivize users to complete fitness
          challenges.
        </Text>

        {authError ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{authError}</Text>
          </View>
        ) : null}

        {successMessage ? (
          <View style={styles.successContainer}>
            <Text style={styles.successText}>{successMessage}</Text>
          </View>
        ) : null}

        <View style={styles.formContainer}>
          <TouchableOpacity style={styles.authenticateButton} onPress={handleAuthenticate}>
            <Text style={styles.authenticateButtonText}>Authenticate</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Authentication WebView Modal */}
      <AuthWebViewModal
        visible={showAuthWebView}
        onClose={() => setShowAuthWebView(false)}
        onSuccess={handleAuthSuccess}
        authUrl={WEB_AUTH_URL}
      />

      {/* Loading Overlay */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#FFFFFF" />
        </View>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  scrollView: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  logo: {
    width: 80,
    height: 80,
    resizeMode: "contain",
    borderRadius: 40,
  },
  appName: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: "#CCCCCC",
    marginBottom: 40,
    lineHeight: 22,
  },
  formContainer: {
    width: "100%",
    alignItems: "center",
  },
  errorContainer: {
    backgroundColor: "rgba(255, 59, 48, 0.2)",
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
  errorText: {
    color: "#FF3B30",
    textAlign: "center",
  },
  successContainer: {
    backgroundColor: "rgba(52, 199, 89, 0.2)",
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
  successText: {
    color: "#34C759",
    textAlign: "center",
  },
  authenticateButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 30,
    height: 56,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  authenticateButtonText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "bold",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
})
