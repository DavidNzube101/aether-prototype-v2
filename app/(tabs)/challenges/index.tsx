"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ScrollView, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import ChallengeCard from "../../../components/challenge/ChallengeCard"
import ChallengeDetailsDrawer from "../../../components/challenge/ChallengeDetailsDrawer"
import TriangleLoader from "../../../components/ui/TriangleLoader"
import ActivationModal from "../../../components/challenge/ActivationModal"
import { getUserChallenges, getJoinedChallenges, determineChallengeStatus } from "../../../services/challenge-service"
import type { Challenge } from "../../../types/challenge"
import { getAuth } from "firebase/auth"

export default function ChallengesScreen() {
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"active" | "inactive" | "expired" | "joined">("active")
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null)
  const [showDetailsDrawer, setShowDetailsDrawer] = useState(false)
  const [showActivationModal, setShowActivationModal] = useState(false)
  const [challengeToActivate, setChallengeToActivate] = useState<Challenge | null>(null)
  const router = useRouter()
  const auth = getAuth()

  useEffect(() => {
    // Check if user is authenticated
    const user = auth.currentUser
    if (!user) {
      Alert.alert("Authentication Required", "Please log in to view your challenges", [
        { text: "OK", onPress: () => router.replace("/login") },
      ])
      return
    }

    fetchChallenges()
  }, [activeTab])

  const fetchChallenges = async () => {
    try {
      setLoading(true)

      if (activeTab === "joined") {
        // Fetch joined challenges
        const joinedChallenges = await getJoinedChallenges()
        setChallenges(joinedChallenges)
      } else {
        // Fetch user's created challenges and filter by status
        const userChallenges = await getUserChallenges()

        // Filter challenges based on active tab and determine status
        const filteredChallenges = userChallenges.filter((challenge) => {
          const status = determineChallengeStatus(challenge)
          return status === activeTab
        })

        setChallenges(filteredChallenges)
      }
    } catch (error) {
      console.error("Error fetching challenges:", error)
      Alert.alert("Error", "Failed to load challenges. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleChallengePress = (challenge: Challenge) => {
    setSelectedChallenge(challenge)
    setShowDetailsDrawer(true)
  }

  const handleActivatePress = (challenge: Challenge) => {
    setChallengeToActivate(challenge)
    setShowActivationModal(true)
  }

  const handleChallengeActivated = () => {
    // Refresh challenges after activation
    fetchChallenges()
    Alert.alert("Success", "Challenge activated successfully!")
  }

  const navigateToCreateChallenge = () => {
    router.push("/subscreens/challenge-screens/create")
  }

  const renderChallengeItem = ({ item }: { item: Challenge }) => (
    <View style={styles.challengeCardContainer}>
      <ChallengeCard challenge={item} onPress={handleChallengePress} />

      {activeTab === "inactive" && (
        <TouchableOpacity style={styles.activateButton} onPress={() => handleActivatePress(item)}>
          <Ionicons name="play-circle-outline" size={20} color="#FFFFFF" />
          <Text style={styles.activateButtonText}>Activate</Text>
        </TouchableOpacity>
      )}
    </View>
  )

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Challenges</Text>
        <TouchableOpacity style={styles.createButton} onPress={navigateToCreateChallenge}>
          <Ionicons name="add" size={24} color="#FFFFFF" />
          <Text style={styles.createButtonText}>Create</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "active" && styles.activeTab]}
          onPress={() => setActiveTab("active")}
        >
          <Text style={[styles.tabText, activeTab === "active" && styles.activeTabText]}>Active</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "inactive" && styles.activeTab]}
          onPress={() => setActiveTab("inactive")}
        >
          <Text style={[styles.tabText, activeTab === "inactive" && styles.activeTabText]}>Inactive</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "expired" && styles.activeTab]}
          onPress={() => setActiveTab("expired")}
        >
          <Text style={[styles.tabText, activeTab === "expired" && styles.activeTabText]}>Expired</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "joined" && styles.activeTab]}
          onPress={() => setActiveTab("joined")}
        >
          <Text style={[styles.tabText, activeTab === "joined" && styles.activeTabText]}>Joined</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <TriangleLoader isLoading={true} size={80} />
          <Text style={styles.loadingText}>Loading challenges...</Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollContainer}>
          {challenges.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="fitness-outline" size={60} color="#444444" />
              <Text style={styles.emptyText}>No {activeTab} challenges found</Text>
              {activeTab === "inactive" && (
                <TouchableOpacity style={styles.createChallengeButton} onPress={navigateToCreateChallenge}>
                  <Text style={styles.createChallengeButtonText}>Create a Challenge</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <FlatList
              data={challenges}
              renderItem={renderChallengeItem}
              keyExtractor={(item) => item.id.toString()}
              numColumns={2}
              contentContainerStyle={styles.challengesGrid}
              scrollEnabled={false} // Disable FlatList scrolling since we're using ScrollView
            />
          )}
        </ScrollView>
      )}

      <ChallengeDetailsDrawer
        challenge={selectedChallenge}
        visible={showDetailsDrawer}
        onClose={() => setShowDetailsDrawer(false)}
      />

      <ActivationModal
        challenge={challengeToActivate}
        visible={showActivationModal}
        onClose={() => setShowActivationModal(false)}
        onActivated={handleChallengeActivated}
      />
    </View>
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
    paddingTop: 50,
    paddingBottom: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#222222",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  createButtonText: {
    color: "#FFFFFF",
    marginLeft: 5,
    fontWeight: "500",
  },
  tabsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#222222",
  },
  tab: {
    paddingVertical: 12,
    marginRight: 20,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTab: {
    borderBottomColor: "#FFFFFF",
  },
  tabText: {
    color: "#999999",
    fontSize: 16,
    fontWeight: "500",
  },
  activeTabText: {
    color: "#FFFFFF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#CCCCCC",
    marginTop: 20,
    fontSize: 16,
  },
  scrollContainer: {
    flex: 1,
  },
  challengesGrid: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  challengeCardContainer: {
    flex: 1,
    margin: 10,
    maxWidth: "46%",
  },
  activateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4CAF50",
    borderRadius: 12,
    padding: 8,
    marginTop: 8,
  },
  activateButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 14,
    marginLeft: 5,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 50,
    marginTop: 50,
  },
  emptyText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 20,
  },
  createChallengeButton: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 20,
  },
  createChallengeButtonText: {
    color: "#000000",
    fontWeight: "bold",
    fontSize: 16,
  },
})
