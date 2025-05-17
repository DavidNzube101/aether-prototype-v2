"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Image, ScrollView, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import * as ImagePicker from "expo-image-picker"
import { getAuth } from "firebase/auth"
import { getUserProfile, updateUserProfile, uploadImageToCloudinary } from "../../../../utils/user-service"
import type { UserProfile } from "../../../../utils/user-service"

// Supported currencies
const CURRENCIES = [
  { id: "USD", name: "US Dollar", symbol: "$" },
  { id: "EUR", name: "Euro", symbol: "€" },
  { id: "GBP", name: "British Pound", symbol: "£" },
  { id: "NGN", name: "Nigerian Naira", symbol: "₦" },
]

export default function EditProfileScreen() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState("")
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [selectedCurrency, setSelectedCurrency] = useState("USD")
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false)
  const auth = getAuth()

  useEffect(() => {
    loadUserProfile()
  }, [])

  const loadUserProfile = async () => {
    try {
      setLoading(true)
      const user = auth.currentUser
      if (!user) {
        Alert.alert("Authentication Required", "Please log in to edit your profile", [
          { text: "OK", onPress: () => router.replace("/login") },
        ])
        return
      }

      const profile = await getUserProfile(user.uid)
      if (profile) {
        setName(profile.name || user.displayName || "")
        setProfileImage(profile.profileImage || null)
        setSelectedCurrency(profile.currency?.id || "USD")
      } else {
        // Set defaults from auth user
        setName(user.displayName || "")
      }
    } catch (error) {
      console.error("Error loading profile:", error)
      Alert.alert("Error", "Failed to load profile. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handlePickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (!permissionResult.granted) {
        Alert.alert("Permission Required", "Please grant camera roll permissions to change your profile picture.")
        return
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      })

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setProfileImage(result.assets[0].uri)
      }
    } catch (error) {
      console.error("Error picking image:", error)
      Alert.alert("Error", "Failed to pick image. Please try again.")
    }
  }

  const handleSaveProfile = async () => {
    try {
      setSaving(true)
      const user = auth.currentUser
      if (!user) {
        Alert.alert("Authentication Required", "Please log in to save your profile")
        return
      }

      // Upload image if changed
      let imageUrl = profileImage
      if (profileImage && profileImage.startsWith("file:")) {
        // This is a local image that needs to be uploaded
        const uploadedUrl = await uploadImageToCloudinary(profileImage)
        if (uploadedUrl) {
          imageUrl = uploadedUrl
        } else {
          Alert.alert("Warning", "Failed to upload profile image, but other changes will be saved.")
        }
      }

      // Get selected currency object
      const currency = CURRENCIES.find((c) => c.id === selectedCurrency)

      // Update profile
      const profileData: Partial<UserProfile> = {
        name,
        profileImage: imageUrl,
        currency: currency || { id: "USD", name: "US Dollar", symbol: "$" },
        updatedAt: new Date().toISOString(),
      }

      const success = await updateUserProfile(user.uid, profileData)
      if (success) {
        Alert.alert("Success", "Profile updated successfully", [{ text: "OK", onPress: () => router.back() }])
      } else {
        throw new Error("Failed to update profile")
      }
    } catch (error) {
      console.error("Error saving profile:", error)
      Alert.alert("Error", "Failed to save profile. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const renderCurrencyItem = (currency: (typeof CURRENCIES)[0]) => (
    <TouchableOpacity
      key={currency.id}
      style={styles.currencyItem}
      onPress={() => {
        setSelectedCurrency(currency.id)
        setShowCurrencyPicker(false)
      }}
    >
      <View style={styles.currencyItemContent}>
        <Text style={styles.currencySymbol}>{currency.symbol}</Text>
        <View style={styles.currencyInfo}>
          <Text style={styles.currencyName}>{currency.name}</Text>
          <Text style={styles.currencyId}>{currency.id}</Text>
        </View>
        {selectedCurrency === currency.id && <Ionicons name="checkmark-circle" size={24} color="#ffffff" />}
      </View>
    </TouchableOpacity>
  )

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity onPress={handleSaveProfile} disabled={saving} style={styles.saveButton}>
          <Text style={styles.saveButtonText}>{saving ? "Saving..." : "Save"}</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollContainer}>
          <View style={styles.profileImageContainer}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.profileImage} />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <Ionicons name="person" size={60} color="#666666" />
              </View>
            )}
            <TouchableOpacity style={styles.changeImageButton} onPress={handlePickImage}>
              <Ionicons name="camera" size={20} color="#FFFFFF" />
              <Text style={styles.changeImageText}>Change Photo</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Personal Information</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Name</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter your name"
                placeholderTextColor="#666666"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={[styles.input, styles.disabledInput]}
                value={auth.currentUser?.email || ""}
                editable={false}
                placeholder="Email cannot be changed"
                placeholderTextColor="#666666"
              />
              <Text style={styles.helperText}>Email address cannot be changed</Text>
            </View>
          </View>

          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Preferences</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Default Currency</Text>
              <TouchableOpacity
                style={styles.currencySelector}
                onPress={() => setShowCurrencyPicker(!showCurrencyPicker)}
              >
                <View style={styles.selectedCurrency}>
                  <Text style={styles.currencySymbolSmall}>
                    {CURRENCIES.find((c) => c.id === selectedCurrency)?.symbol}
                  </Text>
                  <Text style={styles.selectedCurrencyText}>
                    {CURRENCIES.find((c) => c.id === selectedCurrency)?.name} ({selectedCurrency})
                  </Text>
                </View>
                <Ionicons name={showCurrencyPicker ? "chevron-up" : "chevron-down"} size={20} color="#FFFFFF" />
              </TouchableOpacity>

              {showCurrencyPicker && (
                <View style={styles.currencyPickerContainer}>{CURRENCIES.map(renderCurrencyItem)}</View>
              )}
            </View>
          </View>
        </ScrollView>
      )}
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
  saveButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    backgroundColor: "#ffffff",
    borderRadius: 20,
  },
  saveButtonText: {
    color: "#000000",
    fontWeight: "bold",
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#CCCCCC",
    fontSize: 16,
  },
  scrollContainer: {
    flex: 1,
    padding: 20,
  },
  profileImageContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 15,
  },
  profileImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#333333",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  changeImageButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#333333",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  changeImageText: {
    color: "#FFFFFF",
    marginLeft: 5,
    fontSize: 14,
  },
  formSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 15,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    color: "#CCCCCC",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#222222",
    borderRadius: 8,
    padding: 12,
    color: "#FFFFFF",
    fontSize: 16,
  },
  disabledInput: {
    backgroundColor: "#1A1A1A",
    color: "#888888",
  },
  helperText: {
    fontSize: 12,
    color: "#888888",
    marginTop: 5,
  },
  currencySelector: {
    backgroundColor: "#222222",
    borderRadius: 8,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  selectedCurrency: {
    flexDirection: "row",
    alignItems: "center",
  },
  currencySymbolSmall: {
    fontSize: 18,
    color: "#ffffff",
    marginRight: 10,
    fontWeight: "bold",
  },
  selectedCurrencyText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
  currencyPickerContainer: {
    backgroundColor: "#222222",
    borderRadius: 8,
    marginTop: 5,
    padding: 5,
  },
  currencyItem: {
    padding: 10,
    borderRadius: 5,
  },
  currencyItemContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  currencySymbol: {
    fontSize: 20,
    color: "#ffffff",
    marginRight: 10,
    fontWeight: "bold",
    width: 30,
    textAlign: "center",
  },
  currencyInfo: {
    flex: 1,
  },
  currencyName: {
    color: "#FFFFFF",
    fontSize: 16,
  },
  currencyId: {
    color: "#AAAAAA",
    fontSize: 12,
  },
})
