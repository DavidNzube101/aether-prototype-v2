"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { getAuth } from "firebase/auth"
import { getUserProfile, updateUserProfile } from "../../../../utils/user-service"

export default function NotificationsScreen() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [notificationSettings, setNotificationSettings] = useState({
    enableNotifications: true,
    challengeReminders: true,
    challengeInvites: true,
    challengeUpdates: true,
    achievementAlerts: true,
    systemAnnouncements: false,
    marketingMessages: false,
  })
  const auth = getAuth()

  useEffect(() => {
    loadNotificationSettings()
  }, [])

  const loadNotificationSettings = async () => {
    try {
      setLoading(true)
      const user = auth.currentUser
      if (!user) {
        return
      }

      const profile = await getUserProfile(user.uid)
      if (profile && profile.notificationSettings) {
        setNotificationSettings(profile.notificationSettings)
      }
    } catch (error) {
      console.error("Error loading notification settings:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleChange = async (setting: string, value: boolean) => {
    try {
      const updatedSettings = {
        ...notificationSettings,
        [setting]: value,
      }

      setNotificationSettings(updatedSettings)

      const user = auth.currentUser
      if (user) {
        await updateUserProfile(user.uid, {
          notificationSettings: updatedSettings,
        })
      }
    } catch (error) {
      console.error("Error updating notification settings:", error)
    }
  }

  const renderToggle = (key: string, label: string, description: string) => {
    return (
      <View style={styles.settingItem}>
        <View style={styles.settingInfo}>
          <Text style={styles.settingLabel}>{label}</Text>
          <Text style={styles.settingDescription}>{description}</Text>
        </View>
        <Switch
          value={notificationSettings[key as keyof typeof notificationSettings]}
          onValueChange={(value) => handleToggleChange(key, value)}
          trackColor={{ false: "#444444", true: "#ffffff" }}
          thumbColor="#000000"
        />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notificeations</Text>
        <View style={{ width: 30 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.mainToggleContainer}>
          {renderToggle("enableNotifications", "Enable Notifications", "Turn on/off all notifications from the app")}
        </View>

        <Text style={styles.sectionTitle}>Challenge Notifications</Text>
        <View style={styles.settingsSection}>
          {renderToggle("challengeReminders", "Challenge Reminders", "Receive reminders about your active challenges")}
          {renderToggle(
            "challengeInvites",
            "Challenge Invites",
            "Get notified when someone invites you to a challenge",
          )}
          {renderToggle("challengeUpdates", "Challenge Updates", "Receive updates about challenges you've joined")}
        </View>

        <Text style={styles.sectionTitle}>Other Notifications</Text>
        <View style={styles.settingsSection}>
          {renderToggle("achievementAlerts", "Achievement Alerts", "Get notified when you earn achievements")}
          {renderToggle("systemAnnouncements", "System Announcements", "Important updates about the app and service")}
          {renderToggle("marketingMessages", "Marketing Messages", "Promotions, offers, and marketing communications")}
        </View>
      </ScrollView>
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
    borderBottomWidth: 1,
    borderBottomColor: "#222222",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  backButton: {
    padding: 5,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  mainToggleContainer: {
    backgroundColor: "#222222",
    borderRadius: 12,
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 10,
  },
  settingsSection: {
    backgroundColor: "#222222",
    borderRadius: 12,
    marginBottom: 25,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#333333",
  },
  settingInfo: {
    flex: 1,
    marginRight: 10,
  },
  settingLabel: {
    fontSize: 16,
    color: "#FFFFFF",
    marginBottom: 5,
  },
  settingDescription: {
    fontSize: 12,
    color: "#AAAAAA",
  },
})
