import { Platform, AppState, type AppStateStatus } from "react-native"
import BackgroundFetch from "react-native-background-fetch"
import BackgroundTrackingService from "./background-tracking-service"
import MetricsDataStorage from "./metrics-data-storage"

class BackgroundExecutionManager {
  private static instance: BackgroundExecutionManager
  private appState: AppStateStatus = "active"
  private trackingService: BackgroundTrackingService
  private metricsStorage: MetricsDataStorage
  private isInitialized = false

  private constructor() {
    this.trackingService = BackgroundTrackingService.getInstance()
    this.metricsStorage = MetricsDataStorage.getInstance()
  }

  public static getInstance(): BackgroundExecutionManager {
    if (!BackgroundExecutionManager.instance) {
      BackgroundExecutionManager.instance = new BackgroundExecutionManager()
    }
    return BackgroundExecutionManager.instance
  }

  /**
   * Initialize the background execution manager
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      // Initialize services
      await this.trackingService.initialize()
      await this.metricsStorage.initialize()

      // Set up app state listener
      AppState.addEventListener("change", this.handleAppStateChange)

      // Register headless task for background execution
      this.registerHeadlessTask()

      this.isInitialized = true
      console.log("Background execution manager initialized")
    } catch (error) {
      console.error("Failed to initialize background execution manager:", error)
    }
  }

  /**
   * Start background tracking
   */
  public async startTracking(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize()
    }

    await this.trackingService.startTracking()
    console.log("Background tracking started")
  }

  /**
   * Stop background tracking
   */
  public stopTracking(): void {
    this.trackingService.stopTracking()
    console.log("Background tracking stopped")
  }

  /**
   * Handle app state changes
   */
  private handleAppStateChange = (nextAppState: AppStateStatus): void => {
    console.log(`App state changed: ${this.appState} -> ${nextAppState}`)

    // App is going to background
    if (this.appState === "active" && (nextAppState === "background" || nextAppState === "inactive")) {
      // Ensure tracking continues in background
      this.trackingService.startTracking()
    }

    // App is coming to foreground
    if ((this.appState === "background" || this.appState === "inactive") && nextAppState === "active") {
      // Sync data when app comes to foreground
      this.metricsStorage.initialize()
    }

    this.appState = nextAppState
  }

  /**
   * Register headless task for background execution
   */
  private registerHeadlessTask(): void {
    if (Platform.OS === "android") {
      // Register headless task
      BackgroundFetch.registerHeadlessTask(async ({ taskId }) => {
        console.log("[Headless] Task started:", taskId)

        // Initialize services if needed
        const trackingService = BackgroundTrackingService.getInstance()
        await trackingService.initialize()

        // Ensure tracking is active
        await trackingService.startTracking()

        // Signal completion
        BackgroundFetch.finish(taskId)
        console.log("[Headless] Task finished:", taskId)
      })
    }
  }
}

export default BackgroundExecutionManager
