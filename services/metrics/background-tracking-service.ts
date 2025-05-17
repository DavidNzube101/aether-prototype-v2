import { Platform } from "react-native"
import BackgroundFetch from "react-native-background-fetch"
import ForegroundService from "react-native-foreground-service"
import { accelerometer, setUpdateIntervalForType, SensorTypes } from "react-native-sensors"
import { updateMetric } from "../../services/metrics-service"
import AsyncStorage from "@react-native-async-storage/async-storage"

// Constants
const STEP_THRESHOLD = 0.3 // Acceleration threshold to count as a step
const STEP_COOLDOWN = 500 // Milliseconds between steps
const STORAGE_KEYS = {
  STEPS: "@AetherFit:steps",
  DISTANCE: "@AetherFit:distance",
  LAST_SYNC: "@AetherFit:lastSync",
}

class BackgroundTrackingService {
  private static instance: BackgroundTrackingService
  private isTracking = false
  private stepCount = 0
  private distance = 0
  private lastStepTime = 0
  private subscription: any = null
  private syncInterval: any = null

  private constructor() {
    // Set sensor update interval
    setUpdateIntervalForType(SensorTypes.accelerometer, 100) // 10 readings per second
  }

  public static getInstance(): BackgroundTrackingService {
    if (!BackgroundTrackingService.instance) {
      BackgroundTrackingService.instance = new BackgroundTrackingService()
    }
    return BackgroundTrackingService.instance
  }

  /**
   * Initialize the background tracking service
   */
  public async initialize(): Promise<void> {
    try {
      // Load persisted data
      await this.loadPersistedData()

      // Configure background fetch
      await this.configureBackgroundFetch()

      console.log("Background tracking service initialized")
    } catch (error) {
      console.error("Failed to initialize background tracking:", error)
    }
  }

  /**
   * Start tracking fitness metrics
   */
  public async startTracking(): Promise<void> {
    if (this.isTracking) return

    try {
      this.isTracking = true

      // Start foreground service on Android
      if (Platform.OS === "android") {
        await this.startForegroundService()
      }

      // Start accelerometer subscription
      this.subscription = accelerometer.subscribe(({ x, y, z }) => {
        // Calculate magnitude of acceleration
        const magnitude = Math.sqrt(x * x + y * y + z * z)

        // Detect steps based on acceleration peaks
        const now = Date.now()
        if (magnitude > STEP_THRESHOLD && now - this.lastStepTime > STEP_COOLDOWN) {
          this.stepCount++
          this.distance += 0.75 // Approximate step distance in meters
          this.lastStepTime = now

          // Persist data every 10 steps
          if (this.stepCount % 10 === 0) {
            this.persistData()
          }
        }
      })

      // Set up periodic sync with Firebase
      this.syncInterval = setInterval(
        () => {
          this.syncWithFirebase()
        },
        15 * 60 * 1000,
      ) // Sync every 15 minutes

      console.log("Tracking started")
    } catch (error) {
      this.isTracking = false
      console.error("Failed to start tracking:", error)
    }
  }

  /**
   * Stop tracking fitness metrics
   */
  public stopTracking(): void {
    if (!this.isTracking) return

    try {
      // Unsubscribe from accelerometer
      if (this.subscription) {
        this.subscription.unsubscribe()
        this.subscription = null
      }

      // Clear sync interval
      if (this.syncInterval) {
        clearInterval(this.syncInterval)
        this.syncInterval = null
      }

      // Stop foreground service on Android
      if (Platform.OS === "android") {
        ForegroundService.stop()
      }

      // Final sync with Firebase
      this.syncWithFirebase()

      this.isTracking = false
      console.log("Tracking stopped")
    } catch (error) {
      console.error("Failed to stop tracking:", error)
    }
  }

  /**
   * Get current metrics
   */
  public getMetrics(): { steps: number; distance: number } {
    return {
      steps: this.stepCount,
      distance: this.distance,
    }
  }

  /**
   * Reset metrics to zero
   */
  public async resetMetrics(): Promise<void> {
    this.stepCount = 0
    this.distance = 0
    await this.persistData()
    await this.syncWithFirebase()
  }

  /**
   * Configure background fetch capability
   */
  private async configureBackgroundFetch(): Promise<void> {
    try {
      // Configure background fetch
      const status = await BackgroundFetch.configure(
        {
          minimumFetchInterval: 15, // Fetch every 15 minutes
          stopOnTerminate: false,
          startOnBoot: true,
          enableHeadless: true,
          requiredNetworkType: BackgroundFetch.NETWORK_TYPE_NONE,
        },
        async (taskId) => {
          console.log("[BackgroundFetch] Task:", taskId)

          // Sync data with Firebase
          await this.syncWithFirebase()

          // Required: Signal completion of the task
          BackgroundFetch.finish(taskId)
        },
        (error) => {
          console.error("[BackgroundFetch] Failed to configure:", error)
        },
      )

      console.log("[BackgroundFetch] Configure status:", status)
    } catch (error) {
      console.error("Failed to configure background fetch:", error)
    }
  }

  /**
   * Start foreground service (Android only)
   */
  private async startForegroundService(): Promise<void> {
    if (Platform.OS !== "android") return

    try {
      // Create notification channel
      await ForegroundService.createNotificationChannel({
        id: "aetherfit_tracking",
        name: "Fitness Tracking",
        description: "Background fitness tracking service",
        enableVibration: false,
      })

      // Start foreground service
      await ForegroundService.startService({
        id: 1,
        title: "AetherFit",
        message: "Tracking your fitness metrics",
        icon: "ic_notification",
        channelId: "aetherfit_tracking",
      })

      console.log("Foreground service started")
    } catch (error) {
      console.error("Failed to start foreground service:", error)
    }
  }

  /**
   * Persist data to local storage
   */
  private async persistData(): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.STEPS, this.stepCount.toString())
      await AsyncStorage.setItem(STORAGE_KEYS.DISTANCE, this.distance.toString())
      await AsyncStorage.setItem(STORAGE_KEYS.LAST_SYNC, Date.now().toString())
    } catch (error) {
      console.error("Failed to persist data:", error)
    }
  }

  /**
   * Load persisted data from local storage
   */
  private async loadPersistedData(): Promise<void> {
    try {
      const steps = await AsyncStorage.getItem(STORAGE_KEYS.STEPS)
      const distance = await AsyncStorage.getItem(STORAGE_KEYS.DISTANCE)

      if (steps) this.stepCount = Number.parseInt(steps, 10)
      if (distance) this.distance = Number.parseFloat(distance)

      console.log("Loaded persisted data:", { steps: this.stepCount, distance: this.distance })
    } catch (error) {
      console.error("Failed to load persisted data:", error)
    }
  }

  /**
   * Sync data with Firebase
   */
  private async syncWithFirebase(): Promise<void> {
    try {
      await updateMetric("Steps", this.stepCount)
      await updateMetric("Distance Traveled", this.distance)

      console.log("Synced with Firebase:", { steps: this.stepCount, distance: this.distance })

      // Update last sync time
      await AsyncStorage.setItem(STORAGE_KEYS.LAST_SYNC, Date.now().toString())
    } catch (error) {
      console.error("Failed to sync with Firebase:", error)
    }
  }
}

export default BackgroundTrackingService
