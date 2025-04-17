"use client"

import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import TriangleLoader from "../../../components/ui/TriangleLoader"
import { useEffect, useState } from "react"
import { getUserProfile, type UserProfile } from "../../../utils/user-service"
import { useAuth } from "../../../context/auth-context"

interface PreviewScreenProps {
  challengeData: any
  onEdit: () => void
  onSubmit: () => void
  loading: boolean
  error?: string
}

export default function PreviewScreen({ challengeData, onEdit, onSubmit, loading, error }: PreviewScreenProps) {
  // Default image for preview if none selected
  const { user, logout } = useAuth()
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null)

    const [l_oading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user?.uid) {
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
    }

    fetchUserProfile()
  }, [user])

  const defaultImage = require("../../../assets/images/challenges/steps-challenge.png")

  // Format date for display
  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // Calculate duration in days
  const durationInDays = Math.ceil(
    (challengeData.endDate.getTime() - challengeData.startDate.getTime()) / (1000 * 60 * 60 * 1000 * 24),
  )

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>Challenge Preview</Text>
      <Text style={styles.subtitle}>Review your challenge before creating it</Text>

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <View style={styles.previewCard}>
        <View style={styles.bannerContainer}>
          <Image
            source={challengeData.bannerImage ? { uri: challengeData.bannerImage } : defaultImage}
            style={styles.bannerImage}
          />

          <View style={styles.intensityBadge}>
            <Text style={styles.intensityText}>{challengeData.intensity}</Text>
          </View>

          <View style={styles.stakeBadge}>
            <Text style={styles.stakeText}>
              {challengeData.stakeAmount} {challengeData.stakeCurrency}
            </Text>
          </View>
        </View>

        <View style={styles.iconContainer}>
          <Image
            source={challengeData.iconImage ? { uri: challengeData.iconImage } : defaultImage}
            style={styles.iconImage}
          />
        </View>

        <View style={styles.contentSection}>
          <Text style={styles.challengeTitle}>{challengeData.title || "Challenge Title"}</Text>

          <View style={styles.detailsRow}>
            <View style={styles.detailItem}>
              <Ionicons name="calendar-outline" size={16} color="#CCCCCC" />
              <Text style={styles.detailText}>
                {formatDate(challengeData.startDate)} - {formatDate(challengeData.endDate)}
              </Text>
            </View>

            <View style={styles.detailItem}>
              <Ionicons name="time-outline" size={16} color="#CCCCCC" />
              <Text style={styles.detailText}>{durationInDays} days</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.descriptionText}>{challengeData.description}</Text>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Challenge Metric</Text>
          <View style={styles.metricContainer}>
            {challengeData.selectedMetric && (
              <>
                <View style={styles.metricRow}>
                  <Text style={styles.metricLabel}>Metric:</Text>
                  <Text style={styles.metricValue}>{challengeData.selectedMetric.name}</Text>
                </View>
                <View style={styles.metricRow}>
                  <Text style={styles.metricLabel}>Target:</Text>
                  <Text style={styles.metricValue}>
                    {challengeData.measurementValue} {challengeData.selectedMetric.measurement}
                  </Text>
                </View>
                <View style={styles.metricRow}>
                  <Text style={styles.metricLabel}>Sensors:</Text>
                  <Text style={styles.metricValue}>{challengeData.selectedMetric.sensors.join(", ")}</Text>
                </View>
              </>
            )}
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Rules</Text>
          {challengeData.rules.map((rule, index) => (
            <View key={index} style={styles.ruleItem}>
              <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
              <Text style={styles.ruleText}>{rule}</Text>
            </View>
          ))}

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Comments</Text>
          <Text style={styles.commentStatus}>{challengeData.allowComments ? "Enabled" : "Disabled"}</Text>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Creator Information</Text>
          <View style={styles.creatorInfo}>
            <Text style={styles.creatorLabel}>App Name:</Text>
            <Text style={styles.creatorValue}>Aether Fit</Text>
          </View>
          <View style={styles.creatorInfo}>
            <Text style={styles.creatorLabel}>Email:</Text>
            <Text style={styles.creatorValue}>{user?.email}</Text>
            {/* <Text style={styles.creatorValue}>{userProfile.email}</Text> */}
          </View>
          <View style={styles.creatorInfo}>
            <Text style={styles.creatorLabel}>Wallet:</Text>
            <Text style={styles.creatorValue}>Not connected</Text>
          </View>
        </View>
      </View>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.editButton} onPress={onEdit} disabled={loading}>
          <Ionicons name="create-outline" size={20} color="#FFFFFF" />
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.createButton} onPress={onSubmit} disabled={loading}>
          {loading ? (
            <TriangleLoader isLoading={true} size={24} color="#000000" />
          ) : (
            <>
              <Ionicons name="checkmark" size={20} color="#000000" />
              <Text style={styles.createButtonText}>Create Challenge</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#CCCCCC",
    marginBottom: 20,
  },
  errorContainer: {
    backgroundColor: "rgba(255, 107, 107, 0.2)",
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
  errorText: {
    color: "#FF6B6B",
    textAlign: "center",
  },
  previewCard: {
    backgroundColor: "#111111",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 30,
  },
  bannerContainer: {
    position: "relative",
    height: 180,
  },
  bannerImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  intensityBadge: {
    position: "absolute",
    top: 15,
    left: 15,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  intensityText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 12,
  },
  stakeBadge: {
    position: "absolute",
    top: 15,
    right: 15,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  stakeText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 12,
  },
  iconContainer: {
    position: "absolute",
    top: 150,
    left: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#111111",
    padding: 3,
    borderWidth: 2,
    borderColor: "#000000",
  },
  iconImage: {
    width: "100%",
    height: "100%",
    borderRadius: 27,
  },
  contentSection: {
    padding: 20,
    paddingTop: 40,
  },
  challengeTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 15,
  },
  detailsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 15,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 20,
    marginBottom: 5,
  },
  detailText: {
    fontSize: 14,
    color: "#CCCCCC",
    marginLeft: 5,
  },
  divider: {
    height: 1,
    backgroundColor: "#222222",
    marginVertical: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 14,
    color: "#CCCCCC",
    lineHeight: 22,
  },
  metricContainer: {
    backgroundColor: "#222222",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  metricRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  metricLabel: {
    fontSize: 14,
    color: "#CCCCCC",
  },
  metricValue: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "500",
    textAlign: "right",
    flex: 1,
    marginLeft: 10,
  },
  ruleItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  ruleText: {
    fontSize: 14,
    color: "#CCCCCC",
    marginLeft: 10,
    flex: 1,
  },
  commentStatus: {
    fontSize: 14,
    color: "#CCCCCC",
  },
  creatorInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  creatorLabel: {
    fontSize: 14,
    color: "#CCCCCC",
  },
  creatorValue: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "500",
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#333333",
    borderRadius: 30,
    padding: 15,
    flex: 1,
    marginRight: 10,
  },
  editButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 5,
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 30,
    padding: 15,
    flex: 2,
  },
  createButtonText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 5,
  },
})
