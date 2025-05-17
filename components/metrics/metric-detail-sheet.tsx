"use client"

import type React from "react"
import { useCallback, useMemo, useRef } from "react"
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from "react-native"
import BottomSheet from "@gorhom/bottom-sheet"
import type { FitnessMetric } from "../../types/fitnessMetrics"
import { LineChart } from "react-native-chart-kit"
import { X } from "lucide-react-native"

interface MetricDetailSheetProps {
  metric: FitnessMetric
  value: number
  goal: number
  historyData: { date: string; value: number }[]
  isVisible: boolean
  onClose: () => void
  onUpdateGoal: (newGoal: number) => void
}

const MetricDetailSheet: React.FC<MetricDetailSheetProps> = ({
  metric,
  value,
  goal,
  historyData,
  isVisible,
  onClose,
  onUpdateGoal,
}) => {
  // Ref
  const bottomSheetRef = useRef<BottomSheet>(null)

  // Variables
  const snapPoints = useMemo(() => ["50%", "75%"], [])

  // Callbacks
  const handleSheetChanges = useCallback(
    (index: number) => {
      console.log("handleSheetChanges", index)
      if (index === -1) {
        onClose()
      }
    },
    [onClose],
  )

  // Format value based on metric type
  const formatValue = (value: number): string => {
    switch (metric.name) {
      case "Steps":
        return value.toLocaleString()
      case "Distance Traveled":
        return value >= 1000 ? `${(value / 1000).toFixed(2)} km` : `${value.toFixed(0)} m`
      default:
        return value.toString()
    }
  }

  // Prepare chart data
  const chartData = {
    labels: historyData.map((item) => {
      const date = new Date(item.date)
      return `${date.getMonth() + 1}/${date.getDate()}`
    }),
    datasets: [
      {
        data: historyData.map((item) => item.value),
        color: (opacity = 1) => `rgba(52, 199, 89, ${opacity})`,
        strokeWidth: 2,
      },
      {
        data: Array(historyData.length).fill(goal),
        color: (opacity = 1) => `rgba(255, 149, 0, ${opacity})`,
        strokeWidth: 2,
        strokeDashArray: [5, 5],
      },
    ],
  }

  // Goal adjustment buttons
  const adjustGoal = (amount: number) => {
    const newGoal = Math.max(0, goal + amount)
    onUpdateGoal(newGoal)
  }

  // Only render when visible
  if (!isVisible) return null

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={0}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      backgroundStyle={styles.sheetBackground}
      handleIndicatorStyle={styles.indicator}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{metric.name}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Current</Text>
            <Text style={styles.statValue}>{formatValue(value)}</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Goal</Text>
            <Text style={styles.statValue}>{formatValue(goal)}</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Progress</Text>
            <Text style={styles.statValue}>{Math.round((value / goal) * 100)}%</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>History</Text>

        {historyData.length > 0 ? (
          <LineChart
            data={chartData}
            width={Dimensions.get("window").width - 32}
            height={220}
            chartConfig={{
              backgroundColor: "#1A1A1A",
              backgroundGradientFrom: "#1A1A1A",
              backgroundGradientTo: "#1A1A1A",
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: "6",
                strokeWidth: "2",
                stroke: "#34C759",
              },
            }}
            bezier
            style={styles.chart}
          />
        ) : (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>No history data available yet</Text>
          </View>
        )}

        <Text style={styles.sectionTitle}>Adjust Goal</Text>

        <View style={styles.goalAdjustContainer}>
          <TouchableOpacity style={styles.goalButton} onPress={() => adjustGoal(-Math.max(100, goal * 0.1))}>
            <Text style={styles.goalButtonText}>-10%</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.goalButton} onPress={() => adjustGoal(Math.max(100, goal * 0.1))}>
            <Text style={styles.goalButtonText}>+10%</Text>
          </TouchableOpacity>
        </View>
      </View>
    </BottomSheet>
  )
}

const styles = StyleSheet.create({
  sheetBackground: {
    backgroundColor: "#1A1A1A",
  },
  indicator: {
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  closeButton: {
    padding: 4,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  statBox: {
    flex: 1,
    backgroundColor: "#333333",
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 4,
    alignItems: "center",
  },
  statLabel: {
    fontSize: 14,
    color: "#CCCCCC",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 12,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  noDataContainer: {
    height: 220,
    backgroundColor: "#333333",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 8,
  },
  noDataText: {
    color: "#999999",
    fontSize: 16,
  },
  goalAdjustContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 8,
  },
  goalButton: {
    backgroundColor: "#333333",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
  },
  goalButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },
})

export default MetricDetailSheet
