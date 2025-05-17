import type React from "react"
import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import type { FitnessMetric } from "../../types/fitnessMetrics"
import { Lock } from "lucide-react-native"

interface ComingSoonTileProps {
  metric: FitnessMetric
  onPress: () => void
}

const ComingSoonTile: React.FC<ComingSoonTileProps> = ({ metric, onPress }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <Text style={styles.title}>{metric.name}</Text>
        <Lock size={18} color="#999999" />
      </View>

      <View style={styles.content}>
        <Text style={styles.comingSoonText}>Coming Soon</Text>
        <Text style={styles.description}>This metric will be available in a future update.</Text>
      </View>

      <View style={styles.challengeLevel}>
        <Text style={styles.challengeLevelText}>{metric.challengeLevel} Level</Text>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#1A1A1A",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    opacity: 0.8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    color: "#CCCCCC",
    fontWeight: "500",
  },
  content: {
    marginBottom: 12,
  },
  comingSoonText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#999999",
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: "#777777",
  },
  challengeLevel: {
    alignSelf: "flex-end",
  },
  challengeLevelText: {
    fontSize: 12,
    color: "#666666",
    fontStyle: "italic",
  },
})

export default ComingSoonTile
