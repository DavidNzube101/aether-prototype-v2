// import { metrics } from '../../data/fitnessMetrics';
import AsyncStorage from "@react-native-async-storage/async-storage"
import { getUserMetrics, updateMetric } from "../../services/metrics-service"
import { metrics, type FitnessMetric } from "../../types/fitnessMetrics"

// Constants
const STORAGE_KEYS = {
  METRICS_DATA: "@AetherFit:metricsData",
  METRICS_HISTORY: "@AetherFit:metricsHistory",
  LAST_SYNC: "@AetherFit:lastMetricsSync",
}

// Types
type MetricsData = Record<string, number>
type MetricsHistoryEntry = {
  date: string
  metrics: MetricsData
}

class MetricsDataStorage {
  private static instance: MetricsDataStorage
  private metricsData: MetricsData = {}
  private metricsHistory: MetricsHistoryEntry[] = []
  private syncInterval: any = null

  private constructor() {}

  public static getInstance(): MetricsDataStorage {
    if (!MetricsDataStorage.instance) {
      MetricsDataStorage.instance = new MetricsDataStorage()
    }
    return MetricsDataStorage.instance
  }

  /**
   * Initialize the metrics data storage
   */
  public async initialize(): Promise<void> {
    try {
      // Load local data
      await this.loadLocalData()

      // Sync with Firebase
      await this.syncWithFirebase()

      // Set up periodic sync
      this.syncInterval = setInterval(
        () => {
          this.syncWithFirebase()
        },
        30 * 60 * 1000,
      ) // Sync every 30 minutes

      console.log("Metrics data storage initialized")
    } catch (error) {
      console.error("Failed to initialize metrics data storage:", error)
    }
  }

  /**
   * Get all metrics data
   */
  public getMetricsData(): MetricsData {
    return { ...this.metricsData }
  }

  /**
   * Get a specific metric value
   */
  public getMetricValue(metricName: string): number {
    return this.metricsData[metricName] || 0
  }

  /**
   * Update a metric value
   */
  public async updateMetricValue(metricName: string, value: number): Promise<void> {
    try {
      this.metricsData[metricName] = value

      // Update in Firebase
      await updateMetric(metricName, value)

      // Save locally
      await this.saveLocalData()

      console.log(`Updated metric ${metricName} to ${value}`)
    } catch (error) {
      console.error(`Failed to update metric ${metricName}:`, error)
    }
  }

  /**
   * Get metrics history for a specific date range
   */
  public getMetricsHistory(
    startDate: Date = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    endDate: Date = new Date(),
  ): MetricsHistoryEntry[] {
    return this.metricsHistory.filter((entry) => {
      const entryDate = new Date(entry.date)
      return entryDate >= startDate && entryDate <= endDate
    })
  }

  /**
   * Get available metrics (implemented ones)
   */
  public getAvailableMetrics(): FitnessMetric[] {
    // For now, only Steps and Distance are implemented
    return metrics.filter((metric) => metric.name === "Steps" || metric.name === "Distance Traveled")
  }

  /**
   * Get coming soon metrics (not yet implemented)
   */
  public getComingSoonMetrics(): FitnessMetric[] {
    // All metrics except Steps and Distance
    return metrics.filter((metric) => metric.name !== "Steps" && metric.name !== "Distance Traveled")
  }

  /**
   * Sync with Firebase
   */
  private async syncWithFirebase(): Promise<void> {
    try {
      // Get metrics from Firebase
      const firebaseMetrics = await getUserMetrics()

      // Update local data
      this.metricsData = { ...firebaseMetrics }

      // Save locally
      await this.saveLocalData()

      // Update last sync time
      await AsyncStorage.setItem(STORAGE_KEYS.LAST_SYNC, Date.now().toString())

      console.log("Synced with Firebase")
    } catch (error) {
      console.error("Failed to sync with Firebase:", error)
    }
  }

  /**
   * Save data to local storage
   */
  private async saveLocalData(): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.METRICS_DATA, JSON.stringify(this.metricsData))
      await AsyncStorage.setItem(STORAGE_KEYS.METRICS_HISTORY, JSON.stringify(this.metricsHistory))
    } catch (error) {
      console.error("Failed to save local data:", error)
    }
  }

  /**
   * Load data from local storage
   */
  private async loadLocalData(): Promise<void> {
    try {
      const metricsData = await AsyncStorage.getItem(STORAGE_KEYS.METRICS_DATA)
      const metricsHistory = await AsyncStorage.getItem(STORAGE_KEYS.METRICS_HISTORY)

      if (metricsData) this.metricsData = JSON.parse(metricsData)
      if (metricsHistory) this.metricsHistory = JSON.parse(metricsHistory)

      console.log("Loaded local data")
    } catch (error) {
      console.error("Failed to load local data:", error)
    }
  }
}

export default MetricsDataStorage
