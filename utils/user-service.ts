import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore"
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
