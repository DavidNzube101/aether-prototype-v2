import type { Challenge, Creator } from "../types/challenge"
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  query,
  where,
  getDoc,
  limit,
  arrayUnion,
  increment,
} from "firebase/firestore"
import { initializeApp } from "firebase/app"
import { uploadImageToCloudinary } from "../utils/user-service"
import { getAuth } from "firebase/auth"

// Default image for challenges
const defaultImage = require("../assets/images/challenges/steps-challenge.png")
const defaultIcon = require("../assets/images/challenges/steps-challenge.png")

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
const auth = getAuth(app)

/**
 * Get all challenges with images attached from Firestore
 * @param excludeCurrentUser Whether to exclude challenges created by the current user
 * @param onlyCurrentUser Whether to only include challenges created by the current user
 * @param maxResults Maximum number of results to return (optional)
 */
export async function getAllChallenges(
  excludeCurrentUser = false,
  onlyCurrentUser = false,
  maxResults?: number,
): Promise<Challenge[]> {
  try {
    // Get current user
    const user = auth.currentUser

    // Get challenges from Firestore
    const challengesCollection = collection(db, "challenges")
    let q = query(challengesCollection)

    // Apply user filters if authenticated
    if (user && user.email) {
      console.log(`Current user email: ${user.email}`)

      if (onlyCurrentUser) {
        // Get only challenges created by the current user
        console.log("Fetching only challenges created by the current user")
        q = query(challengesCollection, where("creator.offchain_identifier", "==", user.email))
      } else if (excludeCurrentUser) {
        // NOTE: We're not using inequality filter with ordering to avoid index issues
        // Instead, we'll fetch all challenges and filter in memory
        console.log("Fetching all challenges and filtering out current user's challenges in memory")
      }
    } else {
      console.log("No authenticated user found, fetching all challenges")
    }

    // Apply limit if specified
    if (maxResults) {
      q = query(q, limit(maxResults))
    }

    // Execute query
    const querySnapshot = await getDocs(q)

    if (querySnapshot.empty) {
      console.log("No challenges found with the specified criteria")
      return []
    }

    // Process results
    let challenges = querySnapshot.docs.map((doc) => {
      const data = doc.data() as Challenge

      // Process image URLs
      let imageSource = defaultImage
      if (data.image) {
        if (typeof data.image === "string") {
          imageSource = { uri: data.image }
        } else {
          imageSource = data.image
        }
      }

      // Process icon URLs
      let iconSource = defaultIcon
      if (data.icon) {
        if (typeof data.icon === "string") {
          iconSource = { uri: data.icon }
        } else {
          iconSource = data.icon
        }
      }

      return {
        ...data,
        id: doc.id,
        image: imageSource,
        icon: iconSource,
      }
    })

    // If we need to exclude current user's challenges, do it in memory
    if (excludeCurrentUser && user && user.email) {
      challenges = challenges.filter(
        (challenge) => typeof challenge.creator === "object" && challenge.creator?.offchain_identifier !== user.email,
      )
      console.log(`Filtered out current user's challenges, ${challenges.length} remaining`)
    }

    // Sort by name for consistent results (now safe to do in memory)
    challenges.sort((a, b) => a.name.localeCompare(b.name))

    // Apply limit if needed (again, in memory)
    if (maxResults && challenges.length > maxResults) {
      challenges = challenges.slice(0, maxResults)
    }

    console.log(`Found ${challenges.length} challenges matching the criteria`)
    return challenges
  } catch (error) {
    console.error("Error in getAllChallenges:", error)
    // Return empty array instead of throwing to prevent app crashes
    return []
  }
}

/**
 * Get challenges the user has joined
 */
