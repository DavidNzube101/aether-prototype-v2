
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useEffect } from "react";


export default function HomeScreen() {
  
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, Fitness Enthusiast!</Text>
          <Text style={styles.subGreeting}>Ready for today's challenge?</Text>
        </View>
        <TouchableOpacity style={styles.notificationButton}>
          <Ionicons name="notifications-outline" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.balanceCard}>
        <View>
          <Text style={styles.balanceLabel}>Your Crypto Balance</Text>
          <Text style={styles.balanceAmount}>1,250 AET</Text>
        </View>
        <TouchableOpacity style={styles.stakeButton}>
          <Text style={styles.stakeButtonText}>Stake Now</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Challenges</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.challengesContainer}>
          {[1, 2, 3].map((item) => (
            <TouchableOpacity key={item} style={styles.challengeCard}>
              <View style={styles.challengeReward}>
                <Text style={styles.rewardText}>+50 AET</Text>
              </View>
              <Image source={require("../../assets/placeholder-challenge.jpg")} style={styles.challengeImage} />
              <View style={styles.challengeInfo}>
                <Text style={styles.challengeName}>10K Steps Challenge</Text>
                <View style={styles.challengeStats}>
                  <Ionicons name="time-outline" size={14} color="#CCCCCC" />
                  <Text style={styles.challengeTime}>Ends in 8h</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured Workouts</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        {[1, 2].map((item) => (
          <TouchableOpacity key={item} style={styles.workoutCard}>
            <Image source={require("../../assets/placeholder-challenge.jpg")} style={styles.workoutImage} />
            <View style={styles.workoutInfo}>
              <Text style={styles.workoutName}>Full Body HIIT</Text>
              <Text style={styles.workoutInstructor}>With Sarah Johnson</Text>
              <View style={styles.workoutStats}>
                <View style={styles.statItem}>
                  <Ionicons name="time-outline" size={14} color="#CCCCCC" />
                  <Text style={styles.statText}>30 min</Text>
                </View>
                <View style={styles.statItem}>
                  <Ionicons name="flame-outline" size={14} color="#CCCCCC" />
                  <Text style={styles.statText}>320 cal</Text>
                </View>
                <View style={styles.statItem}>
                  <Ionicons name="star-outline" size={14} color="#CCCCCC" />
                  <Text style={styles.statText}>4.8</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
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
  challengesContainer: {
    paddingLeft: 20,
  },
  challengeCard: {
    width: 200,
    backgroundColor: "#111111",
    borderRadius: 16,
    marginRight: 15,
    overflow: "hidden",
  },
  challengeReward: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    zIndex: 1,
  },
  rewardText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 12,
  },
  challengeImage: {
    width: "100%",
    height: 120,
    resizeMode: "cover",
  },
  challengeInfo: {
    padding: 15,
  },
  challengeName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  challengeStats: {
    flexDirection: "row",
    alignItems: "center",
  },
  challengeTime: {
    fontSize: 12,
    color: "#CCCCCC",
    marginLeft: 5,
  },
  workoutCard: {
    flexDirection: "row",
    backgroundColor: "#111111",
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 15,
    overflow: "hidden",
    height: 100,
  },
  workoutImage: {
    width: 100,
    height: "100%",
    resizeMode: "cover",
  },
  workoutInfo: {
    flex: 1,
    padding: 15,
    justifyContent: "space-between",
  },
  workoutName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  workoutInstructor: {
    fontSize: 12,
    color: "#CCCCCC",
  },
  workoutStats: {
    flexDirection: "row",
    alignItems: "center",
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
  },
  statText: {
    fontSize: 12,
    color: "#CCCCCC",
    marginLeft: 4,
  },
})
