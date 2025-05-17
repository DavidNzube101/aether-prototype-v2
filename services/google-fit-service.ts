import { Platform } from "react-native"
import GoogleFit, { Scopes } from "react-native-google-fit"
import { updateUserProfile } from "../utils/user-service"

/**
 * Initialize Google Fit and request permissions
 */
export const initializeGoogleFit = async (): Promise<boolean> => {
  // Only run on Android
  if (Platform.OS !== "android") {
    console.log("Google Fit is only available on Android")
    throw new Error("Google Fit is only available on Android")
  }

  try {
    const options = {
      scopes: [
        Scopes.FITNESS_ACTIVITY_READ,
        Scopes.FITNESS_ACTIVITY_WRITE,
        Scopes.FITNESS_BODY_READ,
        Scopes.FITNESS_BODY_WRITE,
        Scopes.FITNESS_LOCATION_READ,
      ],
    }

    const authResult = await GoogleFit.authorize(options)

    if (authResult.success) {
      console.log("Google Fit authorization successful")
      return true
    } else {
      console.error("Google Fit authorization denied")
      throw new Error("Authorization denied")
    }
  } catch (error) {
    console.error("Error initializing Google Fit:", error)
    throw error
  }
}

/**
 * Connect to Google Fit and update user profile
 */
export const connectGoogleFit = async (userId: string): Promise<boolean> => {
  try {
    // Initialize Google Fit
    await initializeGoogleFit()

    // Update user profile to indicate connection
    await updateUserProfile(userId, {
      hasConnectedFitnessProvider: true,
      fitnessProvider: "googlefit",
    })

    console.log("Successfully connected to Google Fit")
    return true
  } catch (error) {
    console.error("Error connecting to Google Fit:", error)
    throw error
  }
}

/**
 * Get step count for today
 */
export const getTodayStepCount = async (): Promise<number> => {
  if (Platform.OS !== "android") {
    throw new Error("Google Fit is only available on Android")
  }

  try {
    const today = new Date()
    const startOfDay = new Date(today.setHours(0, 0, 0, 0))
    const endOfDay = new Date()

    const dailySteps = await GoogleFit.getDailyStepCountSamples({
      startDate: startOfDay.toISOString(),
      endDate: endOfDay.toISOString(),
    })

    // Find the steps from the most reliable source
    let steps = 0
    for (const source of dailySteps) {
      if (source.steps && source.steps.length > 0) {
        steps = source.steps[0].value
        break
      }
    }

    return steps
  } catch (error) {
    console.error("Error getting step count from Google Fit:", error)
    throw error
  }
}

/**
 * Get calories burned for today
 */
export const getTodayCaloriesBurned = async (): Promise<number> => {
  if (Platform.OS !== "android") {
    throw new Error("Google Fit is only available on Android")
  }

  try {
    const today = new Date()
    const startOfDay = new Date(today.setHours(0, 0, 0, 0))
    const endOfDay = new Date()

    const calorieData = await GoogleFit.getDailyCalorieSamples({
      startDate: startOfDay.toISOString(),
      endDate: endOfDay.toISOString(),
      basalCalculation: false,
    })

    let calories = 0
    if (calorieData && calorieData.length > 0) {
      calories = calorieData[0].calorie
    }

    return calories
  } catch (error) {
    console.error("Error getting calories from Google Fit:", error)
    throw error
  }
}