export async function getJoinedChallenges(): Promise<Challenge[]> {
  try {
    // Get current user
    const user = auth.currentUser
    if (!user || !user.email) {
      console.error("No authenticated user found")
      return []
    }

    // Get all challenges
    const challengesCollection = collection(db, "challenges")
    const querySnapshot = await getDocs(challengesCollection)

    if (querySnapshot.empty) {
      console.log("No challenges found")
      return []
    }

    // Filter challenges where the user is a participant
    const joinedChallenges = querySnapshot.docs
      .map((doc) => {
        const data = doc.data() as Challenge

        // Process image URLs
        let imageSource = defaultImage
        if (data.image) {
          if (typeof data.image === "string") {
            imageSource = { uri: data.image }
          } else {
            imageSource = data.image
          }
        }

        // Process icon URLs
        let iconSource = defaultIcon
        if (data.icon) {
          if (typeof data.icon === "string") {
            iconSource = { uri: data.icon }
          } else {
            iconSource = data.icon
          }
        }

        return {
          ...data,
          id: doc.id,
          image: imageSource,
          icon: iconSource,
        }
      })
      .filter((challenge) => {
        const participants = challenge.participants || []
        return user.email ? participants.includes(user.email) : false
      })

    console.log(`Found ${joinedChallenges.length} joined challenges`)
    return joinedChallenges
  } catch (error) {
    console.error("Error in getJoinedChallenges:", error)
    return []
  }
}

/**
 * Check if the user has joined a challenge
 * @param challengeId The ID of the challenge
 * @returns True if the user has joined the challenge
 */
export async function hasUserJoinedChallenge(challengeId: string): Promise<boolean> {
  try {
    // Get current user
    const user = auth.currentUser
    if (!user || !user.email) {
      return false
    }

    // Get the challenge
    const challengeRef = doc(db, "challenges", challengeId)
    const challengeSnap = await getDoc(challengeRef)

    if (!challengeSnap.exists()) {
      return false
    }

    const challengeData = challengeSnap.data() as Challenge
    const participants = challengeData.participants || []

    return participants.includes(user.email)
  } catch (error) {
    console.error("Error checking if user joined challenge:", error)
    return false
  }
}

/**
 * Get challenges for the home screen
 * Returns a curated selection of challenges for the home screen
 */
export async function getHomeChallenges(): Promise<Challenge[]> {
  try {
    // Get challenges NOT created by the current user, with a limit of 10 to work with
    const allChallenges = await getAllChallenges(true, false, 10)
    console.log(`Total challenges fetched for home screen: ${allChallenges.length}`)

    if (allChallenges.length === 0) {
      // If no challenges found with user filter, try getting all challenges
      console.log("No challenges found with user filter, fetching all challenges")
      const allAvailableChallenges = await getAllChallenges(false, false, 10)

      if (allAvailableChallenges.length === 0) {
        console.log("No challenges found in the database at all")
        return []
      }

      console.log(`Found ${allAvailableChallenges.length} total challenges for home screen`)

      // Return up to 3 challenges
      return allAvailableChallenges.slice(0, 3)
    }

    // Filter for active challenges first
    const activeChallenges = allChallenges.filter((c) => c.activated_status === "active")
    console.log(`Active challenges for home screen: ${activeChallenges.length}`)

    // If we have active challenges, prioritize them
    if (activeChallenges.length > 0) {
      // Try to get a diverse selection
      const sponsoredChallenge = activeChallenges.find((c) => c.sponsored === true)
      const usdcChallenge = activeChallenges.find((c) => c.stakeCurrency === "USDC" && c.id !== sponsoredChallenge?.id)
      const solChallenge = activeChallenges.find((c) => c.stakeCurrency === "SOL" && c.id !== sponsoredChallenge?.id)

      // Combine the selected challenges
      let result = [sponsoredChallenge, usdcChallenge, solChallenge].filter(Boolean) as Challenge[]

      // If we have fewer than 3 challenges, add more from the active challenges
      if (result.length < 3 && activeChallenges.length > result.length) {
        const additionalChallenges = activeChallenges
          .filter((c) => !result.some((rc) => rc.id === c.id))
          .slice(0, 3 - result.length)

        result = [...result, ...additionalChallenges]
      }

      console.log(`Returning ${result.length} active challenges for home screen`)
      return result
    }

    // If no active challenges, just return up to 3 challenges
    const result = allChallenges.slice(0, 3)
    console.log(`Returning ${result.length} challenges for home screen (no active challenges found)`)
    return result
  } catch (error) {
    console.error("Error in getHomeChallenges:", error)
    return []
  }
}

/**
 * Get challenges for the explore screen
 */
