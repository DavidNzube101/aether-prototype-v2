"use client"

import { useRef, useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Animated,
  Dimensions,
  Modal,
  PanResponder,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import type { Challenge } from "../../types/challenge"
import StakeModal from "./StakeModal"
import {
  likeChallenge,
  unlikeChallenge,
  hasUserLikedChallenge,
  getChallengeCommunityStats,
} from "../../services/challenge-service"

interface ChallengeDetailsDrawerProps {
  challenge: Challenge | null
  visible: boolean
  onClose: () => void
}

const { height, width } = Dimensions.get("window")
const DRAWER_HEIGHT = height * 0.85
const HEADER_HEIGHT = 180 // Banner + icon area height
const FOOTER_HEIGHT = 120 // Action buttons area height

export default function ChallengeDetailsDrawer({ challenge, visible, onClose }: ChallengeDetailsDrawerProps) {
  const [showStakeModal, setShowStakeModal] = useState(false)
  const [liked, setLiked] = useState(false)
  const [communityStats, setCommunityStats] = useState({
    participant_count: 0,
    completed_count: 0,
    completion_rate: 0,
  })
  const [loadingStats, setLoadingStats] = useState(false)
  const translateY = useRef(new Animated.Value(DRAWER_HEIGHT)).current
  const scrollViewRef = useRef<ScrollView>(null)
  const [isScrollAtTop, setIsScrollAtTop] = useState(true)
  const router = useRouter()

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (_, gestureState) => {
        // Only respond to pan if we're at the top of the scroll view or dragging down from the handle
        return isScrollAtTop || gestureState.dy > 0
      },
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Allow scrolling within the content area
        return isScrollAtTop && gestureState.dy > 0
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy)
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > DRAWER_HEIGHT / 3) {
          closeDrawer()
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
          }).start()
        }
      },
    }),
  ).current

  // Check if user has liked the challenge and fetch community stats when drawer opens
  useEffect(() => {
    if (visible && challenge) {
      checkIfLiked()
      fetchCommunityStats()
    }
  }, [visible, challenge])

  // Animate drawer opening/closing
  useEffect(() => {
    if (visible) {
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
      }).start()
    } else {
      translateY.setValue(DRAWER_HEIGHT)
    }
  }, [visible, translateY])

  // Check if the current user has liked this challenge
  const checkIfLiked = async () => {
    if (!challenge) return

    try {
      const hasLiked = await hasUserLikedChallenge(challenge.id.toString())
      setLiked(hasLiked)
    } catch (error) {
      console.error("Error checking if challenge is liked:", error)
    }
  }

  // Fetch community statistics
  const fetchCommunityStats = async () => {
    if (!challenge) return

    try {
      setLoadingStats(true)
      const stats = await getChallengeCommunityStats(challenge.id.toString())
      setCommunityStats(stats)
    } catch (error) {
      console.error("Error fetching community stats:", error)
    } finally {
      setLoadingStats(false)
    }
  }

  const closeDrawer = () => {
    Animated.timing(translateY, {
      toValue: DRAWER_HEIGHT,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onClose()
    })
  }

  const handleLike = async () => {
    if (!challenge) return

    try {
      if (liked) {
        // Unlike the challenge
        const success = await unlikeChallenge(challenge.id.toString())
        if (success) {
          setLiked(false)
        }
      } else {
        // Like the challenge
        const success = await likeChallenge(challenge.id.toString())
        if (success) {
          // Animate like button
          const shakeAnimation = new Animated.Value(0)
          Animated.sequence([
            Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnimation, { toValue: -10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnimation, { toValue: 5, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnimation, { toValue: 0, duration: 50, useNativeDriver: true }),
          ]).start()

          setLiked(true)
        }
      }
    } catch (error) {
      console.error("Error liking/unliking challenge:", error)
      Alert.alert("Error", "Failed to update like status. Please try again.")
    }
  }

  const handleDislike = () => {
    closeDrawer()
  }

  const handleChatroom = () => {
    if (!challenge) return

    if (challenge.hasChatroom) {
      closeDrawer()
      // Navigate to chatroom
      router.push({
        pathname: "/chatroom",
        params: { challengeId: challenge.id },
      })
    } else {
      // Show disabled chatroom modal
      Alert.alert("Chatroom Disabled", "Chatroom is not available for this challenge.")
    }
  }

  interface ScrollEvent {
    nativeEvent: {
      contentOffset: {
        y: number;
      };
    };
  }

  const handleScroll = (event: ScrollEvent) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    setIsScrollAtTop(offsetY <= 0);
  };

  // Handle successful stake/join
  const handleStakeSuccess = () => {
    // Refresh community stats
    fetchCommunityStats()
  }

  // Handle creator display - support both string and object formats
  const getCreatorName = () => {
    if (!challenge) return "Unknown"

    if (typeof challenge.creator === "string") {
      return challenge.creator
    } else if (challenge.creator && typeof challenge.creator === "object") {
      return challenge.creator.app_name || "Unknown"
    }
    return "Unknown"
  }

  // Get creator email if available
  const getCreatorEmail = () => {
    if (!challenge) return null

    if (typeof challenge.creator === "object" && challenge.creator?.offchain_identifier) {
      return challenge.creator.offchain_identifier
    }
    return null
  }

  // Handle image source - support both string URLs and require() imports
  interface ImageSource {
    uri: string;
  }

  const getImageSource = (image: string | number | null) => {
    if (!image) return undefined

    if (typeof image === "string") {
      return { uri: image }
    }
    return image
  }

  // Get target value and measurement
  const getTargetDisplay = () => {
    if (!challenge) return ""

    // Use targetValue or measurementValue, whichever is available
    const targetValue = challenge.targetValue || challenge.measurementValue
    const measurement = challenge.metricMeasurement || ""

    if (targetValue && measurement) {
      return `${targetValue} ${measurement}`
    }

    return ""
  }

  if (!challenge) return null

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={closeDrawer}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.closeArea} onPress={closeDrawer} />

        <Animated.View
          style={[
            styles.drawer,
            {
              transform: [{ translateY }],
            },
          ]}
        >
          {/* Drag Handle - Fixed at top */}
          <View style={styles.dragHandleContainer} {...panResponder.panHandlers}>
            <View style={styles.dragHandle} />
          </View>

          {/* Banner and Icon - Fixed at top */}
          <View style={styles.bannerContainer}>
            <Image source={getImageSource(challenge.image)} style={styles.bannerImage} />
            <View style={styles.iconContainer}>
              <Image source={getImageSource(challenge.icon || challenge.image)} style={styles.challengeIcon} />
            </View>
          </View>

          {/* Scrollable Content Area */}
          <ScrollView
            ref={scrollViewRef}
            style={styles.scrollContainer}
            contentContainerStyle={styles.scrollContentContainer}
            showsVerticalScrollIndicator={true}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            <View style={styles.detailsContainer}>
              <Text style={styles.challengeName}>{challenge.name}</Text>

              <View style={styles.creatorInfoContainer}>
                <Text style={styles.creatorLabel}>Created by:</Text>
                <Text style={styles.creatorName}>{getCreatorName()}</Text>
                {getCreatorEmail() && <Text style={styles.creatorEmail}>{getCreatorEmail()}</Text>}
              </View>

              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Ionicons name="time-outline" size={16} color="#CCCCCC" />
                  <Text style={styles.statText}>{challenge.timeLeft}</Text>
                </View>

                <View style={styles.statItem}>
                  <Ionicons name="trending-up-outline" size={16} color="#CCCCCC" />
                  <Text style={styles.statText}>{challenge.intensity}</Text>
                  {getTargetDisplay() && <Text style={styles.targetText}> ({getTargetDisplay()})</Text>}
                </View>

                <View style={styles.statItem}>
                  <Ionicons name="calendar-outline" size={16} color="#CCCCCC" />
                  <Text style={styles.statText}>{challenge.duration} days</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.stakeInfoContainer}>
                <Text style={styles.stakeInfoTitle}>Stake Information</Text>
                <View style={styles.stakeInfoRow}>
                  <Text style={styles.stakeInfoLabel}>Currency:</Text>
                  <Text style={styles.stakeInfoValue}>{challenge.stakeCurrency}</Text>
                </View>
                <View style={styles.stakeInfoRow}>
                  <Text style={styles.stakeInfoLabel}>Amount:</Text>
                  <Text style={styles.stakeInfoValue}>
                    {challenge.stakeAmount} {challenge.stakeCurrency}
                  </Text>
                </View>
                <View style={styles.stakeInfoRow}>
                  <Text style={styles.stakeInfoLabel}>Reward:</Text>
                  <Text style={styles.stakeInfoValue}>{challenge.reward}</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <Text style={styles.descriptionTitle}>Challenge Description</Text>
              {challenge.description ? (
                <Text style={styles.descriptionText}>{challenge.description}</Text>
              ) : (
                <Text style={styles.descriptionText}>
                  Complete this {challenge.type.toLowerCase()} challenge to earn AETH tokens and improve your fitness
                  level. This is a {challenge.intensity} level challenge that will last for {challenge.duration} days.
                </Text>
              )}

              {/* Challenge Metric Information */}
              {challenge.selectedMetric && (
                <>
                  <View style={styles.divider} />
                  <Text style={styles.descriptionTitle}>Challenge Metric</Text>
                  <View style={styles.metricContainer}>
                    <View style={styles.metricRow}>
                      <Text style={styles.metricLabel}>Metric:</Text>
                      <Text style={styles.metricValue}>
                        {typeof challenge.selectedMetric === "string"
                          ? challenge.selectedMetric
                          : challenge.selectedMetric.name}
                      </Text>
                    </View>
                    {getTargetDisplay() && (
                      <View style={styles.metricRow}>
                        <Text style={styles.metricLabel}>Target:</Text>
                        <Text style={styles.metricValue}>{getTargetDisplay()}</Text>
                      </View>
                    )}
                  </View>
                </>
              )}

              {/* Challenge Rules */}
              <View style={styles.divider} />
              <Text style={styles.descriptionTitle}>Challenge Rules</Text>
              {challenge.rules && challenge.rules.length > 0 ? (
                challenge.rules.map((rule, index) => (
                  <View key={index} style={styles.ruleItem}>
                    <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                    <Text style={styles.ruleText}>{rule}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.descriptionText}>
                  1. You must complete the daily requirements to earn rewards.{"\n"}
                  2. Progress must be tracked through the app.{"\n"}
                  3. Challenges can be completed at your own pace within the timeframe.{"\n"}
                  4. Stake amounts are locked until challenge completion or failure.{"\n"}
                  5. Partial completion will result in partial rewards.
                </Text>
              )}

              <View style={styles.divider} />
              <Text style={styles.descriptionTitle}>Community Stats</Text>

              {loadingStats ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text style={styles.loadingText}>Loading stats...</Text>
                </View>
              ) : (
                <View style={styles.statsContainer}>
                  <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                      <Ionicons name="people-outline" size={16} color="#CCCCCC" />
                      <Text style={styles.statText}>{communityStats.participant_count} Participants</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Ionicons name="trophy-outline" size={16} color="#CCCCCC" />
                      <Text style={styles.statText}>{communityStats.completion_rate}% Completion Rate</Text>
                    </View>
                  </View>

                  <View style={styles.progressBarContainer}>
                    <View style={styles.progressBarBackground}>
                      <View style={[styles.progressBarFill, { width: `${communityStats.completion_rate}%` }]} />
                    </View>
                    <View style={styles.progressLabels}>
                      <Text style={styles.progressLabel}>{communityStats.completed_count} completed</Text>
                      <Text style={styles.progressLabel}>
                        {communityStats.participant_count - communityStats.completed_count} in progress
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              {/* Add padding at the bottom to ensure content isn't hidden behind action buttons */}
              <View style={{ height: FOOTER_HEIGHT - 20 }} />
            </View>
          </ScrollView>

          {/* Action Buttons - Fixed at bottom */}
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity style={styles.mainActionButton} onPress={() => setShowStakeModal(true)}>
              <Text style={styles.mainActionButtonText}>
                Stake {challenge.stakeAmount} {challenge.stakeCurrency} & Join
              </Text>
            </TouchableOpacity>

            <View style={styles.secondaryActionsRow}>
              <TouchableOpacity
                style={[styles.secondaryActionButton, liked && styles.likedButton]}
                onPress={handleLike}
              >
                <Ionicons
                  name={liked ? "thumbs-up" : "thumbs-up-outline"}
                  size={22}
                  color={liked ? "#FFFFFF" : "#CCCCCC"}
                />
              </TouchableOpacity>

              <TouchableOpacity style={styles.secondaryActionButton} onPress={handleDislike}>
                <Ionicons name="thumbs-down-outline" size={22} color="#CCCCCC" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.secondaryActionButton} onPress={handleChatroom}>
                {challenge.hasChatroom ? (
                  <Ionicons name="chatbubble-outline" size={22} color="#CCCCCC" />
                ) : (
                  <View style={styles.disabledChatContainer}>
                    <Ionicons name="chatbubble-outline" size={22} color="#666666" />
                    <View style={styles.disabledChatLine} />
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </View>

      <StakeModal
        visible={showStakeModal}
        onClose={() => setShowStakeModal(false)}
        challenge={challenge}
        onSuccess={handleStakeSuccess}
      />
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  closeArea: {
    flex: 1,
  },
  drawer: {
    height: DRAWER_HEIGHT,
    backgroundColor: "#111111",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  dragHandleContainer: {
    height: 30,
    justifyContent: "center",
    alignItems: "center",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: "#111111",
    zIndex: 10,
  },
  dragHandle: {
    width: 40,
    height: 5,
    backgroundColor: "#333333",
    borderRadius: 3,
  },
  bannerContainer: {
    width: "100%",
    height: 150,
    position: "relative",
    zIndex: 5,
  },
  bannerImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  iconContainer: {
    position: "absolute",
    bottom: -25,
    left: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#111111",
    padding: 3,
    zIndex: 6,
  },
  challengeIcon: {
    width: "100%",
    height: "100%",
    borderRadius: 22,
  },
  scrollContainer: {
    flex: 1,
    height: DRAWER_HEIGHT - HEADER_HEIGHT - FOOTER_HEIGHT,
  },
  scrollContentContainer: {
    paddingBottom: 20,
  },
  detailsContainer: {
    padding: 20,
    paddingTop: 30,
  },
  challengeName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 5,
  },
  creatorInfoContainer: {
    marginBottom: 15,
  },
  creatorLabel: {
    fontSize: 14,
    color: "#CCCCCC",
    marginBottom: 2,
  },
  creatorName: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "500",
  },
  creatorEmail: {
    fontSize: 12,
    color: "#CCCCCC",
    marginTop: 2,
  },
  statsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    marginBottom: 15,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 20,
    marginBottom: 5,
  },
  statText: {
    fontSize: 14,
    color: "#CCCCCC",
    marginLeft: 5,
  },
  targetText: {
    fontSize: 14,
    color: "#CCCCCC",
    fontStyle: "italic",
  },
  divider: {
    height: 1,
    backgroundColor: "#222222",
    marginVertical: 15,
  },
  stakeInfoContainer: {
    marginBottom: 15,
  },
  stakeInfoTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 10,
  },
  stakeInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  stakeInfoLabel: {
    fontSize: 14,
    color: "#CCCCCC",
  },
  stakeInfoValue: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "500",
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 14,
    color: "#CCCCCC",
    lineHeight: 20,
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
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  loadingText: {
    color: "#CCCCCC",
    marginTop: 10,
    fontSize: 14,
  },
  statsContainer: {
    marginTop: 5,
  },
  progressBarContainer: {
    marginTop: 15,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: "#222222",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#4CAF50",
  },
  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 5,
  },
  progressLabel: {
    fontSize: 12,
    color: "#CCCCCC",
  },
  actionButtonsContainer: {
    padding: 20,
    paddingTop: 10,
    backgroundColor: "#111111",
    borderTopWidth: 1,
    borderTopColor: "#222222",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: FOOTER_HEIGHT,
  },
  mainActionButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 15,
    alignItems: "center",
    marginBottom: 15,
  },
  mainActionButtonText: {
    color: "#000000",
    fontWeight: "bold",
    fontSize: 16,
  },
  secondaryActionsRow: {
    flexDirection: "row",
    justifyContent: "center",
  },
  secondaryActionButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#222222",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 10,
  },
  likedButton: {
    backgroundColor: "#4CAF50",
  },
  disabledChatContainer: {
    position: "relative",
  },
  disabledChatLine: {
    position: "absolute",
    width: "130%",
    height: 1.5,
    backgroundColor: "#666666",
    top: "50%",
    left: "-15%",
    transform: [{ rotate: "45deg" }],
  },
})
