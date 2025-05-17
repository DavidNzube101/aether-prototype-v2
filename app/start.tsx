"use client"

import { useState, useRef } from "react"
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  FlatList,
  SafeAreaView,
  StatusBar,
} from "react-native"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"

const { width, height } = Dimensions.get("window")

type OnboardingItem = {
  id: string
  title: string
  description: string
  image: any
}

const onboardingData: OnboardingItem[] = [
  {
    id: "1",
    title: "Meet Our Expert Instructors",
    description:
      "Improve your fitness by learning with the aid of fitness experts, at your own pace, and with updated material.",
    image: require("../assets/onboarding/instructors.png"),
  },
  {
    id: "2",
    title: "Earn While You Burn",
    description: "Complete fitness challenges and earn cryptocurrency rewards through our unique staking mechanism.",
    image: require("../assets/onboarding/rewards.png"),
  },
  {
    id: "3",
    title: "Track Your Progress",
    description: "Monitor your fitness journey with detailed analytics and see your improvements over time.",
    image: require("../assets/onboarding/progress.jpg"),
  },
  {
    id: "4",
    title: "Join the Community",
    description: "Connect with like-minded fitness enthusiasts and participate in group challenges.",
    image: require("../assets/onboarding/community.jpg"),
  },
]

export default function Onboarding() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const flatListRef = useRef<FlatList>(null)
  const router = useRouter()

  const handleNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      })
    } else {
      // Navigate to login screen when we reach the end
      router.push("/login")
    }
  }

  const handleSkip = () => {
    router.push("/login")
  }

  const renderItem = ({ item }: { item: OnboardingItem }) => {
    return (
      <View style={styles.slide}>
        <Image source={item.image} style={styles.image} />
        <View style={styles.textContainer}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.description}>{item.description}</Text>
        </View>
      </View>
    )
  }

  const renderDots = () => {
    return (
      <View style={styles.dotsContainer}>
        {onboardingData.map((_, index) => (
          <View key={index} style={[styles.dot, { backgroundColor: index === currentIndex ? "#000000" : "#CCCCCC" }]} />
        ))}
      </View>
    )
  }

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index)
    }
  }).current

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Skip button */}
      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      <FlatList
        ref={flatListRef}
        data={onboardingData}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
      />

      {renderDots()}

      <View style={styles.bottomContainer}>
        {currentIndex === onboardingData.length - 1 ? (
          <TouchableOpacity style={styles.getStartedButton} onPress={handleNext}>
            <Text style={styles.getStartedText}>Get Started</Text>
            <Ionicons name="arrow-forward" size={20} color="#000000" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Ionicons name="arrow-forward" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        )}

        {currentIndex === onboardingData.length - 1 && (
          <TouchableOpacity style={styles.loginLink} onPress={() => router.push("/login")}>
            <Text style={styles.loginText}>
              Already have an account? <Text style={styles.loginHighlight}>Log In</Text>
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  slide: {
    width,
    height,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: width,
    height: height,
    resizeMode: "cover",
  },
  textContainer: {
    position: "absolute",
    bottom: height * 0.25,
    left: 0,
    right: 0,
    paddingHorizontal: 40,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    color: "#CCCCCC",
    textAlign: "center",
    lineHeight: 24,
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    position: "absolute",
    bottom: height * 0.15,
    width: "100%",
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  bottomContainer: {
    position: "absolute",
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  nextButton: {
    width: 60,
    height: 60,
    display: "none",
    borderRadius: 30,
    backgroundColor: "#333333",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  getStartedButton: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  getStartedText: {
    color: "#000000",
    fontSize: 18,
    fontWeight: "bold",
    marginRight: 10,
  },
  skipButton: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
  },
  skipText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
  loginLink: {
    marginTop: 10,
  },
  loginText: {
    color: "#CCCCCC",
    fontSize: 14,
  },
  loginHighlight: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
})