export async function getExploreChallenges(): Promise<Challenge[]> {
  try {
    // Fetch all challenges excluding current user's, no max limit
    const allChallenges = await getAllChallenges(true, false)
    return allChallenges
  } catch (error) {
    console.error("Error in getExploreChallenges:", error)
    return []
  }
}

/**
 * Get a challenge by ID
 */
export async function getChallengeById(id: string): Promise<Challenge | null> {
  try {
    const challengeRef = doc(db, "challenges", id)
    const challengeSnap = await getDoc(challengeRef)

    if (challengeSnap.exists()) {
      const data = challengeSnap.data() as Challenge

      // Process image URLs
      let imageSource = defaultImage
      if (data.image) {
        if (typeof data.image === "string") {
          imageSource = { uri: data.image }
        } else {
          imageSource = data.image
        }
      }

      // Process icon URLs
      let iconSource = defaultIcon
      if (data.icon) {
        if (typeof data.icon === "string") {
          iconSource = { uri: data.icon }
        } else {
          iconSource = data.icon
        }
      }

      return {
        ...data,
        id: challengeSnap.id,
        image: imageSource,
        icon: iconSource,
      }
    }

    return null
  } catch (error) {
    console.error("Error getting challenge by ID:", error)
    return null
  }
}

/**
 * Filter challenges based on criteria
 */
export async function filterChallenges(
  searchQuery = "",
  type = "All",
  sponsored = "All",
  duration: [number, number] = [3, 90],
  stakeCurrency = "All",
  intensity = "All",
  status = "All",
): Promise<Challenge[]> {
  try {
    // Get ALL challenges without any filtering
    const challengesCollection = collection(db, "challenges")
    const querySnapshot = await getDocs(challengesCollection)

    if (querySnapshot.empty) {
      console.log("No challenges found in the database")
      return []
    }

    // Process all challenges from Firestore
    const allChallenges = querySnapshot.docs.map((doc) => {
      const data = doc.data() as Challenge

      // Process image URLs
      let imageSource = defaultImage
      if (data.image) {
        if (typeof data.image === "string") {
          imageSource = { uri: data.image }
        } else {
          imageSource = data.image
        }
      }

      // Process icon URLs
      let iconSource = defaultIcon
      if (data.icon) {
        if (typeof data.icon === "string") {
          iconSource = { uri: data.icon }
        } else {
          iconSource = data.icon
        }
      }

      return {
        ...data,
        id: doc.id,
        image: imageSource,
        icon: iconSource,
      }
    })

    console.log(`Total challenges before filtering: ${allChallenges.length}`)

    // Apply filters
    const filteredChallenges = allChallenges.filter((challenge) => {
      return applyFilters(challenge, searchQuery, type, sponsored, duration, stakeCurrency, intensity, status)
    })

    console.log(`Challenges after filtering: ${filteredChallenges.length}`)
    return filteredChallenges
  } catch (error) {
    console.error("Error in filterChallenges:", error)
    return []
  }
}

/**
 * Helper function to apply filters to a challenge
 */
function applyFilters(
  challenge: Challenge,
  searchQuery = "",
  type = "All",
  sponsored = "All",
  duration: [number, number] = [3, 90],
  stakeCurrency = "All",
  intensity = "All",
  status = "All",
): boolean {
  // Search query filter
  if (searchQuery && !challenge.name.toLowerCase().includes(searchQuery.toLowerCase())) {
    return false
  }

  // Challenge type filter
  if (type !== "All" && challenge.type !== type) {
    return false
  }

  // Sponsorship status filter
  if (sponsored === "Sponsored" && !challenge.sponsored) {
    return false
  }
  if (sponsored === "Not Sponsored" && challenge.sponsored) {
    return false
  }

  // Duration filter
  if (challenge.duration < duration[0] || challenge.duration > duration[1]) {
    return false
  }

  // Stake currency filter
  if (stakeCurrency !== "All" && challenge.stakeCurrency !== stakeCurrency) {
    return false
  }

  // Intensity level filter
  if (intensity !== "All" && challenge.intensity !== intensity) {
    return false
  }

  // Status filter
  if (status !== "All") {
    const challengeStatus = determineChallengeStatus(challenge)
    if (challengeStatus.toLowerCase() !== status.toLowerCase()) {
      console.log(`Status mismatch: ${challengeStatus} vs ${status}`)
      return false
    }
  }

  return true
}

