import AppleHealthKit, {
  HealthInputOptions,
  HealthKitPermissions,
  HealthUnit,
} from "react-native-health";

import { Platform } from "react-native"
import { updateUserProfile } from "../utils/user-service"

const { Permissions } = AppleHealthKit.Constants;

// Define the types of permissions we need
const HEALTH_PERMISSIONS: HealthKitPermissions = {
  permissions: {
    read: [
      AppleHealthKit.Constants.Permissions.Steps,
      AppleHealthKit.Constants.Permissions.FlightsClimbed, // Added for flights climbed
      AppleHealthKit.Constants.Permissions.DistanceWalkingRunning,
      AppleHealthKit.Constants.Permissions.DistanceCycling,
      AppleHealthKit.Constants.Permissions.ActiveEnergyBurned,
      AppleHealthKit.Constants.Permissions.Weight,
      AppleHealthKit.Constants.Permissions.Height,
    ],
    write: [
      AppleHealthKit.Constants.Permissions.Steps,
      AppleHealthKit.Constants.Permissions.Weight,
      AppleHealthKit.Constants.Permissions.ActiveEnergyBurned,
    ],
  },
}

/**
 * Initialize Apple HealthKit and request permissions
 */
export const initializeHealthKit = (): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    if (Platform.OS !== "ios") {
      console.log("HealthKit is only available on iOS")
      reject(new Error("HealthKit is only available on iOS"))
      return
    }

    AppleHealthKit.initHealthKit(HEALTH_PERMISSIONS, (error: string) => {
      if (error) {
        console.error("Error initializing HealthKit:", error)
        reject(new Error(error))
        return
      }
      console.log("HealthKit initialized successfully")
      resolve(true)
    })
  })
}

/**
 * Connect to Apple Health and update user profile
 */
export const connectAppleHealth = async (userId: string): Promise<boolean> => {
  try {
    await initializeHealthKit()
    await updateUserProfile(userId, {
      hasConnectedFitnessProvider: true,
      fitnessProvider: "applehealth",
    })
    console.log("Successfully connected to Apple Health")
    return true
  } catch (error) {
    console.error("Error connecting to Apple Health:", error)
    throw error
  }
}

/**
 * Get step count for today
 */
export const getTodayStepCount = (): Promise<number> => {
  return new Promise((resolve, reject) => {
    if (Platform.OS !== "ios") {
      reject(new Error("HealthKit is only available on iOS"))
      return
    }

    const options = {
      date: new Date().toISOString(),
    }

    AppleHealthKit.getStepCount(options, (error: string, results: { value: number }) => {
      if (error) {
        reject(new Error(error))
        return
      }
      resolve(results.value)
    })
  })
}

/**
 * Get flights climbed for today
 */
export const getTodayFlightsClimbed = (): Promise<number> => {
  return new Promise((resolve, reject) => {
    if (Platform.OS !== "ios") {
      reject(new Error("HealthKit is only available on iOS"))
      return
    }

    const options = {
      startDate: new Date(new Date().setHours(0, 0, 0, 0)).toISOString(),
      endDate: new Date().toISOString(),
    }

    AppleHealthKit.getFlightsClimbed(options, (error: string, results: { value: number }) => {
      if (error) {
        reject(new Error(error))
        return
      }
      resolve(results.value)
    })
  })
}

/**
 * Get walking/running distance for today (in meters)
 */
export const getTodayDistance = (): Promise<number> => {
  return new Promise((resolve, reject) => {
    if (Platform.OS !== "ios") {
      reject(new Error("HealthKit is only available on iOS"))
      return
    }

    const options = {
      startDate: new Date(new Date().setHours(0, 0, 0, 0)).toISOString(),
      endDate: new Date().toISOString(),
      unit: AppleHealthKit.Constants.Units.meter, // Explicitly set to meters
    }

    AppleHealthKit.getDistanceWalkingRunning(options, (error: string, results: { value: number }) => {
      if (error) {
        reject(new Error(error))
        return
      }
      resolve(results.value)
    })
  })
}

/**
 * Get active energy burned for today
 */
export const getTodayActiveEnergy = (): Promise<number> => {
  return new Promise((resolve, reject) => {
    if (Platform.OS !== "ios") {
      reject(new Error("HealthKit is only available on iOS"))
      return
    }

    const options = {
      startDate: new Date(new Date().setHours(0, 0, 0, 0)).toISOString(),
      endDate: new Date().toISOString(),
    }

    AppleHealthKit.getActiveEnergyBurned(options, (error: string, results: { value: number }) => {
      if (error) {
        reject(new Error(error))
        return
      }
      resolve(results.value)
    })
  })
}