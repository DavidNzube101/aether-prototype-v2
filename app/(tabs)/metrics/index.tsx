"use client"

import { useState, useEffect, useCallback } from "react"
import { View, Text, StyleSheet, ScrollView, RefreshControl } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useAuth } from "../../../context/auth-context"
import BackgroundExecutionManager from "../../../services/metrics/background-execution-manager"
import MetricsDataStorage from "../../../services/metrics/metrics-data-storage"
import MetricTile from "../../../components/metrics/metric-tile"
import ComingSoonTile from "../../../components/metrics/coming-soon-tile"
import MetricDetailSheet from "../../../components/metrics/metric-detail-sheet"
import SensorStatusIndicator from "../../../components/metrics/sensor-status-indicator"
import type { FitnessMetric } from "../../../types/fitnessMetrics"

export default function MetricsScreen() {
  const { user } = useAuth()
  const [sensorStatus, setSensorStatus] = useState<"active" | "inactive" | "error">("inactive")
  const [metricsData, setMetricsData] = useState<Record<string, number>>({})
  const [metricGoals, setMetricGoals] = useState<Record<string, number>>({
    Steps: 10000,
    "Distance Traveled": 8000, // 8km in meters
  })
  const [selectedMetric, setSelectedMetric] = useState<FitnessMetric | null>(null)
  const [isDetailSheetVisible, setIsDetailSheetVisible] = useState(false)
  const [historyData, setHistoryData] = useState<{ date: string; value: number }[]>([])
  const [refreshing, setRefreshing] = useState(false)
  const [availableMetrics, setAvailableMetrics] = useState<FitnessMetric[]>([])
  const [comingSoonMetrics, setComingSoonMetrics] = useState<FitnessMetric[]>([])

  // Initialize services
  useEffect(() => {
    const initializeServices = async () => {
      try {
        // Initialize background execution manager
        const backgroundManager = BackgroundExecutionManager.getInstance()
        await backgroundManager.initialize()

        // Start tracking
        await backgroundManager.startTracking()

        // Set sensor status to active
        setSensorStatus("active")

        // Get metrics data storage
        const metricsStorage = MetricsDataStorage.getInstance()

        // Get available and coming soon metrics
        setAvailableMetrics(metricsStorage.getAvailableMetrics())
        setComingSoonMetrics(metricsStorage.getComingSoonMetrics())

        // Load metrics data
        const data = metricsStorage.getMetricsData()
        setMetricsData(data)

        console.log("Services initialized successfully")
      } catch (error) {
        console.error("Failed to initialize services:", error)
        setSensorStatus("error")
      }
    }

    initializeServices()

    // Clean up on unmount
    return () => {
      // No need to stop tracking when unmounting, as we want it to continue in the background
    }
  }, [])

  // Refresh metrics data
  const refreshMetricsData = useCallback(async () => {
    setRefreshing(true)

    try {
      const metricsStorage = MetricsDataStorage.getInstance()
      await metricsStorage.initialize() // This will sync with Firebase

      const data = metricsStorage.getMetricsData()
      setMetricsData(data)

      console.log("Metrics data refreshed")
    } catch (error) {
      console.error("Failed to refresh metrics data:", error)
    } finally {
      setRefreshing(false)
    }
  }, [])

  // Handle pull-to-refresh
  const onRefresh = useCallback(() => {
    refreshMetricsData()
  }, [refreshMetricsData])

  // Handle metric tile press
  const handleMetricPress = useCallback(
    (metric: FitnessMetric) => {
      setSelectedMetric(metric)

      // Generate some dummy history data for now
      // In a real app, this would come from the metrics history
      const today = new Date()
      const dummyHistory = Array.from({ length: 7 }, (_, i) => {
        const date = new Date()
        date.setDate(today.getDate() - (6 - i))

        // Generate a random value around the current value
        const baseValue = metricsData[metric.name] || 0
        const randomFactor = 0.7 + Math.random() * 0.6 // Between 70% and 130%
        const value = Math.round(baseValue * randomFactor)

        return {
          date: date.toISOString(),
          value,
        }
      })

      setHistoryData(dummyHistory)
      setIsDetailSheetVisible(true)
    },
    [metricsData],
  )

  // Handle coming soon metric press
  const handleComingSoonPress = useCallback((metric: FitnessMetric) => {
    // Show a simple alert or modal explaining this feature is coming soon
    alert(`${metric.name} tracking will be available in a future update!`)
  }, [])

  // Handle goal update
  const handleUpdateGoal = useCallback((metricName: string, newGoal: number) => {
    setMetricGoals((prev) => ({
      ...prev,
      [metricName]: newGoal,
    }))
  }, [])

  // Close detail sheet
  const closeDetailSheet = useCallback(() => {
    setIsDetailSheetVisible(false)
    setSelectedMetric(null)
  }, [])

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFFFFF" colors={["#FFFFFF"]} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>Fitness Metrics</Text>
        </View>

        {/* Sensor Status Indicator (replaces the fitness provider connection) */}
        <SensorStatusIndicator status={sensorStatus} />

        {/* Available Metrics */}
        <View style={styles.metricsContainer}>
          {availableMetrics.map((metric) => (
            <MetricTile
              key={metric.name}
              metric={metric}
              value={metricsData[metric.name] || 0}
              goal={metricGoals[metric.name] || 1000}
              onPress={() => handleMetricPress(metric)}
            />
          ))}

          {/* Coming Soon Metrics */}
          {comingSoonMetrics.map((metric) => (
            <ComingSoonTile key={metric.name} metric={metric} onPress={() => handleComingSoonPress(metric)} />
          ))}
        </View>
      </ScrollView>

      {/* Metric Detail Sheet */}
      {selectedMetric && (
        <MetricDetailSheet
          metric={selectedMetric}
          value={metricsData[selectedMetric.name] || 0}
          goal={metricGoals[selectedMetric.name] || 1000}
          historyData={historyData}
          isVisible={isDetailSheetVisible}
          onClose={closeDetailSheet}
          onUpdateGoal={(newGoal) => handleUpdateGoal(selectedMetric.name, newGoal)}
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  metricsContainer: {
    marginTop: 10,
  },
})
