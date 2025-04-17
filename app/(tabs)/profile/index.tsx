"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, ScrollView } from "react-native"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { useAuth } from "../../../context/auth-context"
import { getUserProfile, type UserProfile } from "../../../utils/user-service"

export default function ProfileScreen() {
  const { user, logout } = useAuth()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

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

  const handleLogout = async () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Log Out",
          style: "destructive",
          onPress: async () => {
            await logout()
            router.replace("/login")
          },
        },
      ],
      { cancelable: true },
    )
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <View style={styles.profileSection}>
        <View style={styles.profileImageContainer}>
          {userProfile?.profileImage ? (
            <Image source={{ uri: userProfile.profileImage }} style={styles.profileImage} />
          ) : (
            <View style={styles.profileImagePlaceholder}>
              <Text style={styles.profileImagePlaceholderText}>
                {userProfile?.name
                  ? userProfile.name[0].toUpperCase()
                  : user?.email
                    ? user.email[0].toUpperCase()
                    : "A"}
              </Text>
            </View>
          )}
        </View>

        <Text style={styles.userName}>{userProfile?.name || user?.displayName || "Aether Fit User"}</Text>
        <Text style={styles.userEmail}>{user?.email || user?.phoneNumber || "No contact info"}</Text>

        {userProfile?.fitnessLevel && (
          <View style={styles.infoTag}>
            <Ionicons name="fitness-outline" size={16} color="#CCCCCC" />
            <Text style={styles.infoTagText}>{userProfile.fitnessLevel.title}</Text>
          </View>
        )}

        {userProfile?.currency && (
          <View style={styles.infoTag}>
            <Ionicons name="cash-outline" size={16} color="#CCCCCC" />
            <Text style={styles.infoTagText}>
              {userProfile.currency.name} ({userProfile.currency.symbol})
            </Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>

        <TouchableOpacity style={styles.menuItem} onPress={() => router.push("/subscreens/profile-screens/account/edit-profile")}>
          <Ionicons name="person-outline" size={22} color="#FFFFFF" style={styles.menuIcon} />
          <Text style={styles.menuText}>Edit Profile</Text>
          <Ionicons name="chevron-forward" size={22} color="#666666" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => router.push("/subscreens/profile-screens/account/wallet-payments")}>
          <Ionicons name="wallet-outline" size={22} color="#FFFFFF" style={styles.menuIcon} />
          <Text style={styles.menuText}>Wallet & Payments</Text>
          <Ionicons name="chevron-forward" size={22} color="#666666" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => router.push("/subscreens/profile-screens/account/notifications")}>
          <Ionicons name="notifications-outline" size={22} color="#FFFFFF" style={styles.menuIcon} />
          <Text style={styles.menuText}>Notifications</Text>
          <Ionicons name="chevron-forward" size={22} color="#666666" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => router.push("/subscreens/profile-screens/account/privacy-security")}>
          <Ionicons name="lock-closed-outline" size={22} color="#FFFFFF" style={styles.menuIcon} />
          <Text style={styles.menuText}>Privacy & Security</Text>
          <Ionicons name="chevron-forward" size={22} color="#666666" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>

        <TouchableOpacity style={styles.menuItem} onPress={() => router.push("/subscreens/profile-screens/support/help-center")}>
          <Ionicons name="help-circle-outline" size={22} color="#FFFFFF" style={styles.menuIcon} />
          <Text style={styles.menuText}>Help Center</Text>
          <Ionicons name="chevron-forward" size={22} color="#666666" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => router.push("/subscreens/profile-screens/support/terms-conditions")}>
          <Ionicons name="document-text-outline" size={22} color="#FFFFFF" style={styles.menuIcon} />
          <Text style={styles.menuText}>Terms of Service</Text>
          <Ionicons name="chevron-forward" size={22} color="#666666" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => router.push("/subscreens/profile-screens/support/privacy-policy")}>
          <Ionicons name="shield-outline" size={22} color="#FFFFFF" style={styles.menuIcon} />
          <Text style={styles.menuText}>Privacy Policy</Text>
          <Ionicons name="chevron-forward" size={22} color="#666666" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Log Out</Text>
      </TouchableOpacity>

      <View style={styles.versionContainer}>
        <Text style={styles.versionText}>Version 1.0.0</Text>
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
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#222222",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  profileSection: {
    alignItems: "center",
    paddingVertical: 30,
    borderBottomWidth: 1,
    borderBottomColor: "#222222",
  },
  profileImageContainer: {
    marginBottom: 15,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#333333",
    justifyContent: "center",
    alignItems: "center",
  },
  profileImagePlaceholderText: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  userName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    color: "#CCCCCC",
    marginBottom: 10,
  },
  infoTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#222222",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginTop: 8,
  },
  infoTagText: {
    fontSize: 12,
    color: "#CCCCCC",
    marginLeft: 5,
  },
  section: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#222222",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 15,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
  },
  menuIcon: {
    marginRight: 15,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: "#FFFFFF",
  },
  logoutButton: {
    marginTop: 30,
    marginHorizontal: 20,
    backgroundColor: "#333333",
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: "center",
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FF3B30",
  },
  versionContainer: {
    alignItems: "center",
    marginVertical: 30,
  },
  versionText: {
    fontSize: 12,
    color: "#666666",
  },
})
