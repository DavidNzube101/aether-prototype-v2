"use client"

import { useState, useEffect } from "react"
import { Modal, View, StyleSheet, TouchableOpacity, Text, ActivityIndicator } from "react-native"
import { WebView } from "react-native-webview"
import * as SecureStore from "expo-secure-store"
import { getAuth, signInWithCustomToken } from "firebase/auth"
import { Ionicons } from "@expo/vector-icons"

// Auth token key for secure storage
const AUTH_TOKEN_KEY = "user_auth_token"

interface AuthWebViewModalProps {
  visible: boolean
  onClose: () => void
  onSuccess: () => void
  authUrl: string
}

export default function AuthWebViewModal({ visible, onClose, onSuccess, authUrl }: AuthWebViewModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [processingAuth, setProcessingAuth] = useState(false)

  // Reset state when modal visibility changes
  useEffect(() => {
    if (visible) {
      setError(null)
      setLoading(true)
    }
  }, [visible])

  // Handle URL changes in the WebView
  const handleNavigationStateChange = async (navState: { url: string }) => {
    console.log("WebView navigating to:", navState.url)

    // Check if the URL is our custom scheme redirect
    if (navState.url.startsWith("aetherfit://auth")) {
      // Prevent handling the same URL multiple times
      if (processingAuth) return
      setProcessingAuth(true)

      try {
        console.log("Detected auth redirect URL:", navState.url)

        // Parse the URL to extract the token
        const urlObj = new URL(navState.url)
        const token = urlObj.searchParams.get("token")

        console.log("Extracted token:", token ? "Token found" : "No token")

        if (!token) {
          throw new Error("No authentication token received")
        }

        // Store the token securely
        await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token)
        console.log("Token stored in SecureStore")

        // Authenticate with Firebase using the custom token
        const auth = getAuth()
        try {
          console.log("Attempting Firebase authentication with token")
          await signInWithCustomToken(auth, token)
          console.log("Firebase authentication successful")

          // Notify parent component of successful authentication
          onSuccess()
        } catch (firebaseError) {
          console.error("Firebase auth error:", firebaseError)
          throw new Error("Firebase authentication failed")
        }
      } catch (err) {
        console.error("Authentication error:", err)
        setError(err instanceof Error ? err.message : "Authentication failed")
        setProcessingAuth(false)
      }
    }
  }

  // Custom JavaScript to inject into WebView to handle deep links
  const injectedJavaScript = `
    (function() {
      window.addEventListener('message', function(event) {
        if (event.data && event.data.type === 'AUTH_SUCCESS' && event.data.token) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'AUTH_SUCCESS',
            token: event.data.token
          }));
        }
      });

      // Override window.location.href setter
      const originalHref = Object.getOwnPropertyDescriptor(window.location, 'href');
      Object.defineProperty(window.location, 'href', {
        set: function(value) {
          if (value.startsWith('aetherfit://')) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'DEEP_LINK',
              url: value
            }));
            return value;
          }
          return originalHref.set.call(this, value);
        },
        get: function() {
          return originalHref.get.call(this);
        }
      });

      true;
    })();
  `

  // Handle messages from WebView
  const handleWebViewMessage = async (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data)
      console.log("Received message from WebView:", data.type)

      if (data.type === "DEEP_LINK" && data.url.startsWith("aetherfit://auth")) {
        // Extract token from URL
        const urlObj = new URL(data.url)
        const token = urlObj.searchParams.get("token")

        if (token) {
          // Store the token securely
          await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token)

          // Authenticate with Firebase
          const auth = getAuth()
          await signInWithCustomToken(auth, token)

          // Notify parent component
          onSuccess()
        }
      } else if (data.type === "AUTH_SUCCESS" && data.token) {
        // Handle direct token passing
        await SecureStore.setItemAsync(AUTH_TOKEN_KEY, data.token)

        const auth = getAuth()
        await signInWithCustomToken(auth, data.token)

        onSuccess()
      }
    } catch (err) {
      console.error("Error handling WebView message:", err)
      setError("Failed to process authentication")
    }
  }

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Authentication</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={() => setError(null)}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <WebView
              source={{ uri: authUrl }}
              style={styles.webView}
              onNavigationStateChange={handleNavigationStateChange}
              onLoad={() => setLoading(false)}
              onError={(syntheticEvent) => {
                const { nativeEvent } = syntheticEvent
                setError(`WebView error: ${nativeEvent.description}`)
              }}
              startInLoadingState={true}
              renderLoading={() => (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#FFFFFF" />
                  <Text style={styles.loadingText}>Loading authentication page...</Text>
                </View>
              )}
              injectedJavaScript={injectedJavaScript}
              onMessage={handleWebViewMessage}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              originWhitelist={["*"]}
              allowsInlineMediaPlayback={true}
            />
          )}
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    height: "80%",
    backgroundColor: "#1A1A1A",
    borderRadius: 20,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#000000",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  closeButton: {
    padding: 5,
  },
  webView: {
    flex: 1,
    backgroundColor: "#1A1A1A",
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1A1A1A",
  },
  loadingText: {
    color: "#FFFFFF",
    marginTop: 10,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: "#FF3B30",
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  retryButtonText: {
    color: "#000000",
    fontWeight: "bold",
  },
})
