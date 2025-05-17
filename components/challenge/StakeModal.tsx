"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, Modal, TouchableOpacity, ActivityIndicator, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import Slider from "@react-native-community/slider"
import { useAuth } from "../../context/auth-context"
import { getUserProfile, type UserProfile } from "../../utils/user-service"
import { convertCurrency, formatCurrency, SUPPORTED_CURRENCIES } from "../../utils/currency-converter"
import { joinChallenge, hasUserJoinedChallenge } from "../../services/challenge-service"
import type { Challenge } from "../../types/challenge"

interface StakeModalProps {
  visible: boolean
  onClose: () => void
  challenge: Challenge
  onSuccess?: () => void
}

export default function StakeModal({ visible, onClose, challenge, onSuccess }: StakeModalProps) {
  const [sliderValue, setSliderValue] = useState(0)
  const [processing, setProcessing] = useState(false)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null)
  const [conversionError, setConversionError] = useState(false)
  const [hasJoined, setHasJoined] = useState(false)
  const { user } = useAuth()

  // Calculate transaction fee based on currency
  const feePercentage = challenge.stakeCurrency === "USDC" ? 0.009 : 0.02
  const transactionFee = challenge.stakeAmount * feePercentage

  // Calculate AETH rewards based on intensity
  const getAethReward = () => {
    switch (challenge.intensity) {
      case "Brook":
        return 5
      case "Ridge":
        return 15
      case "Peak":
        return 50
      case "Apex":
        return 100
      default:
        return 0
    }
  }

  const aethReward = getAethReward()

  // Reset slider when modal opens and check if user has already joined
  useEffect(() => {
    if (visible) {
      setSliderValue(0)
      setProcessing(false)
      checkIfUserHasJoined()
    }
  }, [visible, challenge.id])

  // Check if user has already joined this challenge
  const checkIfUserHasJoined = async () => {
    if (!user?.uid || !challenge?.id) return

    try {
      const joined = await hasUserJoinedChallenge(challenge.id.toString())
      setHasJoined(joined)
    } catch (error) {
      console.error("Error checking if user joined challenge:", error)
    }
  }

  // Fetch user profile and currency preference
  useEffect(() => {
    async function fetchUserProfile() {
      if (!user?.uid) return

      try {
        setLoading(true)
        const profile = await getUserProfile(user.uid)
        setUserProfile(profile)
      } catch (error) {
        console.error("Error fetching user profile:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserProfile()
  }, [user])

  // Convert stake amount to user's preferred currency
  useEffect(() => {
    async function performCurrencyConversion() {
      if (!userProfile?.currency?.id || !visible) return

      try {
        setConversionError(false)
        const userCurrency = userProfile.currency.id
        const { convertedAmount, success } = await convertCurrency(
          challenge.stakeAmount,
          challenge.stakeCurrency,
          userCurrency,
        )

        setConvertedAmount(convertedAmount)
        if (!success) {
          setConversionError(true)
        }
      } catch (error) {
        console.error("Error converting currency:", error)
        setConversionError(true)
      }
    }

    performCurrencyConversion()
  }, [userProfile, challenge.stakeAmount, challenge.stakeCurrency, visible])

  const handleConfirm = async () => {
    if (sliderValue < 0.95) return

    setProcessing(true)

    try {
      // Join the challenge in Firestore
      const success = await joinChallenge(challenge.id.toString())

      if (success) {
        // Update local state
        setHasJoined(true)

        // Show success message
        Alert.alert("Success!", "You have successfully joined the challenge!", [
          {
            text: "OK",
            onPress: () => {
              // Call onSuccess callback if provided
              if (onSuccess) onSuccess()
              onClose()
            },
          },
        ])
      } else {
        throw new Error("Failed to join challenge")
      }
    } catch (error) {
      console.error("Error joining challenge:", error)
      Alert.alert("Error", "Failed to join challenge. Please try again.")
    } finally {
      setProcessing(false)
    }
  }

  // Get user's currency or default to USD
  const userCurrency = (userProfile?.currency?.id || "USD")
  const userCurrencySymbol = userProfile?.currency?.symbol || "$"

  // Format the converted amount
  const formattedConvertedAmount = convertedAmount !== null ? formatCurrency(convertedAmount, userCurrency) : "..."

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Transaction Details</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton} disabled={processing}>
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <View style={styles.challengeInfo}>
              <Text style={styles.challengeName}>{challenge.name}</Text>
              <Text style={styles.intensityText}>{challenge.intensity} Challenge</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.transactionDetails}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Stake Amount:</Text>
                <Text style={styles.detailValue}>
                  {challenge.stakeAmount} {challenge.stakeCurrency}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Transaction Fee ({feePercentage * 100}%):</Text>
                <Text style={styles.detailValue}>
                  {transactionFee.toFixed(2)} {challenge.stakeCurrency}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Total Amount:</Text>
                <Text style={styles.detailValueHighlight}>
                  {(challenge.stakeAmount + transactionFee).toFixed(2)} {challenge.stakeCurrency}
                </Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>AETH Reward:</Text>
                <Text style={styles.rewardValue}>+{aethReward} AETH</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>
                  Equivalent in {SUPPORTED_CURRENCIES[userCurrency as keyof typeof SUPPORTED_CURRENCIES]?.name || "local currency"}:
                </Text>
                {loading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : conversionError ? (
                  <Text style={styles.errorText}>Conversion unavailable</Text>
                ) : (
                  <Text style={styles.detailValue}>{formattedConvertedAmount}</Text>
                )}
              </View>
            </View>

            {hasJoined ? (
              <View style={styles.joinedContainer}>
                <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                <Text style={styles.joinedText}>You've already joined this challenge</Text>
              </View>
            ) : (
              <>
                <View style={styles.sliderContainer}>
                  <Text style={styles.sliderLabel}>Slide to confirm {processing ? "Processing..." : ""}</Text>
                  <Slider
                    style={styles.slider}
                    minimumValue={0}
                    maximumValue={1}
                    value={sliderValue}
                    onValueChange={setSliderValue}
                    minimumTrackTintColor={sliderValue > 0.95 ? "#4CAF50" : "#FFFFFF"}
                    maximumTrackTintColor="#444444"
                    thumbTintColor="#FFFFFF"
                    disabled={processing}
                  />
                  <View style={styles.sliderLabels}>
                    <Text style={styles.sliderLabelText}>Slide</Text>
                    <Text style={styles.sliderLabelText}>Confirm</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={[
                    styles.confirmButton,
                    sliderValue > 0.95 ? styles.confirmButtonActive : {},
                    processing ? styles.confirmButtonProcessing : {},
                  ]}
                  onPress={handleConfirm}
                  disabled={sliderValue < 0.95 || processing}
                >
                  {processing ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.confirmButtonText}>
                      {sliderValue > 0.95 ? "Confirm Payment" : "Slide to Confirm"}
                    </Text>
                  )}
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "90%",
    backgroundColor: "#111111",
    borderRadius: 16,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#222222",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  closeButton: {
    padding: 5,
  },
  content: {
    padding: 20,
  },
  challengeInfo: {
    marginBottom: 15,
  },
  challengeName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 5,
  },
  intensityText: {
    fontSize: 14,
    color: "#CCCCCC",
  },
  divider: {
    height: 1,
    backgroundColor: "#333333",
    marginVertical: 15,
  },
  transactionDetails: {
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    alignItems: "center",
  },
  detailLabel: {
    fontSize: 14,
    color: "#CCCCCC",
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "500",
    textAlign: "right",
  },
  detailValueHighlight: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "bold",
    textAlign: "right",
  },
  rewardValue: {
    fontSize: 14,
    color: "#4CAF50",
    fontWeight: "bold",
  },
  errorText: {
    fontSize: 14,
    color: "#FF6B6B",
    fontStyle: "italic",
  },
  sliderContainer: {
    marginBottom: 20,
  },
  sliderLabel: {
    fontSize: 14,
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 10,
  },
  slider: {
    height: 40,
  },
  sliderLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sliderLabelText: {
    fontSize: 12,
    color: "#CCCCCC",
  },
  confirmButton: {
    backgroundColor: "#333333",
    borderRadius: 12,
    padding: 15,
    alignItems: "center",
  },
  confirmButtonActive: {
    backgroundColor: "#4CAF50",
  },
  confirmButtonProcessing: {
    backgroundColor: "#666666",
  },
  confirmButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  joinedContainer: {
    backgroundColor: "#1A3A1A",
    borderRadius: 12,
    padding: 15,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  joinedText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 10,
  },
})
