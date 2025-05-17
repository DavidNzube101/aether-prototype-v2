"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { getAuth } from "firebase/auth"
import * as SecureStore from "expo-secure-store"
import { getUserProfile, updateUserProfile } from "../../../../utils/user-service"

// Keys for secure storage
const WALLET_PIN_KEY = "wallet_pin"

export default function PrivacySecurityScreen() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: "public",
    showActivityStatus: true,
    showLastSeen: true,
  })
  const [securitySettings, setSecuritySettings] = useState({
    walletPinEnabled: false,
    biometricEnabled: false,
  })
  const auth = getAuth()

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setLoading(true)
      const user = auth.currentUser
      if (!user) {
        return
      }

      // Load privacy settings from profile
      const profile = await getUserProfile(user.uid)
      if (profile && profile.privacySettings) {
        setPrivacySettings(profile.privacySettings)
      }

      // Check if wallet PIN is set
      const walletPin = await SecureStore.getItemAsync(WALLET_PIN_KEY)
      setSecuritySettings({
        ...securitySettings,
        walletPinEnabled: !!walletPin,
      })
    } catch (error) {
      console.error("Error loading settings:", error)
    } finally {
      setLoading(false)
    }
  }

  const handlePrivacyToggle = async (setting: string, value: boolean | string) => {
    try {
      const updatedSettings = {
        ...privacySettings,
        [setting]: value,
      }

      setPrivacySettings(updatedSettings)

      const user = auth.currentUser
      if (user) {
        await updateUserProfile(user.uid, {
          privacySettings: updatedSettings,
        })
      }
    } catch (error) {
      console.error("Error updating privacy settings:", error)
    }
  }

  const handleWalletPinToggle = async (value: boolean) => {
    try {
      if (value) {
        // Enable wallet PIN - navigate to wallet screen where PIN can be set
        // router.push("/subscreens/profile/wallet-payment")
        // Show a hint to the user
        setTimeout(() => {
          Alert.alert(
            "Set Wallet PIN",
            "Tap the lock icon in the top right corner of the Wallet screen to set your PIN.",
          )
        }, 500)
      } else {
        // Disable wallet PIN
        Alert.alert("Remove Wallet PIN", "Are you sure you want to remove the PIN protection from your wallet?", [
          { text: "Cancel", style: "cancel" },
          {
            text: "Remove",
            style: "destructive",
            onPress: async () => {
              await SecureStore.deleteItemAsync(WALLET_PIN_KEY)
              setSecuritySettings({
                ...securitySettings,
                walletPinEnabled: false,
              })
            },
          },
        ])
      }
    } catch (error) {
      console.error("Error toggling wallet PIN:", error)
    }
  }

  const handleBiometricToggle = async (value: boolean) => {
    // This would normally check for biometric availability and set up authentication
    Alert.alert("Biometric Authentication", "This feature is not available in the current version.", [{ text: "OK" }])
  }

  const renderToggle = (value: boolean, onToggle: (value: boolean) => void, label: string, description: string) => {
    return (
      <View style={styles.settingItem}>
        <View style={styles.settingInfo}>
          <Text style={styles.settingLabel}>{label}</Text>
          <Text style={styles.settingDescription}>{description}</Text>
        </View>
        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={{ false: "#444444", true: "#ffffff" }}
          thumbColor="#000000"
        />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy & Security</Text>
        <View style={{ width: 30 }} />
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>Privacy</Text>
        <View style={styles.settingsSection}>
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Profile Visibility</Text>
              <Text style={styles.settingDescription}>Control who can see your profile information</Text>
            </View>
            <TouchableOpacity
              style={styles.visibilitySelector}
              onPress={() => {
                Alert.alert("Profile Visibility", "Select who can see your profile", [
                  {
                    text: "Public",
                    onPress: () => handlePrivacyToggle("profileVisibility", "public"),
                  },
                  {
                    text: "Friends Only",
                    onPress: () => handlePrivacyToggle("profileVisibility", "friends"),
                  },
                  {
                    text: "Private",
                    onPress: () => handlePrivacyToggle("profileVisibility", "private"),
                  },
                  { text: "Cancel", style: "cancel" },
                ])
              }}
            >
              <Text style={styles.visibilityText}>
                {privacySettings.profileVisibility === "public"
                  ? "Public"
                  : privacySettings.profileVisibility === "friends"
                    ? "Friends Only"
                    : "Private"}
              </Text>
              <Ionicons name="chevron-forward" size={20} color="#AAAAAA" />
            </TouchableOpacity>
          </View>

          {renderToggle(
            privacySettings.showActivityStatus,
            (value) => handlePrivacyToggle("showActivityStatus", value),
            "Activity Status",
            "Show when you're active in the app",
          )}

          {renderToggle(
            privacySettings.showLastSeen,
            (value) => handlePrivacyToggle("showLastSeen", value),
            "Last Seen",
            "Show when you were last active",
          )}
        </View>

        <Text style={styles.sectionTitle}>Security</Text>
        <View style={styles.settingsSection}>
          {renderToggle(
            securitySettings.walletPinEnabled,
            handleWalletPinToggle,
            "Wallet PIN Protection",
            "Require a PIN to access your wallet",
          )}

          {renderToggle(
            securitySettings.biometricEnabled,
            handleBiometricToggle,
            "Biometric Authentication",
            "Use fingerprint or face recognition for security",
          )}
        </View>

        <TouchableOpacity
          style={styles.dangerButton}
          onPress={() => {
            Alert.alert(
              "Delete Account",
              "Are you sure you want to delete your account? This action cannot be undone.",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Delete",
                  style: "destructive",
                  onPress: () => {
                    Alert.alert("Account Deletion", "This feature is not available in the current version.")
                  },
                },
              ],
            )
          }}
        >
          <Text style={styles.dangerButtonText}>Delete Account</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#222222",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  backButton: {
    padding: 5,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 10,
  },
  settingsSection: {
    backgroundColor: "#222222",
    borderRadius: 12,
    marginBottom: 25,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#333333",
  },
  settingInfo: {
    flex: 1,
    marginRight: 10,
  },
  settingLabel: {
    fontSize: 16,
    color: "#FFFFFF",
    marginBottom: 5,
  },
  settingDescription: {
    fontSize: 12,
    color: "#AAAAAA",
  },
  visibilitySelector: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#333333",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  visibilityText: {
    color: "#FFFFFF",
    marginRight: 5,
  },
  dangerButton: {
    backgroundColor: "#FF4136",
    borderRadius: 12,
    padding: 15,
    alignItems: "center",
    marginBottom: 30,
  },
  dangerButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },
})