/**
 * Get challenges created by the current user
 */
export async function getUserChallenges(): Promise<Challenge[]> {
  try {
    // Get only challenges created by the current user
    return await getAllChallenges(false, true)
  } catch (error) {
    console.error("Error in getUserChallenges:", error)
    return []
  }
}

/**
 * Create a new challenge
 */
export async function createChallenge(challengeData: any): Promise<Challenge | null> {
  try {
    // Get current user
    const user = auth.currentUser
    if (!user || !user.email) {
      console.error("No authenticated user found")
      throw new Error("User not authenticated")
    }

    // Upload images to Cloudinary if provided
    let bannerImageUrl = null
    let iconImageUrl = null

    if (challengeData.bannerImage) {
      console.log("Uploading banner image to Cloudinary...")
      bannerImageUrl = await uploadImageToCloudinary(challengeData.bannerImage)
      console.log("Banner image uploaded:", bannerImageUrl)
    }

    if (challengeData.iconImage) {
      console.log("Uploading icon image to Cloudinary...")
      iconImageUrl = await uploadImageToCloudinary(challengeData.iconImage)
      console.log("Icon image uploaded:", iconImageUrl)
    }

    // Calculate duration in days
    const durationInDays = Math.ceil(
      (challengeData.endDate.getTime() - challengeData.startDate.getTime()) / (1000 * 60 * 60 * 1000 * 24),
    )

    // Create creator object with the new structure
    const creator: Creator = {
      app_name: user.displayName || "Aether Fit",
      offchain_identifier: user.email,
      onchain_identifier: "", 
    }

    // Prepare challenge data with metric information
    const newChallenge: Partial<Challenge> = {
      name: challengeData.title,
      image: bannerImageUrl,
      icon: iconImageUrl,
      reward: `+${Math.floor(challengeData.stakeAmount * 2)} AETH`, // Example reward calculation
      timeLeft: `Ends in ${durationInDays}d`,
      type: challengeData.selectedMetric?.name || "Fitness", // Use the metric name as the type
      sponsored: false,
      duration: durationInDays,
      stakeCurrency: challengeData.stakeCurrency,
      intensity: challengeData.intensity,
      stakeAmount: challengeData.stakeAmount,
      likes: 0,
      dislikes: 0,
      hasChatroom: challengeData.allowComments,
      creator: creator,
      description: challengeData.description,
      rules: challengeData.rules,
      metrics: [challengeData.selectedMetric?.name], // Store the metric name in an array for compatibility
      metricMeasurement: challengeData.selectedMetric?.measurement, // Store the measurement unit
      targetValue: challengeData.measurementValue, // Store the target value
      startDate: challengeData.startDate.toISOString(),
      endDate: challengeData.endDate.toISOString(),
      activated_status: "inactive", // Initially set to inactive

      // Initialize community statistics
      participants: [],
      participant_count: 0,
      completed_count: 0,
      liked_by: [],
    }

    console.log("Saving challenge to Firestore:", newChallenge)

    // Add to Firestore
    const docRef = await addDoc(collection(db, "challenges"), newChallenge)
    console.log("Challenge saved with ID:", docRef.id)

    // Return the created challenge
    return {
      ...newChallenge,
      id: docRef.id,
      image: bannerImageUrl ? { uri: bannerImageUrl } : defaultImage,
      icon: iconImageUrl ? { uri: iconImageUrl } : defaultIcon,
    } as Challenge
  } catch (error) {
    console.error("Error in createChallenge:", error)
    throw error
  }
}

/**
 * Activate a challenge
 */
export async function activateChallenge(challengeId: string): Promise<boolean> {
  try {
    console.log("Activating challenge:", challengeId)

    // Update in Firestore
    const challengeRef = doc(db, "challenges", challengeId)
    await updateDoc(challengeRef, {
      activated_status: "active",
    })

    console.log("Challenge activated successfully")
    return true
  } catch (error) {
    console.error("Error in activateChallenge:", error)
    throw error
  }
}

