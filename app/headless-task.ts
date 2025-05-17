import { AppRegistry } from "react-native"
import BackgroundTrackingService from "../services/metrics/background-tracking-service"

// Headless task for background execution on Android
const headlessTask = async () => {
  console.log("[Headless] Task started")

  try {
    // Initialize tracking service
    const trackingService = BackgroundTrackingService.getInstance()
    await trackingService.initialize()

    // Start tracking
    await trackingService.startTracking()

    console.log("[Headless] Task completed successfully")
  } catch (error) {
    console.error("[Headless] Task failed:", error)
  }
}

// Register the headless task
AppRegistry.registerHeadlessTask("BackgroundFetch", () => headlessTask)
