import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import type { Badge } from "../../../types/badges"

type BadgeDetailModalProps = {
  visible: boolean
  onClose: () => void
  badge: Badge | null
}

// Map badge tiers to colors
const tierColors = {
  merit: "#A78BFA", // Purple
  master: "#60A5FA", // Blue
  mythic: "#F59E0B", // Amber
}

// Map badge tiers to readable names
const tierNames = {
  merit: "Merit Badge",
  master: "Master Badge",
  mythic: "Mythic Badge",
}

export default function BadgeDetailModal({ visible, onClose, badge }: BadgeDetailModalProps) {
  if (!badge) return null

  return (
    <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{badge.name}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            <View
              style={[
                styles.badgeIconContainer,
                { backgroundColor: badge.unlocked ? tierColors[badge.tier] : "#333333" },
              ]}
            >
              <Ionicons
                name={badge.unlocked ? "ribbon" : "ribbon-outline"}
                size={50}
                color={badge.unlocked ? "#FFFFFF" : "#666666"}
              />
            </View>

            <View style={styles.tierContainer}>
              <Text style={[styles.tierText, { color: tierColors[badge.tier] }]}>{tierNames[badge.tier]}</Text>
            </View>

            <Text style={styles.descriptionTitle}>Description</Text>
            <Text style={styles.descriptionText}>{badge.description}</Text>

            <Text style={styles.requirementsTitle}>Requirements</Text>
            <Text style={styles.requirementsText}>{badge.requirements}</Text>

            <View style={styles.valueContainer}>
              <Text style={styles.valueTitle}>Badge Value</Text>
              <Text style={styles.valueAmount}>
                {badge.value} <Text style={styles.valueCurrency}>AETH</Text>
              </Text>
            </View>

            {!badge.unlocked && (
              <View style={styles.lockedContainer}>
                <Ionicons name="lock-closed" size={20} color="#888888" style={styles.lockedIcon} />
                <Text style={styles.lockedText}>Complete the requirements to unlock this badge</Text>
              </View>
            )}
          </ScrollView>
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
    maxHeight: "80%",
    backgroundColor: "#1A1A1A",
    borderRadius: 20,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#000000",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  content: {
    padding: 20,
  },
  badgeIconContainer: {
    alignSelf: "center",
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  tierContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  tierText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: "#CCCCCC",
    lineHeight: 22,
    marginBottom: 20,
  },
  requirementsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  requirementsText: {
    fontSize: 14,
    color: "#CCCCCC",
    lineHeight: 22,
    marginBottom: 20,
  },
  valueContainer: {
    backgroundColor: "#222222",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  valueTitle: {
    fontSize: 14,
    color: "#AAAAAA",
    marginBottom: 8,
  },
  valueAmount: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  valueCurrency: {
    fontSize: 16,
    fontWeight: "normal",
    color: "#CCCCCC",
  },
  lockedContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  lockedIcon: {
    marginRight: 12,
  },
  lockedText: {
    flex: 1,
    fontSize: 14,
    color: "#AAAAAA",
  },
})