/**
 * Like a challenge
 * @param challengeId The ID of the challenge to like
 * @returns True if the operation was successful
 */
export async function likeChallenge(challengeId: string): Promise<boolean> {
  try {
    // Get current user
    const user = auth.currentUser
    if (!user || !user.email) {
      console.error("No authenticated user found")
      throw new Error("User not authenticated")
    }

    console.log(`User ${user.email} liking challenge ${challengeId}`)

    // Get the challenge to check if user already liked it
    const challengeRef = doc(db, "challenges", challengeId)
    const challengeSnap = await getDoc(challengeRef)

    if (!challengeSnap.exists()) {
      console.error("Challenge not found")
      return false
    }

    const challengeData = challengeSnap.data() as Challenge
    const likedBy = challengeData.liked_by || []

    // Check if user already liked this challenge
    if (likedBy.includes(user.email)) {
      console.log("User already liked this challenge")
      return true // Already liked, consider it successful
    }

    // Update the challenge with the new like
    await updateDoc(challengeRef, {
      likes: increment(1),
      liked_by: arrayUnion(user.email),
    })

    console.log("Challenge liked successfully")
    return true
  } catch (error) {
    console.error("Error liking challenge:", error)
    return false
  }
}

/**
 * Unlike a challenge
 * @param challengeId The ID of the challenge to unlike
 * @returns True if the operation was successful
 */
export async function unlikeChallenge(challengeId: string): Promise<boolean> {
  try {
    // Get current user
    const user = auth.currentUser
    if (!user || !user.email) {
      console.error("No authenticated user found")
      throw new Error("User not authenticated")
    }

    console.log(`User ${user.email} unliking challenge ${challengeId}`)

    // Get the challenge to check if user already liked it
    const challengeRef = doc(db, "challenges", challengeId)
    const challengeSnap = await getDoc(challengeRef)

    if (!challengeSnap.exists()) {
      console.error("Challenge not found")
      return false
    }

    const challengeData = challengeSnap.data() as Challenge
    const likedBy = challengeData.liked_by || []

    // Check if user liked this challenge
    if (!likedBy.includes(user.email)) {
      console.log("User hasn't liked this challenge")
      return true // Already not liked, consider it successful
    }

    // Remove user from liked_by array
    const updatedLikedBy = likedBy.filter((email) => email !== user.email)

    // Update the challenge
    await updateDoc(challengeRef, {
      likes: increment(-1),
      liked_by: updatedLikedBy,
    })

    console.log("Challenge unliked successfully")
    return true
  } catch (error) {
    console.error("Error unliking challenge:", error)
    return false
  }
}

/**
 * Join a challenge (stake and participate)
 * @param challengeId The ID of the challenge to join
 * @returns True if the operation was successful
 */
export async function joinChallenge(challengeId: string): Promise<boolean> {
  try {
    // Get current user
    const user = auth.currentUser
    if (!user || !user.email) {
      console.error("No authenticated user found")
      throw new Error("User not authenticated")
    }

    console.log(`User ${user.email} joining challenge ${challengeId}`)

    // Get the challenge to check if user already joined it
    const challengeRef = doc(db, "challenges", challengeId)
    const challengeSnap = await getDoc(challengeRef)

    if (!challengeSnap.exists()) {
      console.error("Challenge not found")
      return false
    }

    const challengeData = challengeSnap.data() as Challenge
    const participants = challengeData.participants || []

    // Check if user already joined this challenge
    if (participants.includes(user.email)) {
      console.log("User already joined this challenge")
      return true // Already joined, consider it successful
    }

    // Update the challenge with the new participant
    await updateDoc(challengeRef, {
      participants: arrayUnion(user.email),
      participant_count: increment(1),
    })

    console.log("Challenge joined successfully")
    return true
  } catch (error) {
    console.error("Error joining challenge:", error)
    return false
  }
}

/**
 * Complete a challenge
 * @param challengeId The ID of the challenge to mark as completed
 * @returns True if the operation was successful
 */
