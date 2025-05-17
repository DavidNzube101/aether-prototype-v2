import { getFirestore, doc, getDoc, updateDoc, setDoc } from "firebase/firestore"
import { getStorage } from "firebase/storage"
import { initializeApp } from "firebase/app"

// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCauUU-mT9RDw3UXhBhw3H-OTGVOdHDCbM",
  authDomain: "aether-atombase.firebaseapp.com",
  projectId: "aether-atombase",
  storageBucket: "aether-atombase.firebasestorage.app",
  messagingSenderId: "439269810531",
  appId: "1:439269810531:web:1b3347c5c512705a503356",
  measurementId: "G-4WN80R3MMJ",
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)
const storage = getStorage(app)

// Cloudinary configuration
const CLOUDINARY_CLOUD_NAME = "dzlr5fyrx"
const CLOUDINARY_API_KEY = "875833447958442"
const CLOUDINARY_UPLOAD_PRESET = "ml_default"

interface privacySettingType {
  profileVisibility: string
  showActivityStatus: boolean
  showLastSeen: boolean
}

interface notificationSettingType {
  enableNotifications: boolean
  challengeReminders: boolean
  challengeInvites: boolean
  challengeUpdates: boolean
  achievementAlerts: boolean
  systemAnnouncements: boolean
  marketingMessages: boolean
}

export interface UserProfile {
  privacySettings: privacySettingType
  name: string
  profileImage: string | null
  fitnessLevel: {
    id: string
    title: string
    description: string
  } | null
  currency: {
    id: string
    name: string
    symbol: string
  } | null
  onboardingCompleted: boolean
  createdAt: string
  updatedAt: string
  walletBalance: number
  walletAddress: string
  notificationSettings: notificationSettingType
  identity: {
    offchain_id: string
    onchain_id: string
  } | null
  maxFitEnabled: boolean,
  // New fields for fitness provider
  hasConnectedFitnessProvider: boolean
  fitnessProvider: string | null
  // New field for badges
  badgesEarned: string[]
  fitRating: number
}

/**
 * Get user profile data from Firestore
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const userDoc = await getDoc(doc(db, "users", userId))

    if (userDoc.exists()) {
      return userDoc.data() as UserProfile
    }

    return null
  } catch (error) {
    console.error("Error getting user profile:", error)
    throw error
  }
}

/**
 * Create or update user profile with default values for missing fields
 */
export async function createOrUpdateUserProfile(userId: string, profileData: Partial<UserProfile>): Promise<boolean> {
  try {
    // Check if user document exists
    const userDoc = await getDoc(doc(db, "users", userId))

    if (userDoc.exists()) {
      // Update existing document
      await updateDoc(doc(db, "users", userId), {
        ...profileData,
        updatedAt: new Date().toISOString(),
      })
    } else {
      // Create new document with default values
      const defaultUserData: UserProfile = {
        privacySettings: {
          profileVisibility: "public",
          showActivityStatus: true,
          showLastSeen: true,
        },
        name: profileData.name || "AetherFit User",
        profileImage: profileData.profileImage || null,
        fitnessLevel: profileData.fitnessLevel || null,
        currency: profileData.currency || null,
        onboardingCompleted: profileData.onboardingCompleted || false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        walletBalance: 0, 
        walletAddress: "", 
        notificationSettings: {
          enableNotifications: true,
          challengeReminders: true,
          challengeInvites: true,
          challengeUpdates: true,
          achievementAlerts: true,
          systemAnnouncements: true,
          marketingMessages: false,
        },
        
        identity: null,
        hasConnectedFitnessProvider: false, // Default value for fitness provider connection
        fitnessProvider: null, // Default value for fitness provider
        badgesEarned: [], // Default empty array for badges
        fitRating: 0,
        
      }

      // Merge provided data with defaults
      const mergedData = { ...defaultUserData, ...profileData }

      await setDoc(doc(db, "users", userId), mergedData)
    }

    return true
  } catch (error) {
    console.error("Error creating/updating user profile:", error)
    throw error
  }
}

