import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import type { Badge } from "../../../types/badges"

type BadgeItemProps = {
  badge: Badge
  onPress: (badge: Badge) => void
}

// Map badge tiers to colors
const tierColors = {
  merit: "#A78BFA", // Purple
  master: "#60A5FA", // Blue
  mythic: "#F59E0B", // Amber
}

// Map badge tiers to icons
const tierIcons = {
  merit: "ribbon-outline",
  master: "trophy-outline",
  mythic: "star-outline",
}

export default function BadgeItem({ badge, onPress }: BadgeItemProps) {
  return (
    <TouchableOpacity
      style={[styles.container, badge.unlocked ? styles.unlocked : styles.locked]}
      onPress={() => onPress(badge)}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: badge.unlocked ? tierColors[badge.tier] : "#333333" }]}>
        <Ionicons name={tierIcons[badge.tier] as any} size={24} color={badge.unlocked ? "#FFFFFF" : "#666666"} />
      </View>
      <View style={styles.content}>
        <Text style={[styles.name, !badge.unlocked && styles.lockedText]} numberOfLines={1}>
          {badge.name}
        </Text>
        <Text style={styles.value} numberOfLines={1}>
          {badge.unlocked ? `+${badge.value} AETH` : "Locked"}
        </Text>
      </View>
      {!badge.unlocked && (
        <View style={styles.lockIconContainer}>
          <Ionicons name="lock-closed" size={16} color="#666666" />
        </View>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#222222",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    marginRight: 10,
  },
  unlocked: {
    opacity: 1,
  },
  locked: {
    opacity: 0.6,
  },
  iconContainer: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  lockedText: {
    color: "#AAAAAA",
  },
  value: {
    fontSize: 14,
    color: "#AAAAAA",
  },
  lockIconContainer: {
    padding: 4,
  },
})

