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
  Modal,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native"

import type { User } from "../utils/auth"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { initializeApp } from "firebase/app"
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithCredential,
  GoogleAuthProvider,
  onAuthStateChanged,
  type AuthError,
  AuthErrorCodes,
} from "firebase/auth"
import * as Google from "expo-auth-session/providers/google"
import * as WebBrowser from "expo-web-browser"

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

// Register for Google Sign-In
WebBrowser.maybeCompleteAuthSession()

// Email validation function
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export default function Login() {
  const router = useRouter()

  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const [authError, setAuthError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  // Modal states
  const [showWalletModal, setShowWalletModal] = useState(false)
  const [showAppleModal, setShowAppleModal] = useState(false)
  const [showEmailModal, setShowEmailModal] = useState(false)

  // Form states
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isNewAccount, setIsNewAccount] = useState(false)

  // Google Sign-in
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: "YOUR_EXPO_CLIENT_ID",
    iosClientId: "1:439269810531:ios:67ce420eb56cb8c1503356",
    androidClientId: "1:439269810531:android:1f4dad00bf7fa6cd503356",
    webClientId: "1:439269810531:web:1b3347c5c512705a503356",
  })

  // Check if user is already authenticated
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user)
        // Navigate to main app if already authenticated
        router.push("/(tabs)/home")
      }
    })

    return () => unsubscribe()
  }, [])

  // Handle Google Sign-in response
  useEffect(() => {
    if (response?.type === "success") {
      setLoading(true)
      const { id_token } = response.params
      const credential = GoogleAuthProvider.credential(id_token)
      signInWithCredential(auth, credential)
        .then((result) => {
          setUser(result.user)
          router.push("/(tabs)/home")
        })
        .catch((error) => {
          setAuthError((error as Error).message || "An unknown error occurred")
        })
        .finally(() => {
          setLoading(false)
        })
    }
  }, [response])

  // Enhanced email login/signup function
  const handleEmailLogin = async () => {
    // Reset states
    setAuthError("")
    setSuccessMessage("")
    setIsNewAccount(false)

    // Validate inputs
    if (!email || !password) {
      setAuthError("Email and password are required")
      return
    }

    if (!isValidEmail(email)) {
      setAuthError("Please enter a valid email address")
      return
    }

    if (password.length < 6) {
      setAuthError("Password must be at least 6 characters")
      return
    }

    setLoading(true)

    try {
      // First attempt to sign in
      try {
        console.log("Attempting to sign in with:", email)
        const userCredential = await signInWithEmailAndPassword(auth, email, password)
        console.log("Sign in successful")

        setSuccessMessage("Login successful!")
        setUser(userCredential.user)

        // Short delay to show success message before navigation
        setTimeout(() => {
          router.push("/(tabs)/home")
        }, 500)

        return
      } catch (error) {
        const firebaseError = error as AuthError
        console.log("Sign in error:", firebaseError.code)

        // Handle specific error cases
        if (
          firebaseError.code === AuthErrorCodes.USER_DELETED ||
          firebaseError.code === "auth/user-not-found" ||
          firebaseError.code === "auth/invalid-credential"
        ) {
          // User doesn't exist, try to create a new account
          console.log("User not found, attempting to create account")
          try {
            const newUserCredential = await createUserWithEmailAndPassword(auth, email, password)
            console.log("Account creation successful")

            setIsNewAccount(true)
            setSuccessMessage("Account created successfully!")
            setUser(newUserCredential.user)

            // Short delay to show success message before navigation
            setTimeout(() => {
              router.push("/(tabs)/home")
            }, 1000)

            return
          } catch (signupError) {
            const signupFirebaseError = signupError as AuthError
            console.log("Sign up error:", signupFirebaseError.code)

            // Handle signup specific errors
            if (
              signupFirebaseError.code === AuthErrorCodes.EMAIL_EXISTS ||
              signupFirebaseError.code === "auth/email-already-in-use"
            ) {
              setAuthError(
                "This email is already registered but the password is incorrect. Please try again or reset your password.",
              )
            } else if (
              signupFirebaseError.code === AuthErrorCodes.WEAK_PASSWORD ||
              signupFirebaseError.code === "auth/weak-password"
            ) {
              setAuthError("Password is too weak. Please use a stronger password.")
            } else {
              setAuthError(signupFirebaseError.message || "Failed to create account. Please try again.")
            }
          }
        } else if (
          firebaseError.code === AuthErrorCodes.INVALID_PASSWORD ||
          firebaseError.code === "auth/wrong-password"
        ) {
          setAuthError("Incorrect password. Please try again or reset your password.")
        } else if (
          firebaseError.code === AuthErrorCodes.TOO_MANY_ATTEMPTS_TRY_LATER ||
          firebaseError.code === "auth/too-many-requests"
        ) {
          setAuthError("Too many failed login attempts. Please try again later or reset your password.")
        } else if (firebaseError.code === "auth/network-request-failed") {
          setAuthError("Network error. Please check your internet connection and try again.")
        } else {
          setAuthError(firebaseError.message || "Authentication failed. Please try again.")
        }
      }
    } finally {
      setLoading(false)
    }
  }

  // Reset password
  const handleResetPassword = async () => {
    setAuthError("")
    setSuccessMessage("")

    if (!email) {
      setAuthError("Email is required to reset password")
      return
    }

    if (!isValidEmail(email)) {
      setAuthError("Please enter a valid email address")
      return
    }

    setLoading(true)
    try {
      await sendPasswordResetEmail(auth, email)
      setSuccessMessage("Password reset email sent! Check your inbox.")
    } catch (error) {
      const firebaseError = error as AuthError

      if (firebaseError.code === AuthErrorCodes.USER_DELETED || firebaseError.code === "auth/user-not-found") {
        setAuthError("No account found with this email address.")
      } else {
        setAuthError((error as Error).message || "Failed to send reset email. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  // Login with Google
  const handleGoogleLogin = async () => {
    setAuthError("")
    setSuccessMessage("")

    try {
      await promptAsync()
    } catch (error) {
      if (error instanceof Error) {
        setAuthError(error.message)
      } else {
        setAuthError("An unknown error occurred")
      }
    }
  }

  // Show wallet coming soon modal
  const showWalletComingSoon = () => {
    setShowWalletModal(true)
  }

  // Show Apple coming soon modal
  const showAppleComingSoon = () => {
    setShowAppleModal(true)
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardAvoidingView}>
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
            <TouchableOpacity style={styles.loginButton} onPress={() => setShowEmailModal(true)}>
              <View style={styles.googleButtonContent}>  
                <Ionicons name="mail" size={20} color="#000000" style={styles.googleIcon} />
                <Text style={styles.loginButtonText}>Log In with Email</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.loginButton} onPress={handleGoogleLogin}>
              <View style={styles.googleButtonContent}>
                <Ionicons name="logo-google" size={20} color="#000000" style={styles.googleIcon} />
                <Text style={styles.loginButtonText}>Log In with Google</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.loginButton2} onPress={showWalletComingSoon}>
              <View style={styles.googleButtonContent}>
                <Ionicons name="wallet" size={20} color="#ffffff" style={styles.googleIcon} />

                <Text style={styles.loginButton2Text}>Log In with Wallet</Text>
              </View>
            </TouchableOpacity>

            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>ORt</Text>
              <View style={styles.divider} />
            </View>

            <View style={styles.socialButtonsContainer}>
              {Platform.OS === "ios" && (
                <TouchableOpacity style={styles.socialButton} onPress={showAppleComingSoon}>
                  <Ionicons name="logo-apple" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Email Login Modal */}
      <Modal
        visible={showEmailModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowEmailModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Log In or Sign Up</Text>

            {authError ? (
              <View style={styles.modalErrorContainer}>
                <Text style={styles.modalErrorText}>{authError}</Text>
              </View>
            ) : null}

            {successMessage ? (
              <View style={styles.modalSuccessContainer}>
                <Text style={styles.modalSuccessText}>{successMessage}</Text>
              </View>
            ) : null}

            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#999999"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
            />

            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#999999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!loading}
            />

            <TouchableOpacity style={styles.modalButton} onPress={handleEmailLogin} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#000000" />
              ) : (
                <Text style={styles.modalButtonText}>Log In / Sign Up</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.textLink} onPress={handleResetPassword} disabled={loading}>
              <Text style={styles.textLinkText}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setShowEmailModal(false)
                setAuthError("")
                setSuccessMessage("")
              }}
              disabled={loading}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Wallet Coming Soon Modal */}
      <Modal
        visible={showWalletModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowWalletModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.walletModalContent}>
            <View style={styles.walletModalHeader}>
              <Ionicons name="wallet-outline" size={40} color="#FFFFFF" />
              <Text style={styles.walletModalTitle}>Wallet Login</Text>
            </View>

            <Text style={styles.walletModalText}>
              We're excited to announce that wallet-based authentication is coming soon to Aether Fit!
            </Text>

            <Text style={styles.walletModalSubtext}>
              Connect your crypto wallet for seamless login and access to exclusive rewards.
            </Text>

            <View style={styles.comingSoonBadge}>
              <Text style={styles.comingSoonText}>COMING SOON</Text>
            </View>

            <TouchableOpacity style={styles.closeWalletButton} onPress={() => setShowWalletModal(false)}>
              <Text style={styles.closeWalletButtonText}>Got it</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Apple Coming Soon Modal */}
      <Modal
        visible={showAppleModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowAppleModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.walletModalContent}>
            <View style={styles.walletModalHeader}>
              <Ionicons name="logo-apple" size={40} color="#FFFFFF" />
              <Text style={styles.walletModalTitle}>Apple Sign-In</Text>
            </View>

            <Text style={styles.walletModalText}>
              We're working on integrating Apple Sign-In to provide you with a seamless login experience!
            </Text>

            <Text style={styles.walletModalSubtext}>
              This feature will be available in our next update. Please use email or Google sign-in for now.
            </Text>

            <View style={styles.comingSoonBadge}>
              <Text style={styles.comingSoonText}>COMING SOON</Text>
            </View>

            <TouchableOpacity style={styles.closeWalletButton} onPress={() => setShowAppleModal(false)}>
              <Text style={styles.closeWalletButtonText}>Got it</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
  keyboardAvoidingView: {
    flex: 1,
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
  loginButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 30,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  googleButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  googleIcon: {
    marginRight: 10,
  },
  loginButton2: {
    backgroundColor: "#000000",
    borderRadius: 30,
    borderColor: "#FFFFFF",
    borderWidth: 1,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
  },
  loginButtonText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "bold",
  },
  loginButton2Text: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#333333",
  },
  dividerText: {
    color: "#CCCCCC",
    paddingHorizontal: 10,
    fontSize: 14,
  },
  socialButtonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 40,
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#333333",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
  },
  modalContent: {
    width: "85%",
    backgroundColor: "#1A1A1A",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 20,
  },
  modalErrorContainer: {
    backgroundColor: "rgba(255, 59, 48, 0.2)",
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
    width: "100%",
  },
  modalErrorText: {
    color: "#FF3B30",
    textAlign: "center",
  },
  modalSuccessContainer: {
    backgroundColor: "rgba(52, 199, 89, 0.2)",
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
    width: "100%",
  },
  modalSuccessText: {
    color: "#34C759",
    textAlign: "center",
  },
  input: {
    width: "100%",
    height: 50,
    backgroundColor: "#333333",
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 15,
    color: "#FFFFFF",
  },
  modalButton: {
    width: "100%",
    height: 50,
    backgroundColor: "#FFFFFF",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  modalButtonText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "bold",
  },
  textLink: {
    marginTop: 15,
    marginBottom: 10,
  },
  textLinkText: {
    color: "#CCCCCC",
    fontSize: 14,
  },
  closeButton: {
    marginTop: 20,
  },
  closeButtonText: {
    color: "#CCCCCC",
    fontSize: 16,
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
  walletModalContent: {
    width: "85%",
    backgroundColor: "#1A1A1A",
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#333333",
  },
  walletModalHeader: {
    alignItems: "center",
    marginBottom: 20,
  },
  walletModalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginTop: 10,
  },
  walletModalText: {
    color: "#FFFFFF",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 15,
    lineHeight: 24,
  },
  walletModalSubtext: {
    color: "#CCCCCC",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 25,
  },
  comingSoonBadge: {
    backgroundColor: "#333333",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 25,
  },
  comingSoonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 14,
  },
  closeWalletButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 30,
  },
  closeWalletButtonText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "bold",
  },
})