export async function completeChallenge(challengeId: string): Promise<boolean> {
  try {
    // Get current user
    const user = auth.currentUser
    if (!user || !user.email) {
      console.error("No authenticated user found")
      throw new Error("User not authenticated")
    }

    console.log(`User ${user.email} completing challenge ${challengeId}`)

    // Get the challenge to check if user joined it
    const challengeRef = doc(db, "challenges", challengeId)
    const challengeSnap = await getDoc(challengeRef)

    if (!challengeSnap.exists()) {
      console.error("Challenge not found")
      return false
    }

    const challengeData = challengeSnap.data() as Challenge
    const participants = challengeData.participants || []

    // Check if user joined this challenge
    if (!participants.includes(user.email)) {
      console.error("User hasn't joined this challenge")
      return false
    }

    // Update the challenge completion count
    await updateDoc(challengeRef, {
      completed_count: increment(1),
    })

    console.log("Challenge marked as completed successfully")
    return true
  } catch (error) {
    console.error("Error completing challenge:", error)
    return false
  }
}

/**
 * Get community statistics for a challenge
 * @param challengeId The ID of the challenge
 * @returns Object containing community statistics
 */
export async function getChallengeCommunityStats(challengeId: string): Promise<{
  participant_count: number
  completed_count: number
  completion_rate: number
}> {
  try {
    // Get the challenge
    const challengeRef = doc(db, "challenges", challengeId)
    const challengeSnap = await getDoc(challengeRef)

    if (!challengeSnap.exists()) {
      console.error("Challenge not found")
      return {
        participant_count: 0,
        completed_count: 0,
        completion_rate: 0,
      }
    }

    const challengeData = challengeSnap.data() as Challenge

    // Get stats
    const participantCount = challengeData.participant_count || 0
    const completedCount = challengeData.completed_count || 0

    // Calculate completion rate
    const completionRate = participantCount > 0 ? Math.round((completedCount / participantCount) * 100) : 0

    return {
      participant_count: participantCount,
      completed_count: completedCount,
      completion_rate: completionRate,
    }
  } catch (error) {
    console.error("Error getting challenge community stats:", error)
    return {
      participant_count: 0,
      completed_count: 0,
      completion_rate: 0,
    }
  }
}

/**
 * Check if the current user has liked a challenge
 * @param challengeId The ID of the challenge
 * @returns True if the user has liked the challenge
 */
export async function hasUserLikedChallenge(challengeId: string): Promise<boolean> {
  try {
    // Get current user
    const user = auth.currentUser
    if (!user || !user.email) {
      return false
    }

    // Get the challenge
    const challengeRef = doc(db, "challenges", challengeId)
    const challengeSnap = await getDoc(challengeRef)

    if (!challengeSnap.exists()) {
      return false
    }

    const challengeData = challengeSnap.data() as Challenge
    const likedBy = challengeData.liked_by || []

    return likedBy.includes(user.email)
  } catch (error) {
    console.error("Error checking if user liked challenge:", error)
    return false
  }
}

/**
 * Determine challenge status based on dates and activation status
 */
