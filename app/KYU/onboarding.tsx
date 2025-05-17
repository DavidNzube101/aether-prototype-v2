"use client"

import { useState, useRef } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
  Platform,
} from "react-native"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { useAuth } from "../../context/auth-context"
import { doc, setDoc, getFirestore } from "firebase/firestore"
import { getRandomNumber } from "../../utils/fitRatingUtils"
import { initializeApp } from "firebase/app"
import * as ImagePicker from "expo-image-picker"

// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCauUU-mT9RDw3UXhBhw3H-OTGVOdHDCbM",
  authDomain: "aether-atombase.firebaseapp.com",
  projectId: "aether-atombase",
  storageBucket: "aether-atombase.firebasestorage.app",
  messagingSenderId: "439269810531",
  appId: "1:439269810531:web:1b3347c5c512705a503356",
  measurementId: "G-4WN80R3MMJ",
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

// Cloudinary configuration
const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dzlr5fyrx/upload"
const CLOUDINARY_UPLOAD_PRESET = "ml_default"

const fitnessLevels = [
  {
    id: "beginner",
    title: "Just Starting",
    description: "New to fitness and figuring things out.",
  },
  {
    id: "intermediate",
    title: "Regular Exerciser",
    description: "Works out a few times a week.",
  },
  {
    id: "advanced",
    title: "Very Active",
    description: "Makes fitness a big part of their life.",
  },
]

const currencies = [
  { id: "NGN", name: "Naira", symbol: "₦" },
  { id: "EUR", name: "Euro", symbol: "€" },
  { id: "GBP", name: "Pounds", symbol: "£" },
  { id: "USD", name: "Dollar", symbol: "$" },
]