/**
 * Upload image to Cloudinary
 */
export async function uploadImageToCloudinary(imageUri: string): Promise<string | null> {
  try {
    const formData = new FormData()
    const filename = imageUri.split("/").pop()
    const match = /\.(\w+)$/.exec(filename || "")
    const type = match ? `image/${match[1]}` : "image/jpeg"

    // @ts-ignore - React Native's FormData implementation is different from the web
    formData.append("file", {
      uri: imageUri,
      type,
      name: filename || "upload.jpg",
    })

    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET)
    formData.append("api_key", CLOUDINARY_API_KEY)

    console.log(`Uploading to Cloudinary: https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`)

    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`, {
      method: "POST",
      body: formData,
      headers: {
        Accept: "application/json",
      },
    })

    console.log("Cloudinary response status:", response.status)

    const data = await response.json()
    console.log("Cloudinary response:", JSON.stringify(data))

    if (data.secure_url) {
      console.log("Upload successful, URL:", data.secure_url)
      return data.secure_url
    } else {
      console.error("No secure_url in response:", data)
      return null
    }
  } catch (err) {
    console.error("Error uploading to Cloudinary:", err)
    return null
  }
}

/**
 * Update user profile in Firestore
 */
export async function updateUserProfile(userId: string, profileData: Partial<UserProfile>): Promise<boolean> {
  try {
    // Filter out null values to avoid overwriting existing data with null
    const filteredData = Object.entries(profileData).reduce<Record<string, any>>((acc, [key, value]) => {
      if (value !== null && value !== undefined) {
        acc[key] = value
      }
      return acc
    }, {})

    await updateDoc(doc(db, "users", userId), {
      ...filteredData,
      updatedAt: new Date().toISOString(),
    })

    return true
  } catch (error) {
    console.error("Error updating user profile:", error)
    throw error
  }
}

/**
 * Check if user has completed onboarding
 */
export async function hasCompletedOnboarding(userId: string): Promise<boolean> {
  try {
    const userProfile = await getUserProfile(userId)
    return userProfile?.onboardingCompleted || false
  } catch (error) {
    console.error("Error checking onboarding status:", error)
    return false
  }
}

/**
 * Connect fitness provider for user
 */
export async function connectFitnessProvider(userId: string, provider: string): Promise<boolean> {
  try {
    await updateUserProfile(userId, {
      hasConnectedFitnessProvider: true,
      fitnessProvider: provider,
    })
    return true
  } catch (error) {
    console.error("Error connecting fitness provider:", error)
    return false
  }
}

/**
 * Disconnect fitness provider for user
 */
export async function disconnectFitnessProvider(userId: string): Promise<boolean> {
  try {
    await updateUserProfile(userId, {
      hasConnectedFitnessProvider: false,
      fitnessProvider: null,
    })
    return true
  } catch (error) {
    console.error("Error disconnecting fitness provider:", error)
    return false
  }
}

/**
 * Add badge to user's earned badges
 */
export async function addBadgeToUser(userId: string, badgeName: string): Promise<boolean> {
  try {
    const userProfile = await getUserProfile(userId)

    if (!userProfile) {
      throw new Error("User profile not found")
    }

    const currentBadges = userProfile.badgesEarned || []

    // Check if badge already exists
    if (!currentBadges.includes(badgeName)) {
      const updatedBadges = [...currentBadges, badgeName]

      await updateUserProfile(userId, {
        badgesEarned: updatedBadges,
      })
    }

    return true
  } catch (error) {
    console.error("Error adding badge to user:", error)
    return false
  }
}

/**
 * Get user's earned badges
 */
export async function getUserBadges(userId: string): Promise<string[]> {
  try {
    const userProfile = await getUserProfile(userId)
    return userProfile?.badgesEarned || []
  } catch (error) {
    console.error("Error getting user badges:", error)
    return []
  }
}