export function determineChallengeStatus(challenge: Challenge): "active" | "inactive" | "expired" {
  // If already has a status, use it
  if (challenge.activated_status) {
    return challenge.activated_status as "active" | "inactive" | "expired"
  }

  const now = new Date()
  const startDate = challenge.startDate ? new Date(challenge.startDate) : new Date()
  const endDate = challenge.endDate ? new Date(challenge.endDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

  // If end date has passed, it's expired
  if (now > endDate) {
    return "expired"
  }

  // If start date has passed but not activated, it's expired
  if (now > startDate && challenge.activated_status !== "active") {
    return "expired"
  }

  // If activated, it's active
  if (challenge.activated_status === "active") {
    return "active"
  }

  // Otherwise, it's inactive
  return "inactive"
}

/**
 * Create default challenges if none exist
 * This replaces the addSampleChallenges function to provide real data instead of sample data
 */
export async function ensureDefaultChallenges(): Promise<boolean> {
  try {
    // Check if we already have challenges
    const existingChallenges = await getAllChallenges()

    if (existingChallenges.length > 0) {
      console.log(`Found ${existingChallenges.length} existing challenges, no need to create defaults`)
      return false
    }

    console.log("No existing challenges found, creating default challenges")

    // Get current user
    const user = auth.currentUser
    if (!user || !user.email) {
      console.error("No authenticated user found")
      throw new Error("User not authenticated")
    }

    // Create creator object
    const creator: Creator = {
      app_name: "Aether Fit",
      offchain_identifier: user.email,
      onchain_identifier: "",
    }

    // Default challenges with real data
    const defaultChallenges = [
      {
        name: "10K Steps Challenge",
        image: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=800",
        reward: "+50 AETH",
        timeLeft: "Ends in 7d",
        type: "Fitness",
        sponsored: true,
        duration: 7,
        stakeCurrency: "USDC",
        intensity: "Brook",
        stakeAmount: 10,
        likes: 24,
        dislikes: 3,
        hasChatroom: true,
        creator: creator,
        description:
          "Complete 10,000 steps daily for a week to earn rewards. Track your progress with any fitness app or device.",
        activated_status: "active",
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        participants: [],
        participant_count: 0,
        completed_count: 0,
        liked_by: [],
        targetValue: "10000",
        metricMeasurement: "steps",
      },
      {
        name: "Meditation Marathon",
        image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800",
        reward: "+75 AETH",
        timeLeft: "Ends in 14d",
        type: "Wellness",
        sponsored: false,
        duration: 14,
        stakeCurrency: "SOL",
        intensity: "Ridge",
        stakeAmount: 25,
        likes: 42,
        dislikes: 5,
        hasChatroom: false,
        creator: creator,
        description:
          "Meditate for at least 15 minutes daily for two weeks. Perfect for beginners looking to establish a mindfulness practice.",
        activated_status: "active",
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        participants: [],
        participant_count: 0,
        completed_count: 0,
        liked_by: [],
        targetValue: "15",
        metricMeasurement: "minutes",
      },
      {
        name: "Strength Training",
        image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=800",
        reward: "+100 AETH",
        timeLeft: "Ends in 30d",
        type: "Fitness",
        sponsored: false,
        duration: 30,
        stakeCurrency: "USDC",
        intensity: "Peak",
        stakeAmount: 50,
        likes: 87,
        dislikes: 12,
        hasChatroom: true,
        creator: creator,
        description:
          "Complete 3 strength training sessions per week for a month. Focus on major muscle groups and progressive overload.",
        activated_status: "active",
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        participants: [],
        participant_count: 0,
        completed_count: 0,
        liked_by: [],
        targetValue: "3",
        metricMeasurement: "sessions per week",
      },
      {
        name: "Yoga Challenge",
        image: "https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?auto=format&fit=crop&w=800",
        reward: "+40 AETH",
        timeLeft: "Ends in 21d",
        type: "Wellness",
        sponsored: false,
        duration: 21,
        stakeCurrency: "USDC",
        intensity: "Brook",
        stakeAmount: 15,
        likes: 63,
        dislikes: 7,
        hasChatroom: true,
        creator: creator,
        description:
          "Practice yoga for 20 minutes daily for 21 days. Suitable for all levels with modifications provided.",
        activated_status: "active",
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
        participants: [],
        participant_count: 0,
        completed_count: 0,
        liked_by: [],
        targetValue: "20",
        metricMeasurement: "minutes per day",
      },
      {
        name: "Cycling Tour",
        image: "https://images.unsplash.com/photo-1541625602330-2277a4c46182?auto=format&fit=crop&w=800",
        reward: "+150 AETH",
        timeLeft: "Ends in 45d",
        type: "Endurance",
        sponsored: true,
        duration: 45,
        stakeCurrency: "SOL",
        intensity: "Ridge",
        stakeAmount: 75,
        likes: 112,
        dislikes: 18,
        hasChatroom: true,
        creator: creator,
        description:
          "Cycle a total of 500km over 45 days. Track your rides and share your progress with the community.",
        activated_status: "active",
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
        participants: [],
        participant_count: 0,
        completed_count: 0,
        liked_by: [],
        targetValue: "500",
        metricMeasurement: "km",
      },
    ]

    // Add each default challenge to Firestore
    for (const challenge of defaultChallenges) {
      await addDoc(collection(db, "challenges"), challenge)
    }

    console.log(`Created ${defaultChallenges.length} default challenges`)
    return true
  } catch (error) {
    console.error("Error creating default challenges:", error)
    throw error
  }
}
