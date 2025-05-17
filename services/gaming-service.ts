import { getFirestore, collection, getDocs, query, where, orderBy, limit } from "firebase/firestore"
import { getUserProfile, type UserProfile } from "../utils/user-service"
import { initializeApp } from "firebase/app"

// Initialize Firebase (reusing the config from user-service)
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

// Helper function to format large numbers (e.g., 1400 -> "1.4K")
const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M"
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K"
  }
  return num.toString()
}

/**
 * Get total number of players in the system
 */
export async function getTotalPlayers(): Promise<number> {
  try {
    const usersSnapshot = await getDocs(collection(db, "users"))
    return usersSnapshot.size
  } catch (error) {
    console.error("Error getting total players:", error)
    return 0
  }
}

/**
 * Get player by email
 */
export async function getPlayerByEmail(email: string): Promise<UserProfile | null> {
  try {
    const usersRef = collection(db, "users")
    const q = query(usersRef, where("email", "==", email), limit(1))
    const querySnapshot = await getDocs(q)
    
    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].data() as UserProfile
    }
    
    return null
  } catch (error) {
    console.error("Error getting player by email:", error)
    return null
  }
}

/**
 * Get player by name
 */
export async function getPlayerByName(name: string): Promise<UserProfile | null> {
  try {
    const usersRef = collection(db, "users")
    const q = query(usersRef, where("name", "==", name), limit(1))
    const querySnapshot = await getDocs(q)

    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].data() as UserProfile
    }
    
    return null
  } catch (error) {
    console.error("Error getting player by name:", error)
    return null
  }
}

/**
 * Calculate and get player standings
 * Returns [player_rank, formatted_total_players]
 */
export async function getUserStandings(email: string): Promise<[number, string]> {
  try {
    // Get all user profiles and sort by fitRating in descending order
    const usersRef = collection(db, "users")
    const usersSnapshot = await getDocs(query(usersRef, orderBy("fitRating", "desc")))
    
    const totalPlayers = usersSnapshot.size
    const formattedTotalPlayers = formatNumber(totalPlayers)
    
    // Find the user's position in the sorted list
    let userRank = 0
    let previousFitRating = -1
    let rankCounter = 0
    
    for (let i = 0; i < usersSnapshot.docs.length; i++) {
      const userData = usersSnapshot.docs[i].data() as UserProfile
      const currentFitRating = userData.fitRating || 0

      // If this is a new rating value, update the rank counter
      if (currentFitRating !== previousFitRating) {
        rankCounter = i + 1
        previousFitRating = currentFitRating
      }
      
      // The user has this email address, so assign them this rank
      if (userData.name?.toLowerCase() === email.toLowerCase() || usersSnapshot.docs[i].id === email) {
        userRank = rankCounter
        break
      }
    }
    
    // If user not found, default to last place
    if (userRank === 0 && totalPlayers > 0) {
      userRank = totalPlayers
    }
    
    return [userRank, formattedTotalPlayers]
  } catch (error) {
    console.error("Error calculating user standings:", error)
    // Return dummy data as fallback
    return [10, "1.4K"]
  }
}

/**
 * Calculate user XP based on their activities
 * Note: This is a mock function that would normally calculate XP based on actual user data
 */
export function aggregateUserXP(email: string): number {
  try {
    // In a real implementation, we would:
    // 1. Fetch the user's activities from Firestore
    // 2. Calculate XP based on activity type, duration, intensity, etc.
    // 3. Apply any bonuses, multipliers, etc.
    
    // For now, we'll generate a consistent but pseudo-random XP value based on the email
    // This ensures the same user always gets the same XP for demo purposes
    let xpBase = 0
    for (let i = 0; i < email.length; i++) {
      xpBase += email.charCodeAt(i)
    }
    
    // Scale to a reasonable XP number between 0.5 and 10
    const scaledXP = (xpBase % 95) / 10 + 0.5
    return parseFloat(scaledXP.toFixed(1))
  } catch (error) {
    console.error("Error calculating user XP:", error)
    return 2.5 // Default fallback value
  }
}

/**
 * Get top players by fitRating
 */
export async function getTopPlayers(limitCount = 10): Promise<UserProfile[]> {
  try {
    const usersRef = collection(db, "users")
    const q = query(usersRef, orderBy("fitRating", "desc"), limit(limitCount))
    const querySnapshot = await getDocs(q)
    
    return querySnapshot.docs.map(doc => doc.data() as UserProfile)
  } catch (error) {
    console.error("Error getting top players:", error)
    return []
  }
}

/**
 * Calculate estimated weekly XP gain based on user activity patterns
 */
export function calculateWeeklyXPEstimate(email: string): number {
  // In a real implementation, this would analyze recent activity patterns
  // For now, we'll derive it from the base XP
  const baseXP = aggregateUserXP(email)
  return parseFloat((baseXP * 7).toFixed(1))
}

/**
 * Get a user's XP rank compared to all players
 */
export async function getXPRanking(email: string): Promise<[number, string]> {
  // This would normally query the database and sort users by XP
  // For now, we'll just return a simulated rank
  const baseXP = aggregateUserXP(email)
  const simulatedRank = Math.max(1, Math.floor(100 / baseXP))
  return [simulatedRank, "1.4K"]
}