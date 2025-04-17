"use client"

import { useState } from "react"
import { View, Text, StyleSheet, Modal, TouchableOpacity, ActivityIndicator } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import Slider from "@react-native-community/slider"
import { activateChallenge } from "../../services/challenge-service"
import type { Challenge } from "../../types/challenge"

interface ActivationModalProps {
  visible: boolean
  onClose: () => void
  challenge: Challenge | null
  onActivated: () => void
}

export default function ActivationModal({ visible, onClose, challenge, onActivated }: ActivationModalProps) {
  const [sliderValue, setSliderValue] = useState(0)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState("")

  if (!challenge) return null

  // Calculate transaction fee based on currency
  const feePercentage = challenge.stakeCurrency === "USDC" ? 0.009 : 0.02
  const transactionFee = challenge.stakeAmount * feePercentage

  const handleActivate = async () => {
    if (sliderValue < 0.95) return

    setProcessing(true)
    setError("")

    try {
      // Activate the challenge in Firestore
      const success = await activateChallenge(challenge.id as string)

      if (success) {
        // Notify parent component
        onActivated()

        // Close modal after a short delay
        setTimeout(() => {
          setProcessing(false)
          onClose()
        }, 1000)
      } else {
        throw new Error("Failed to activate challenge")
      }
    } catch (err) {
      console.error("Error activating challenge:", err)
      setError("Failed to activate challenge. Please try again.")
      setProcessing(false)
    }
  }

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Activate Challenge</Text>
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
                <Text style={styles.rewardValue}>{challenge.reward}</Text>
              </View>
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <View style={styles.sliderContainer}>
              <Text style={styles.sliderLabel}>Slide to activate {processing ? "Processing..." : ""}</Text>
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
                <Text style={styles.sliderLabelText}>Activate</Text>
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.confirmButton,
                sliderValue > 0.95 ? styles.confirmButtonActive : {},
                processing ? styles.confirmButtonProcessing : {},
              ]}
              onPress={handleActivate}
              disabled={sliderValue < 0.95 || processing}
            >
              {processing ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.confirmButtonText}>
                  {sliderValue > 0.95 ? "Activate Challenge" : "Slide to Activate"}
                </Text>
              )}
            </TouchableOpacity>
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
    color: "#FF6B6B",
    textAlign: "center",
    marginBottom: 15,
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
})
