import { Tabs } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { useEffect } from "react"
import { useRouter } from "expo-router"
import { useAuth } from "../../context/auth-context"

export default function TabLayout() {
  const { user, loading, onboardingCompleted, checkOnboardingStatus } = useAuth()
  const router = useRouter()

  // Check onboarding status when tabs are loaded
  useEffect(() => {
    const checkStatus = async () => {
      if (!loading && user) {
        const isOnboardingCompleted = await checkOnboardingStatus()

        // Redirect to onboarding if not completed
        if (!isOnboardingCompleted) {
          router.replace("/KYU/onboarding")
        }
      } else if (!loading && !user) {
        // Redirect to login if not authenticated
        router.replace("/login")
      }
    }

    checkStatus()
  }, [user, loading])
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#FFFFFF",
        tabBarInactiveTintColor: "#666666",
        tabBarStyle: {
          backgroundColor: "#111111",
          borderTopColor: "#222222",
          height: 60,
          paddingBottom: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
        },
        headerStyle: {
          backgroundColor: "#000000",
        },
        headerTintColor: "#FFFFFF",
      }}
    >
      <Tabs.Screen
        name="home/index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />,
          headerTitle: "AETHER FIT",
        }}
      />
      <Tabs.Screen
        name="explore/index"
        options={{
          title: "Explore",
          tabBarIcon: ({ color, size }) => <Ionicons name="compass-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="metrics/index"
        options={{
          title: "Metrics",
          tabBarIcon: ({ color, size }) => <Ionicons name="speedometer-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="challenges/index"
        options={{
          title: "Challenges",
          tabBarIcon: ({ color, size }) => <Ionicons name="trophy-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile/index"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} />,
        }}
      />
    </Tabs>
  )
}
