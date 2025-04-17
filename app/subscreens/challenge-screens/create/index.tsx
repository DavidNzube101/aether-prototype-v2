"use client"

import { useState, useRef, useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import TriangleLoader from "../../../../components/ui/TriangleLoader"
import ChallengeTypeScreen from "../../../../components/challenge/create/ChallengeTypeScreen"
import StakePoolScreen from "../../../../components/challenge/create/StakePoolScreen"
import VisualCustomizationScreen from "../../../../components/challenge/create/VisualCustomizationScreen"
import ChallengeInfoScreen from "../../../../components/challenge/create/ChallengeInfoScreen"
import DurationScreen from "../../../../components/challenge/create/DurationScreen"
import CommentsScreen from "../../../../components/challenge/create/CommentsScreen"
import PreviewScreen from "../../../../components/challenge/create/PreviewScreen"
import { createChallenge } from "../../../../services/challenge-service"
import { getAuth } from "firebase/auth"

const { width } = Dimensions.get("window")

// Define the steps in the challenge creation flow
const STEPS = ["Challenge Type", "Stake Pool", "Visual", "Info", "Duration", "Comments", "Preview"]

export default function CreateChallengeScreen() {
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const scrollViewRef = useRef<ScrollView>(null)
  const router = useRouter()
  const auth = getAuth()

  // Check authentication
  useEffect(() => {
    const user = auth.currentUser
    if (!user) {
      Alert.alert("Authentication Required", "Please log in to create challenges", [
        { text: "OK", onPress: () => router.replace("/login") },
      ])
    }
  }, [])

  
  const [challengeData, setChallengeData] = useState({
    type: "",
    intensity: "",
    selectedMetric: null,
    measurementValue: "",
    stakeCurrency: "USDC",
    stakeAmount: 10,
    bannerImage: null,
    iconImage: null,
    title: "",
    description: "",
    rules: [],
    customRule: "",
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    allowComments: true,
  })

  // Update challenge data
  const updateChallengeData = (data) => {
    setChallengeData((prev) => ({ ...prev, ...data }))
  }

  // Navigate to next step
  const goToNextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
      scrollViewRef.current?.scrollTo({ x: width * (currentStep + 1), animated: true })
    }
  }

  // Navigate to previous step
  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      scrollViewRef.current?.scrollTo({ x: width * (currentStep - 1), animated: true })
    } else {
      // If on first step, go back to challenges screen
      router.back()
    }
  }

  // Handle challenge creation
  const handleCreateChallenge = async () => {
    setLoading(true)
    setError("")

    try {
      // Create challenge in Firestore
      const newChallenge = await createChallenge(challengeData)

      if (newChallenge) {
        // Navigate back to challenges screen
        Alert.alert("Success", "Challenge created successfully! It will appear in your Inactive challenges.", [
          { text: "OK", onPress: () => router.replace("/challenges") },
        ])
      } else {
        throw new Error("Failed to create challenge")
      }
    } catch (error) {
      console.error("Error creating challenge:", error)
      setError("Failed to create challenge. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goToPreviousStep} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Challenge</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.progressContainer}>
        {STEPS.map((step, index) => (
          <View key={index} style={styles.progressStepContainer}>
            <View style={[styles.progressStep, index <= currentStep ? styles.activeProgressStep : {}]} />
            <Text style={[styles.progressStepText, index <= currentStep ? styles.activeProgressStepText : {}]}>
              {step}
            </Text>
          </View>
        ))}
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        style={styles.scrollView}
      >
        {/* Challenge Type Selection */}
        <View style={[styles.screen, { width }]}>
          <ChallengeTypeScreen
            challengeData={challengeData}
            updateChallengeData={updateChallengeData}
            onNext={goToNextStep}
          />
        </View>

        {/* Stake Pool Details */}
        <View style={[styles.screen, { width }]}>
          <StakePoolScreen
            challengeData={challengeData}
            updateChallengeData={updateChallengeData}
            onNext={goToNextStep}
          />
        </View>

        {/* Visual Customization */}
        <View style={[styles.screen, { width }]}>
          <VisualCustomizationScreen
            challengeData={challengeData}
            updateChallengeData={updateChallengeData}
            onNext={goToNextStep}
          />
        </View>

        {/* Challenge Info */}
        <View style={[styles.screen, { width }]}>
          <ChallengeInfoScreen
            challengeData={challengeData}
            updateChallengeData={updateChallengeData}
            onNext={goToNextStep}
          />
        </View>

        {/* Duration */}
        <View style={[styles.screen, { width }]}>
          <DurationScreen
            challengeData={challengeData}
            updateChallengeData={updateChallengeData}
            onNext={goToNextStep}
          />
        </View>

        {/* Comments Toggle */}
        <View style={[styles.screen, { width }]}>
          <CommentsScreen
            challengeData={challengeData}
            updateChallengeData={updateChallengeData}
            onNext={goToNextStep}
          />
        </View>

        {/* Preview Screen */}
        <View style={[styles.screen, { width }]}>
          <PreviewScreen
            challengeData={challengeData}
            onEdit={goToPreviousStep}
            onSubmit={handleCreateChallenge}
            loading={loading}
            error={error}
          />
        </View>
      </ScrollView>

      {loading && (
        <View style={styles.loadingOverlay}>
          <TriangleLoader isLoading={true} size={100} />
          <Text style={styles.loadingText}>Creating your challenge...</Text>
        </View>
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
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  backButton: {
    padding: 5,
  },
  placeholder: {
    width: 34, // Same width as back button for alignment
  },
  progressContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 20,
    justifyContent: "space-between",
  },
  progressStepContainer: {
    alignItems: "center",
    width: 40,
  },
  progressStep: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#333333",
    marginBottom: 5,
  },
  activeProgressStep: {
    backgroundColor: "#FFFFFF",
  },
  progressStepText: {
    color: "#666666",
    fontSize: 10,
    textAlign: "center",
  },
  activeProgressStepText: {
    color: "#FFFFFF",
  },
  errorContainer: {
    backgroundColor: "rgba(255, 107, 107, 0.2)",
    padding: 10,
    marginHorizontal: 20,
    borderRadius: 8,
    marginBottom: 10,
  },
  errorText: {
    color: "#FF6B6B",
    textAlign: "center",
  },
  scrollView: {
    flex: 1,
  },
  screen: {
    flex: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  loadingText: {
    color: "#FFFFFF",
    marginTop: 20,
    fontSize: 18,
    fontWeight: "500",
  },
})
