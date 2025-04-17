"use client"

import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, ScrollView, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useState, useCallback } from "react"
import Slider from "@react-native-community/slider"
import { Picker } from "@react-native-picker/picker"
import { useRouter } from "expo-router"
import ChallengeCard from "../../../components/challenge/ChallengeCard"
import ChallengeDetailsDrawer from "../../../components/challenge/ChallengeDetailsDrawer"
import type { Challenge, ChallengeFilters } from "../../../types/challenge"
import { ensureDefaultChallenges, getExploreChallenges  } from "../../../services/challenge-service"
import TriangleLoader from "../../../components/ui/TriangleLoader"
import { useFocusEffect } from "@react-navigation/native"
import { RefreshControl } from "react-native"

// Challenge types, intensity levels, and currencies
const CHALLENGE_TYPES = ["All", "Fitness", "Wellness", "Endurance"]
const INTENSITY_LEVELS = ["All", "Brook", "Ridge", "Peak", "Apex"]
const STAKE_CURRENCIES = ["All", "USDC", "SOL"]
const SPONSORSHIP_STATUS = ["All", "Sponsored", "Not Sponsored"]

// Default images
const defaultImage = require("../../../assets/images/challenges/steps-challenge.png")
const defaultIcon = require("../../../assets/images/challenges/steps-challenge.png")

