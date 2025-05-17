"use client"

import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Alert  } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useEffect, useState, useCallback } from "react"
import { getUserProfile, type UserProfile } from "../../../utils/user-service"
import { useAuth } from "../../../context/auth-context"
import { useRouter } from "expo-router"
import type { Challenge } from "../../../types/challenge"
import { getHomeChallenges } from "../../../services/challenge-service"
import HomeChallengeCard from "../../../components/challenge/HomeChallengeCard"
import ChallengeDetailsDrawer from "../../../components/challenge/ChallengeDetailsDrawer"
import { useFocusEffect } from "@react-navigation/native"
import TriangleLoader from "@/components/ui/TriangleLoader"
import { FeaturedWorkouts } from "@/components/home/FeaturedWorkouts"

export default function HomeScreen() {
  const { user, logout, onboardingCompleted, checkOnboardingStatus } = useAuth()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [loadingChallenges, setLoadingChallenges] = useState(true)
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null)
  const [showDetailsDrawer, setShowDetailsDrawer] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const router = useRouter()

  // Check onboarding status when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      const checkStatus = async () => {
        if (user) {
          const isOnboardingCompleted = await checkOnboardingStatus()

          // Redirect to onboarding if not completed
          if (!isOnboardingCompleted) {
            router.replace("/KYU/onboarding")
          }
        }
      }

      checkStatus()
    }, [user]),
  )

  // Fetch user profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user?.uid) {
        try {
          setLoading(true)
          const profile = await getUserProfile(user.uid)
          setUserProfile(profile)
        } catch (error) {
          console.error("Error fetching user profile:", error)
        } finally {
          setLoading(false)
        }
      }
    }

    fetchUserProfile()
  }, [user])

  // Fetch challenges when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchChallenges()
      return () => {} // Cleanup function
    }, []),
  )

  // Fetch challenges for home screen
  const fetchChallenges = async () => {
    try {
      setLoadingChallenges(true)
      setError(null)
      const homeChallenges = await getHomeChallenges()

      // Log the challenge data for debugging
      console.log(`Found ${homeChallenges.length} challenges for home screen`)
      if (homeChallenges.length > 0) {
        console.log("First home challenge:", homeChallenges[0].name)
      } else {
        console.log("No challenges found for home screen")
      }

      setChallenges(homeChallenges)
    } catch (error) {
      console.error("Error fetching challenges:", error)
      setError("Failed to load challenges")
    } finally {
      setLoadingChallenges(false)
      setRefreshing(false)
    }
  }

  type RandomSelector<T> = (list: T[]) => T

  const selectRandomTextFromList: RandomSelector<string> = (list) =>
    list.length > 0 ? list[Math.floor(Math.random() * list.length)] : list[0] || "hi"
  const greetings: string[] = ["hi", "hey", "hola", "hello", "heya", "yo", "sup", "howdy", "greetings"]

  const toSentenceCase = (str: string) => {
    if (!str) {
      return ""
    }
    return str.toLowerCase().charAt(0).toUpperCase() + str.slice(1)
  }

  const redirectToExplorePage = () => {
    router.push("/(tabs)/explore")
  }

  // Handle challenge card press
  const handleChallengePress = (challenge: Challenge) => {
    setSelectedChallenge(challenge)
    setShowDetailsDrawer(true)
  }

  // Pull to refresh
  const handleRefresh = () => {
    setRefreshing(true)
    fetchChallenges()
  }

  const redirectToMaxFit = () => {
    Alert.alert('MaxFit Coming Soon', 'MaxFit is currently unavailable now.\nIt would be made available in a future release.');
    // router.push("/subscreens/MaxFit")
  }

  // Fallback image for challenges with missing images
  const getDefaultImage = () => require("../../../assets/images/challenges/steps-challenge.png")

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#FFFFFF" />}
    >
      <View style={styles.header}>
        <View>
          {userProfile?.name ? (
            <Text style={styles.greeting}>
              {toSentenceCase(selectRandomTextFromList(greetings))}, {userProfile.name}!
            </Text>
          ) : (
            <Text style={styles.greeting}>Hello, Fitness Enthusiast!</Text>
          )}
          <Text style={styles.subGreeting}>Ready for today's challenge?</Text>
        </View>
        <TouchableOpacity style={styles.notificationButton} onPress={redirectToMaxFit}>
          <Ionicons name="sparkles-outline" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.balanceCard}>
        <View>
          <Text style={styles.balanceLabel}>Your AETH Balance</Text>
          <Text style={styles.balanceAmount}>0 AETH</Text>
        </View>
        <TouchableOpacity style={styles.stakeButton}>
          <Text style={styles.stakeButtonText}>Stake Now</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Challenges</Text>
          <TouchableOpacity onPress={redirectToExplorePage}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {loadingChallenges ? (
          <View style={styles.loadingContainer}>
            {/* <LoadingBar isLoading={true} width="90%" /> */}
            <TriangleLoader isLoading={true} size={80} />
          </View>
        ) : challenges.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No active challenges for now.</Text>
            <TouchableOpacity style={styles.createButton} onPress={() => router.push("/(tabs)/challenges")}>
              <Text style={styles.createButtonText}>Create a Challenge</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.challengesContainer}>
            {challenges.map((challenge) => (
              <HomeChallengeCard key={challenge.id} challenge={challenge} onPress={handleChallengePress} />
            ))}
          </ScrollView>
        )}
      </View>

      <FeaturedWorkouts />

      <ChallengeDetailsDrawer
        challenge={selectedChallenge}
        visible={showDetailsDrawer}
        onClose={() => setShowDetailsDrawer(false)}
      />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  greeting: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  subGreeting: {
    fontSize: 14,
    color: "#CCCCCC",
    marginTop: 4,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#222222",
    justifyContent: "center",
    alignItems: "center",
  },
  balanceCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#111111",
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginVertical: 20,
  },
  balanceLabel: {
    fontSize: 14,
    color: "#CCCCCC",
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginTop: 5,
  },
  stakeButton: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  stakeButtonText: {
    color: "#000000",
    fontWeight: "bold",
    fontSize: 14,
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  seeAllText: {
    fontSize: 14,
    color: "#CCCCCC",
  },
  errorContainer: {
    backgroundColor: "rgba(255, 107, 107, 0.2)",
    padding: 10,
    marginHorizontal: 20,
    marginBottom: 15,
    borderRadius: 8,
  },
  errorText: {
    color: "#FF6B6B",
    textAlign: "center",
  },
  loadingContainer: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  emptyContainer: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  emptyText: {
    color: "#CCCCCC",
    fontSize: 16,
    marginBottom: 15,
  },
  createButton: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  createButtonText: {
    color: "#000000",
    fontWeight: "bold",
    fontSize: 14,
  },
  challengesContainer: {
    paddingLeft: 20,
  },
})
