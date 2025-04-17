"use client"

import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import type { Challenge } from "../../types/challenge"

interface ChallengeCardProps {
  challenge: Challenge
  onPress: (challenge: Challenge) => void
}

export default function ChallengeCard({ challenge, onPress }: ChallengeCardProps) {
  // Handle creator display - support both string and object formats
  const getCreatorName = () => {
    if (typeof challenge.creator === "string") {
      return challenge.creator
    } else if (challenge.creator && typeof challenge.creator === "object") {
      return challenge.creator.app_name || "Unknown"
    }
    return "Unknown"
  }

  // Handle image source - support both string URLs and require() imports
  const getImageSource = () => {
    if (typeof challenge.image === "string") {
      return { uri: challenge.image }
    }
    return challenge.image
  }

  return (
    <TouchableOpacity style={styles.challengeCard} onPress={() => onPress(challenge)} activeOpacity={0.7}>
      <View style={styles.challengeReward}>
        <Text style={styles.rewardText}>{challenge.reward}</Text>
      </View>

      <Image source={getImageSource()} style={styles.challengeImage} />

      <View style={styles.challengeInfo}>
        <Text style={styles.challengeName} numberOfLines={1}>
          {challenge.name}
        </Text>

        <View style={styles.creatorContainer}>
          <Ionicons name="person-outline" size={12} color="#CCCCCC" />
          <Text style={styles.creatorText} numberOfLines={1}>
            {getCreatorName()}
          </Text>
        </View>

        <View style={styles.stakeContainer}>
          <Text style={styles.stakeText}>
            {challenge.stakeAmount} {challenge.stakeCurrency}
          </Text>
        </View>

        <View style={styles.challengeDetails}>
          <View style={styles.challengeStats}>
            <Ionicons name="time-outline" size={14} color="#CCCCCC" />
            <Text style={styles.challengeTime}>{challenge.timeLeft}</Text>
          </View>
          <View style={styles.intensityBadge}>
            <Text style={styles.intensityText}>{challenge.intensity}</Text>
          </View>
        </View>

        <View style={styles.socialContainer}>
          <View style={styles.socialItem}>
            <Ionicons name="thumbs-up-outline" size={14} color="#CCCCCC" />
            <Text style={styles.socialText}>{challenge.likes}</Text>
          </View>

          <View style={styles.socialItem}>
            <Ionicons name="thumbs-down-outline" size={14} color="#CCCCCC" />
            <Text style={styles.socialText}>{challenge.dislikes}</Text>
          </View>

          <View style={styles.socialItem}>
            {challenge.hasChatroom ? (
              <Ionicons name="chatbubble-outline" size={14} color="#CCCCCC" />
            ) : (
              <View style={styles.disabledChatContainer}>
                <Ionicons name="chatbubble-outline" size={14} color="#666666" />
                <View style={styles.disabledChatLine} />
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  challengeCard: {
    flex: 1,
    backgroundColor: "#111111",
    borderRadius: 16,
    margin: 10,
    overflow: "hidden",
    maxWidth: "100%",
  },
  challengeReward: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    zIndex: 1,
  },
  rewardText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 12,
  },
  challengeImage: {
    width: "100%",
    height: 120,
    resizeMode: "cover",
  },
  challengeInfo: {
    padding: 12,
  },
  challengeName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  creatorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  creatorText: {
    fontSize: 11,
    color: "#CCCCCC",
    marginLeft: 4,
  },
  stakeContainer: {
    marginBottom: 6,
  },
  stakeText: {
    fontSize: 12,
    color: "#CCCCCC",
    fontWeight: "500",
  },
  challengeDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  challengeStats: {
    flexDirection: "row",
    alignItems: "center",
  },
  challengeTime: {
    fontSize: 12,
    color: "#CCCCCC",
    marginLeft: 5,
  },
  intensityBadge: {
    backgroundColor: "#222222",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  intensityText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "500",
  },
  socialContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  socialItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  socialText: {
    fontSize: 12,
    color: "#CCCCCC",
    marginLeft: 4,
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