export default function OnboardingScreen() {
  const { user, checkOnboardingStatus } = useAuth()
  const router = useRouter()
  const scrollViewRef = useRef(null)

  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // User data states
  const [name, setName] = useState("")
  const [profileImage, setProfileImage] = useState(null)
  const [profileImageUrl, setProfileImageUrl] = useState("")
  const [selectedFitnessLevel, setSelectedFitnessLevel] = useState("")
  const [selectedCurrency, setSelectedCurrency] = useState("")

  // Check if all required fields are filled
  const isStepComplete = () => {
    switch (currentStep) {
      case 0: // Name
        return name.trim().length > 0
      case 1: // Profile picture (optional)
        return true
      case 2: // Fitness level
        return selectedFitnessLevel !== ""
      case 3: // Currency
        return selectedCurrency !== ""
      default:
        return false
    }
  }

  // Handle image picking
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      })

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setProfileImage(result.assets[0].uri)
      }
    } catch (err) {
      setError("Error selecting image. Please try again.")
      console.error("Error picking image:", err)
    }
  }

  // Upload image to Cloudinary
  const uploadImageToCloudinary = async (imageUri) => {
    try {
      // Create form data for the upload
      const formData = new FormData()

      // Get the filename from the URI
      const filename = imageUri.split("/").pop()

      // Determine the file type
      const match = /\.(\w+)$/.exec(filename || "")
      const type = match ? `image/${match[1]}` : "image/jpeg"

      // Append the file to the form data with the correct structure
      formData.append("file", {
        uri: imageUri,
        type,
        name: filename || "upload.jpg",
      })

      // Add the upload preset - this is required by Cloudinary
      formData.append("upload_preset", "ml_default")

      // Add your API key
      formData.append("api_key", "875833447958442")

      console.log("Uploading to Cloudinary:", CLOUDINARY_URL)

      // Make the fetch request
      const response = await fetch(CLOUDINARY_URL, {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
        },
      })

      // Log the response status
      console.log("Cloudinary response status:", response.status)

      // Parse the JSON response
      const data = await response.json()
      console.log("Cloudinary response:", JSON.stringify(data))

      // Check if we got a secure URL back
      if (data.secure_url) {
        console.log("Upload successful, URL:", data.secure_url)
        return data.secure_url
      } else {
        console.error("No secure_url in response:", data)
        throw new Error("Failed to get image URL from Cloudinary")
      }
    } catch (err) {
      console.error("Error uploading to Cloudinary:", err)
      // If the image upload fails, we'll skip it rather than failing the whole onboarding
      return null
    }
  }

  // Also update the saveUserData function to handle the case where image upload fails
  const saveUserData = async () => {
    if (!user?.uid) {
      setError("User not authenticated. Please log in again.")
      return false
    }

    try {
      let imageUrl = profileImageUrl

      // Upload image if selected but not yet uploaded
      if (profileImage && !profileImageUrl) {
        try {
          imageUrl = await uploadImageToCloudinary(profileImage)
        } catch (uploadErr) {
          console.error("Image upload failed, continuing without profile image:", uploadErr)
          imageUrl = null // Continue without the image if upload fails
        }
      }

      // Get fitness level details
      const fitnessLevel = fitnessLevels.find((level) => level.id === selectedFitnessLevel)

      // Get currency details
      const currency = currencies.find((curr) => curr.id === selectedCurrency)

      // Prepare user data
      const userData = {
        name,
        profileImage: imageUrl || null,
        fitnessLevel: fitnessLevel
          ? {
              id: fitnessLevel.id,
              title: fitnessLevel.title,
              description: fitnessLevel.description,
            }
          : null,
        currency: currency
          ? {
              id: currency.id,
              name: currency.name,
              symbol: currency.symbol,
            }
          : null,
        onboardingCompleted: true,
        updatedAt: new Date().toISOString(),
        walletBalance: 0,
        fitRating: fitnessLevel?.id == "advanced" ? Math.round(getRandomNumber(51, 100)) : Math.round(getRandomNumber(11, 50)),
        hasConnectedFitnessProvider: false,
        maxFitEnabled: false,
        fitnessProvider: null,
        badgesEarned: [],
      }

      console.log("Saving user data:", JSON.stringify(userData))

      // Save to Firestore
      await setDoc(doc(db, "users", user.uid), userData, { merge: true })

      // Update onboarding status in auth context
      await checkOnboardingStatus()

      return true
    } catch (err) {
      console.error("Error saving user data:", err)
      setError("Failed to save your information. Please try again.")
      return false
    }
  }

  // Handle next step
  const handleNext = async () => {
    if (currentStep < 4) {
      if (isStepComplete()) {
        if (currentStep === 3) {
          // Last step before finish
          setLoading(true)
          try {
            const success = await saveUserData()
            if (success) {
              setCurrentStep(4) // Move to finish screen
            }
          } catch (err) {
            setError("Failed to save your information. Please try again.")
          } finally {
            setLoading(false)
          }
        } else {
          // Move to next step
          setCurrentStep(currentStep + 1)
          scrollViewRef.current?.scrollTo({ x: 0, animated: true })
        }
      } else {
        setError("Please complete this step before continuing.")
      }
    } else if (currentStep === 4) {
      // Finish onboarding
      router.replace("/(tabs)/home")
    }
  }

  // Handle back
  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      scrollViewRef.current?.scrollTo({ x: 0, animated: true })
    } else {
      // First step, go back to login
      router.push("/login")
    }
  }

  // Handle skip (for optional steps)
  const handleSkip = () => {
    if (currentStep === 1) {
      // Only profile picture is skippable
      setCurrentStep(currentStep + 1)
      scrollViewRef.current?.scrollTo({ x: 0, animated: true })
    }
  }

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>What's your name?</Text>
            <Text style={styles.stepDescription}>We'll use this to personalize your experience.</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your name"
              placeholderTextColor="#666666"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          </View>
        )
      case 1:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Add a profile picture</Text>
            <Text style={styles.stepDescription}>This helps personalize your profile (optional).</Text>
            <View style={styles.profileImageContainer}>
              {profileImage ? (
                <Image source={{ uri: profileImage }} style={styles.profileImage} />
              ) : (
                <View style={styles.profileImagePlaceholder}>
                  <Ionicons name="person" size={60} color="#666666" />
                </View>
              )}
              <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
                <Text style={styles.uploadButtonText}>{profileImage ? "Change Photo" : "Upload Photo"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )
      case 2:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>What's your fitness level?</Text>
            <Text style={styles.stepDescription}>This helps us recommend appropriate workouts and challenges.</Text>
            <View style={styles.optionsContainer}>
              {fitnessLevels.map((level) => (
                <TouchableOpacity
                  key={level.id}
                  style={[styles.optionCard, selectedFitnessLevel === level.id && styles.selectedOptionCard]}
                  onPress={() => setSelectedFitnessLevel(level.id)}
                >
                  <View style={styles.optionHeader}>
                    <Text style={styles.optionTitle}>{level.title}</Text>
                    {selectedFitnessLevel === level.id && (
                      <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
                    )}
                  </View>
                  <Text style={styles.optionDescription}>{level.description}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )
      case 3:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Select your default currency</Text>
            <Text style={styles.stepDescription}>We'll use this for displaying rewards and transactions.</Text>
            <View style={styles.currencyContainer}>
              {currencies.map((currency) => (
                <TouchableOpacity
                  key={currency.id}
                  style={[styles.currencyOption, selectedCurrency === currency.id && styles.selectedCurrencyOption]}
                  onPress={() => setSelectedCurrency(currency.id)}
                >
                  <Text style={styles.currencySymbol}>{currency.symbol}</Text>
                  <Text style={styles.currencyName}>{currency.name}</Text>
                  {selectedCurrency === currency.id && (
                    <View style={styles.selectedIndicator}>
                      <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )
      case 4:
        return (
          <View style={styles.finishContent}>
            <View style={styles.successIconContainer}>
              <Ionicons name="checkmark-circle" size={80} color="#34C759" />
            </View>
            <Text style={styles.finishTitle}>You're all set!</Text>
            <Text style={styles.finishDescription}>
              Your profile has been created successfully. Get ready to start your fitness journey with Aether Fit!
            </Text>
          </View>
        )
      default:
        return null
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        {currentStep < 4 && (
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        )}
        <View style={styles.progressContainer}>
          {[0, 1, 2, 3].map((step) => (
            <View
              key={step}
              style={[styles.progressDot, currentStep >= step ? styles.activeDot : styles.inactiveDot]}
            />
          ))}
        </View>
        {currentStep === 1 && (
          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipButtonText}>Skip</Text>
          </TouchableOpacity>
        )}
        {currentStep !== 1 && <View style={styles.skipButton} />}
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {renderStepContent()}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.nextButton, !isStepComplete() && currentStep < 4 && styles.disabledButton]}
          onPress={handleNext}
          disabled={(!isStepComplete() && currentStep < 4) || loading}
        >
          {loading ? (
            <ActivityIndicator color="#000000" />
          ) : (
            <Text style={styles.nextButtonText}>{currentStep === 4 ? "Go to Dashboard" : "Continue"}</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
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
    paddingTop: Platform.OS === "android" ? 40 : 10,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  progressContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: "#FFFFFF",
  },
  inactiveDot: {
    backgroundColor: "#444444",
  },
  skipButton: {
    width: 60,
    alignItems: "flex-end",
  },
  skipButtonText: {
    color: "#CCCCCC",
    fontSize: 16,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  errorContainer: {
    backgroundColor: "rgba(255, 59, 48, 0.2)",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  errorText: {
    color: "#FF3B30",
    textAlign: "center",
  },
  stepContent: {
    paddingVertical: 20,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 10,
  },
  stepDescription: {
    fontSize: 16,
    color: "#CCCCCC",
    marginBottom: 30,
  },
  input: {
    backgroundColor: "#222222",
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: "#FFFFFF",
    marginBottom: 20,
  },
  profileImageContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 20,
  },
  profileImagePlaceholder: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "#222222",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  uploadButton: {
    backgroundColor: "#333333",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  uploadButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
  optionsContainer: {
    marginTop: 10,
  },
  optionCard: {
    backgroundColor: "#222222",
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
  },
  selectedOptionCard: {
    backgroundColor: "#333333",
    borderColor: "#FFFFFF",
    borderWidth: 1,
  },
  optionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  optionDescription: {
    fontSize: 14,
    color: "#CCCCCC",
  },
  currencyContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 10,
  },
  currencyOption: {
    width: "48%",
    backgroundColor: "#222222",
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    alignItems: "center",
    position: "relative",
  },
  selectedCurrencyOption: {
    backgroundColor: "#333333",
    borderColor: "#FFFFFF",
    borderWidth: 1,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  currencyName: {
    fontSize: 16,
    color: "#CCCCCC",
  },
  selectedIndicator: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#34C759",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  finishContent: {
    alignItems: "center",
    paddingVertical: 40,
  },
  successIconContainer: {
    marginBottom: 30,
  },
  finishTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 15,
    textAlign: "center",
  },
  finishDescription: {
    fontSize: 16,
    color: "#CCCCCC",
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#222222",
  },
  nextButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 30,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#333333",
  },
  nextButtonText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "bold",
  },
})
