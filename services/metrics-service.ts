import { getFirestore, collection, doc, getDoc, setDoc, updateDoc, Timestamp } from "firebase/firestore"
import { getAuth } from "firebase/auth"
import { metrics } from "../types/fitnessMetrics"

const db = getFirestore()
const auth = getAuth()

/**
 * Get user metrics from Firestore
 * @returns Object containing metric values
 */
export async function getUserMetrics(): Promise<Record<string, number>> {
  try {
    const user = auth.currentUser
    if (!user || !user.email) {
      throw new Error("User not authenticated")
    }

    const metricsRef = doc(db, "userMetrics", user.email)
    const metricsSnap = await getDoc(metricsRef)

    if (metricsSnap.exists()) {
      const data = metricsSnap.data()

      // Filter out metadata fields
      const metricValues: Record<string, number> = {}
      for (const key in data) {
        if (key !== "lastReset" && key !== "userId") {
          metricValues[key] = data[key]
        }
      }

      return metricValues
    }

    // If no metrics found, initialize with zeros
    const initialMetrics: Record<string, number> = {}
    metrics.forEach((metric) => {
      initialMetrics[metric.name] = 0
    })

    // Save initial metrics
    await setDoc(metricsRef, {
      ...initialMetrics,
      userId: user.email,
      lastReset: Timestamp.now(),
    })

    return initialMetrics
  } catch (error) {
    console.error("Error getting user metrics:", error)
    return {}
  }
}

/**
 * Update a specific metric value
 * @param metricName Name of the metric to update
 * @param value New value for the metric
 */
export async function updateMetric(metricName: string, value: number): Promise<boolean> {
  try {
    const user = auth.currentUser
    if (!user || !user.email) {
      throw new Error("User not authenticated")
    }

    const metricsRef = doc(db, "userMetrics", user.email)
    await updateDoc(metricsRef, {
      [metricName]: value,
    })

    return true
  } catch (error) {
    console.error(`Error updating metric ${metricName}:`, error)
    return false
  }
}

/**
 * Reset all metrics to zero and save current values to history
 */
export async function resetMetrics(): Promise<boolean> {
  try {
    const user = auth.currentUser
    if (!user || !user.email) {
      throw new Error("User not authenticated")
    }

    // Get current metrics
    const currentMetrics = await getUserMetrics()

    // Save to history
    const historyRef = doc(collection(db, "metricHistory"), `${user.email}_${Date.now()}`)
    await setDoc(historyRef, {
      userId: user.email,
      timestamp: Timestamp.now(),
      metrics: currentMetrics,
    })

    // Reset current metrics
    const resetData: Record<string, any> = {
      lastReset: Timestamp.now(),
    }

    metrics.forEach((metric) => {
      resetData[metric.name] = 0
    })

    const metricsRef = doc(db, "userMetrics", user.email)
    await setDoc(metricsRef, resetData)

    return true
  } catch (error) {
    console.error("Error resetting metrics:", error)
    return false
  }
}

/**
 * Check if metrics need to be reset (at midnight)
 * This should be called when the app starts and periodically
 */
export async function checkAndResetMetrics(): Promise<boolean> {
  try {
    const user = auth.currentUser
    if (!user || !user.email) {
      return false
    }

    const metricsRef = doc(db, "userMetrics", user.email)
    const metricsSnap = await getDoc(metricsRef)

    if (!metricsSnap.exists()) {
      return false
    }

    const data = metricsSnap.data()
    const lastReset = data.lastReset?.toDate() || new Date(0)
    const now = new Date()

    // Check if the last reset was on a different day
    const lastResetDay = lastReset.getDate()
    const nowDay = now.getDate()

    if (lastResetDay !== nowDay) {
      // It's a new day, reset metrics
      return await resetMetrics()
    }

    return false
  } catch (error) {
    console.error("Error checking metrics reset:", error)
    return false
  }
}

/**
 * Inject dummy values into metrics for testing
 */
export async function injectDummyMetricValues(): Promise<boolean> {
  try {
    const user = auth.currentUser
    if (!user || !user.email) {
      throw new Error("User not authenticated")
    }

    // Generate random values for each metric
    const dummyData: Record<string, any> = {}

    metrics.forEach((metric) => {
      // Generate a random value based on the metric type
      let value = 0

      switch (metric.name) {
        case "Steps":
          value = Math.floor(Math.random() * 15000) + 2000 // 2000-17000 steps
          break
        case "Distance Traveled":
          value = Math.floor(Math.random() * 10000) + 500 // 500-10500 meters
          break
        case "Heart Rate":
          value = Math.floor(Math.random() * 40) + 60 // 60-100 bpm
          break
        case "Calories Burned":
          value = Math.floor(Math.random() * 500) + 100 // 100-600 calories
          break
        case "Sleep Tracking":
          value = Math.floor(Math.random() * 4) + 4 // 4-8 hours
          break
        case "Elevation Gain":
          value = Math.floor(Math.random() * 300) + 10 // 10-310 meters
          break
        default:
          // For other metrics, generate a random value between 1-100
          value = Math.floor(Math.random() * 100) + 1
      }
      
      const charactersToReplace = /['~*\/\[\]]/g;

      dummyData[metric.name.replace(charactersToReplace, "-")] = value
    })

    // Update metrics with dummy data
    const metricsRef = doc(db, "userMetrics", user.email)
    await updateDoc(metricsRef, dummyData)

    return true
  } catch (error) {
    console.error("Error injecting dummy values:", error)
    return false
  }
}

/**
 * Get metric history for a specific date range
 * @param startDate Start date for history query
 * @param endDate End date for history query
 */
export async function getMetricHistory(
  startDate: Date = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Default to last 7 days
  endDate: Date = new Date(),
): Promise<any[]> {
  try {
    const user = auth.currentUser
    if (!user || !user.email) {
      throw new Error("User not authenticated")
    }

    // Query metric history collection
    const historyCollection = collection(db, "metricHistory")
    const historySnap = await getDoc(doc(historyCollection, user.email))

    if (!historySnap.exists()) {
      return []
    }

    const historyData = historySnap.data()
    const history = []

    // Filter by date range
    for (const key in historyData) {
      if (key !== "userId") {
        const entry = historyData[key]
        const timestamp = entry.timestamp.toDate()

        if (timestamp >= startDate && timestamp <= endDate) {
          history.push({
            date: timestamp,
            ...entry.metrics,
          })
        }
      }
    }

    // Sort by date
    history.sort((a, b) => a.date.getTime() - b.date.getTime())

    return history
  } catch (error) {
    console.error("Error getting metric history:", error)
    return []
  }
}

/**
 * Initialize the metrics service
 * This should be called when the app starts
 */
export async function initializeMetricsService(): Promise<void> {
  try {
    // Check if metrics need to be reset
    await checkAndResetMetrics()

    // Set up periodic check (every hour)
    setInterval(
      async () => {
        await checkAndResetMetrics()
      },
      60 * 60 * 1000,
    ) // 1 hour
  } catch (error) {
    console.error("Error initializing metrics service:", error)
  }
}