export default function ExploreScreen() {
  const [searchQuery, setSearchQuery] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<ChallengeFilters>({
    type: "All",
    sponsored: "All",
    duration: [3, 90],
    stakeCurrency: "All",
    intensity: "All",
  })
  const [allChallenges, setAllChallenges] = useState<Challenge[]>([])
  const [filteredChallenges, setFilteredChallenges] = useState<Challenge[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null)
  const [showDetailsDrawer, setShowDetailsDrawer] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const router = useRouter()

  // Fetch all challenges using getHomeChallenges but without the limit of 3
  const fetchAllChallenges = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("Fetching challenges using getExploreChallenges...");
      const exploreChallenges = await getExploreChallenges();
      
      if (!exploreChallenges || exploreChallenges.length === 0) {
        console.log("No challenges found");
        setAllChallenges([]);
        setFilteredChallenges([]);
        return;
      }
      
      console.log(`Found ${exploreChallenges.length} challenges`);
      setAllChallenges(exploreChallenges);
      applyFilters(exploreChallenges);
    } catch (error) {
      console.error("Error fetching challenges:", error)
      setError("Failed to load challenges. Please try again.")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // Apply filters to the challenges
  const applyFilters = (challenges: Challenge[]) => {
    console.log("🛠 Applying filters:", filters)
    console.log("📦 Input challenges:", challenges.map(c => ({ id: c.id, duration: c.duration, name: c.name })))

    let filtered = [...challenges]

    if (!challenges || challenges.length === 0) {
      setFilteredChallenges([])
      return
    }
    
    // let filtered = [...challenges]
    
    // Search query filter
    if (searchQuery) {
      filtered = filtered.filter(challenge => 
        challenge.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    
    // Challenge type filter
    if (filters.type !== "All") {
       filtered = filtered.filter(challenge => challenge.type === filters.type)
       console.log(`➖ After type="${filters.type}":`, filtered.length)
    }
    
    // Sponsorship status filter
    if (filters.sponsored === "Sponsored") {
      filtered = filtered.filter(challenge => challenge.sponsored === true)
      console.log(`➖ After type="${filters.type}":`, filtered.length)

    } else if (filters.sponsored === "Not Sponsored") {
      filtered = filtered.filter(challenge => challenge.sponsored !== true)
      console.log(`➖ After type="${filters.type}":`, filtered.length)

    }
    
    // Duration filter
    if (filters.duration[0] !== 3 || filters.duration[1] !== 90) {
      filtered = filtered.filter(challenge => {
        const d = challenge.duration || 0
        return d >= filters.duration[0] && d <= filters.duration[1]
      })
      console.log(`➖ After duration [${filters.duration}]:`, filtered.length)
    }
    console.log(`➖ After type="${filters.type}":`, filtered.length)

    
    // Stake currency filter
    if (filters.stakeCurrency !== "All") {
      filtered = filtered.filter(challenge => challenge.stakeCurrency === filters.stakeCurrency)
      console.log(`➖ After type="${filters.type}":`, filtered.length)

    }
    
    // Intensity level filter
    if (filters.intensity !== "All") {
      filtered = filtered.filter(challenge => challenge.intensity === filters.intensity)
      console.log(`➖ After type="${filters.type}":`, filtered.length)

    }
    
    console.log(`Applied filters: ${filtered.length} challenges remain after filtering`)
    setFilteredChallenges(filtered)
  }

  // Fetch challenges when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchAllChallenges()
      return () => {} // Cleanup function
    }, []),
  )
  
  // Apply filters when search query or filters change
  useFocusEffect(
    useCallback(() => {
      if (allChallenges.length > 0) {
        applyFilters(allChallenges)
      }
    }, [searchQuery, filters]),
  )

  // Update filter values
  const updateFilter = (filterName: keyof ChallengeFilters, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [filterName]: value,
    }))
  }

  // Reset all filters
  const resetFilters = () => {
    setFilters({
      type: "All",
      sponsored: "All",
      duration: [3, 90],
      stakeCurrency: "All",
      intensity: "All",
    })
    setSearchQuery("")
  }

  // Handle challenge card press
  const handleChallengePress = (challenge: Challenge) => {
    setSelectedChallenge(challenge)
    setShowDetailsDrawer(true)
  }

  // Create default challenges if none exist
  const handleCreateDefaultChallenges = async () => {
    try {
      setLoading(true)
      const created = await ensureDefaultChallenges()

      if (created) {
        Alert.alert("Success", "Default challenges created successfully")
      } else {
        Alert.alert("Info", "Challenges already exist in the database")
      }

      // Refresh the challenges list
      await fetchAllChallenges()
    } catch (error) {
      console.error("Error creating default challenges:", error)
      Alert.alert("Error", "Failed to create default challenges")
    } finally {
      setLoading(false)
    }
  }

  // Pull to refresh
  const handleRefresh = () => {
    setRefreshing(true)
    fetchAllChallenges()
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#FFFFFF" />}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Explore Challenges</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#CCCCCC" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search challenges..."
            placeholderTextColor="#777777"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color="#CCCCCC" />
            </TouchableOpacity>
          ) : null}
        </View>

        <TouchableOpacity
          style={[styles.filterButton, showFilters && styles.filterButtonActive]}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Ionicons name="options-outline" size={20} color={showFilters ? "#000000" : "#FFFFFF"} />
        </TouchableOpacity>
      </View>

      {showFilters && (
        <View style={styles.filtersContainer}>
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Challenge Type</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={filters.type}
                onValueChange={(value) => updateFilter("type", value)}
                style={styles.picker}
                dropdownIconColor="#FFFFFF"
              >
                {CHALLENGE_TYPES.map((type) => (
                  <Picker.Item key={type} label={type} value={type} color="#FFFFFF" />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Sponsorship</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={filters.sponsored}
                onValueChange={(value) => updateFilter("sponsored", value)}
                style={styles.picker}
                dropdownIconColor="#FFFFFF"
              >
                {SPONSORSHIP_STATUS.map((status) => (
                  <Picker.Item key={status} label={status} value={status} color="#FFFFFF" />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>
              Duration: {filters.duration[0]} - {filters.duration[1]} days
            </Text>
            <Slider
              style={styles.slider}
              minimumValue={3}
              maximumValue={90}
              value={filters.duration[1]}
              onValueChange={(value) => updateFilter("duration", [filters.duration[0], Math.round(value)])}
              minimumTrackTintColor="#FFFFFF"
              maximumTrackTintColor="#444444"
              thumbTintColor="#FFFFFF"
            />
            <View style={styles.sliderLabels}>
              <Text style={styles.sliderLabel}>3 days</Text>
              <Text style={styles.sliderLabel}>90 days</Text>
            </View>
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Stake Currency</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={filters.stakeCurrency}
                onValueChange={(value) => updateFilter("stakeCurrency", value)}
                style={styles.picker}
                dropdownIconColor="#FFFFFF"
              >
                {STAKE_CURRENCIES.map((currency) => (
                  <Picker.Item key={currency} label={currency} value={currency} color="#FFFFFF" />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Intensity Level</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={filters.intensity}
                onValueChange={(value) => updateFilter("intensity", value)}
                style={styles.picker}
                dropdownIconColor="#FFFFFF"
              >
                {INTENSITY_LEVELS.map((level) => (
                  <Picker.Item key={level} label={level} value={level} color="#FFFFFF" />
                ))}
              </Picker>
            </View>
          </View>

          <TouchableOpacity style={styles.resetButton} onPress={resetFilters}>
            <Text style={styles.resetButtonText}>Reset Filters</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.resultsContainer}>
        <Text style={styles.resultsText}>{filteredChallenges.length} challenges found</Text>
        {filteredChallenges.length === 0 && !loading && (
          <TouchableOpacity style={styles.addChallengesButton} onPress={handleCreateDefaultChallenges}>
            <Text style={styles.addChallengesButtonText}>Create Default Challenges</Text>
          </TouchableOpacity>
        )}
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {loading ? (
        <View style={styles.loadingContainer}>
          <TriangleLoader isLoading={true} size={80} />
        </View>
      ) : (
        <FlatList
          data={filteredChallenges}
          renderItem={({ item }) => <ChallengeCard challenge={item} onPress={handleChallengePress} />}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          contentContainerStyle={styles.challengesGrid}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false} // Disable FlatList scrolling since we're using ScrollView
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={50} color="#444444" />
              <Text style={styles.emptyText}>No challenges found</Text>
              <Text style={styles.emptySubtext}>Try adjusting your filters or creating default challenges</Text>
            </View>
          }
        />
      )}

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
  contentContainer: {
    paddingBottom: 30,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  searchContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 15,
    alignItems: "center",
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111111",
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 45,
  },
  searchInput: {
    flex: 1,
    color: "#FFFFFF",
    marginLeft: 10,
    fontSize: 16,
  },
  filterButton: {
    width: 45,
    height: 45,
    borderRadius: 12,
    backgroundColor: "#111111",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
  filterButtonActive: {
    backgroundColor: "#FFFFFF",
  },
  filtersContainer: {
    backgroundColor: "#111111",
    borderRadius: 12,
    padding: 15,
    marginHorizontal: 20,
    marginBottom: 15,
  },
  filterSection: {
    marginBottom: 15,
  },
  filterLabel: {
    color: "#FFFFFF",
    fontSize: 14,
    marginBottom: 8,
    fontWeight: "500",
  },
  pickerContainer: {
    borderRadius: 8,
    backgroundColor: "#222222",
    overflow: "hidden",
  },
  picker: {
    color: "#FFFFFF",
    backgroundColor: "#222222",
  },
  slider: {
    height: 40,
  },
  sliderLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sliderLabel: {
    color: "#CCCCCC",
    fontSize: 12,
  },
  resetButton: {
    backgroundColor: "#222222",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    marginTop: 5,
  },
  resetButtonText: {
    color: "#FFFFFF",
    fontWeight: "500",
  },
  resultsContainer: {
    paddingHorizontal: 20,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  resultsText: {
    color: "#CCCCCC",
    fontSize: 14,
  },
  addChallengesButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  addChallengesButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "500",
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
    height: 300,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  challengesGrid: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 50,
  },
  emptyText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
  },
  emptySubtext: {
    color: "#CCCCCC",
    fontSize: 14,
    marginTop: 10,
  },
})