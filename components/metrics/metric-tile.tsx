"use client"

import React from "react"
import { View, Text, StyleSheet, TouchableOpacity, Animated } from "react-native"
import type { FitnessMetric } from "../../types/fitnessMetrics"

interface MetricTileProps {
  metric: FitnessMetric
  value: number
  goal: number
  onPress: () => void
}

const MetricTile: React.FC<MetricTileProps> = ({ metric, value, goal, onPress }) => {
  // Calculate progress percentage
  const progress = Math.min(value / goal, 1)

  // Animation for progress bar
  const progressAnim = React.useRef(new Animated.Value(0)).current

  React.useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 1000,
      useNativeDriver: false,
    }).start()
  }, [progress, progressAnim])

  // Format value based on metric type
  const formatValue = (value: number, metric: FitnessMetric): string => {
    switch (metric.name) {
      case "Steps":
        return value.toLocaleString()
      case "Distance Traveled":
        // Convert meters to km if over 1000m
        return value >= 1000 ? `${(value / 1000).toFixed(2)} km` : `${value.toFixed(0)} m`
      default:
        return value.toString()
    }
  }

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <Text style={styles.title}>{metric.name}</Text>
      </View>

      <Text style={styles.value}>{formatValue(value, metric)}</Text>

      <View style={styles.progressContainer}>
        <Animated.View
          style={[
            styles.progressBar,
            {
              width: progressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ["0%", "100%"],
              }),
            },
          ]}
        />
      </View>

      <Text style={styles.goal}>Goal: {formatValue(goal, metric)}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#1A1A1A",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
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
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    color: "#CCCCCC",
    fontWeight: "500",
  },
  value: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 12,
  },
  progressContainer: {
    height: 8,
    backgroundColor: "#333333",
    borderRadius: 4,
    marginBottom: 8,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#34C759",
    borderRadius: 4,
  },
  goal: {
    fontSize: 14,
    color: "#999999",
    textAlign: "right",
  },
})

export default MetricTile
