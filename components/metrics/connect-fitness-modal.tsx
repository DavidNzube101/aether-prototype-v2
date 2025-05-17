"use client"

import { useState } from "react"
import { Modal, View, Text, StyleSheet, TouchableOpacity, Platform, ActivityIndicator, ScrollView, Image } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useAuth } from "../../context/auth-context"
import { connectAppleHealth } from "../../services/health-service"
import { connectGoogleFit } from "../../services/google-fit-service"

interface ConnectFitnessModalProps {
  visible: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function ConnectFitnessModal({ visible, onClose, onSuccess }: ConnectFitnessModalProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const isAndroid = Platform.OS === "android"
  const isIOS = Platform.OS === "ios"

  // Connect to Google Fit
  const handleConnectGoogleFit = async () => {
    if (!isAndroid) {
      setError("Google Fit is only available on Android devices")
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      if (user?.uid) {
        // Use the service to connect to Google Fit
        await connectGoogleFit(user.uid)
        setSuccess("Successfully connected to Google Fit!")

        // Notify parent component
        setTimeout(() => {
          onSuccess()
        }, 1500)
      } else {
        throw new Error("User not authenticated")
      }
    } catch (err) {
      console.error("Error connecting to Google Fit:", err)
      setError(err instanceof Error ? err.message : "Failed to connect to Google Fit")
    } finally {
      setLoading(false)
    }
  }

  // Connect to Apple Health
  const handleConnectAppleHealth = async () => {
    if (!isIOS) {
      setError("Apple Health is only available on iOS devices")
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      if (user?.uid) {
        // Use the service to connect to Apple Health
        await connectAppleHealth(user.uid)
        setSuccess("Successfully connected to Apple Health!")

        // Notify parent component
        setTimeout(() => {
          onSuccess()
        }, 1500)
      } else {
        throw new Error("User not authenticated")
      }
    } catch (err) {
      console.error("Error connecting to Apple Health:", err)
      setError(err instanceof Error ? err.message : "Failed to connect to Apple Health")
    } finally {
      setLoading(false)
    }
  }

  // Add console logs to help debug the modal rendering
  console.log("ConnectFitnessModal rendering with visible =", visible)
  console.log("Platform:", { isAndroid, isIOS })

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Connect Fitness Provider</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
            <Text style={styles.description}>
              Connect your fitness provider to automatically track your workouts and earn rewards for your activities.
            </Text>

            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {success && (
              <View style={styles.successContainer}>
                <Text style={styles.successText}>{success}</Text>
              </View>
            )}

            {/* Google Fit Option */}
            <TouchableOpacity
              style={[styles.providerOption, isAndroid && styles.recommendedOption]}
              onPress={handleConnectGoogleFit}
              disabled={loading || !isAndroid}
            >
              <View style={styles.providerIconContainer}>
                <Ionicons name="logo-google" size={24} color="#FFFFFF" />
              </View>
              <View style={styles.providerInfo}>
                <Text style={styles.providerName}>Google Fit</Text>
                <Text style={styles.providerDescription}>Connect with Google's fitness tracking platform</Text>
              </View>
              {isAndroid && (
                <View style={styles.recommendedBadge}>
                  <Text style={styles.recommendedText}>Recommended</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Apple Health Option */}
            <TouchableOpacity
              style={[styles.providerOption, isIOS && styles.recommendedOption]}
              onPress={handleConnectAppleHealth}
              disabled={loading || !isIOS}
            >
              <View style={styles.providerIconContainer}>
                <Ionicons name="logo-apple" size={24} color="#FFFFFF" />
              </View>
              <View style={styles.providerInfo}>
                <Text style={styles.providerName}>Apple Health</Text>
                <Text style={styles.providerDescription}>Connect with Apple's health tracking system</Text>
              </View>
              {isIOS && (
                <View style={styles.recommendedBadge}>
                  <Text style={styles.recommendedText}>Recommended</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Fitbit Option (Disabled) */}
            <View style={[styles.providerOption, styles.disabledOption]}>
              <View style={styles.providerIconContainer}>
                <Image source={require("../../assets/images/metrics/icons8-fitbit-500.png")} style={styles.providerIcon}></Image>
              </View>
              <View style={styles.providerInfo}>
                <Text style={[styles.providerName, styles.disabledText]}>Fitbit</Text>
                <Text style={[styles.providerDescription, styles.disabledText]}>Coming soon</Text>
              </View>
              <View style={styles.comingSoonBadge}>
                <Text style={styles.comingSoonText}>Coming Soon</Text>
              </View>
            </View>
          </ScrollView>

          {loading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#FFFFFF" />
              <Text style={styles.loadingText}>Connecting...</Text>
            </View>
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
    maxHeight: "80%",
    minHeight: 450, // Add this line
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
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  description: {
    color: "#CCCCCC",
    fontSize: 16,
    marginBottom: 20,
    lineHeight: 22,
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
    color: "#ffffff",
    textAlign: "center",
  },
  providerOption: {
    flexDirection: "row",
    backgroundColor: "#222222",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    alignItems: "center",
    position: "relative",
  },
  recommendedOption: {
    borderColor: "#ffffff",
    borderWidth: 1,
  },
  disabledOption: {
    opacity: 0.6,
  },
  providerIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#333333",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  providerIcon: {
    width: 30,
    height: 30,
  },
  disabledIcon: {
    opacity: 0.5,
  },
  providerInfo: {
    flex: 1,
  },
  providerName: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  providerDescription: {
    color: "#CCCCCC",
    fontSize: 14,
  },
  disabledText: {
    color: "#888888",
  },
  recommendedBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#ffffff",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  recommendedText: {
    color: "#000000",
    fontSize: 10,
    fontWeight: "bold",
  },
  comingSoonBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#666666",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  comingSoonText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "bold",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
  },
  loadingText: {
    color: "#FFFFFF",
    marginTop: 10,
  },
})
