"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, ActivityIndicator, FlatList } from "react-native"
import { useAuth } from "../../../context/auth-context"
import { getUserBadges } from "../../../utils/user-service"
import { fitnessBadges, type Badge } from "../../../types/badges"
import BadgeItem from "./badge-item"
import BadgeDetailModal from "./badge-detail-modal"

export default function BadgesSection() {
    const { user } = useAuth()
    const [badges, setBadges] = useState<Badge[]>([])
    const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null)
    const [showDetailModal, setShowDetailModal] = useState(false)
    const [loading, setLoading] = useState(true)
  
    useEffect(() => {
      const loadBadges = async () => {
        if (!user?.uid) return
  
        try {
          setLoading(true)
          // Get user's earned badges from Firestore
          const userBadgeIds = await getUserBadges(user.uid)
  
          // Mark earned badges as unlocked
          const badgesWithUnlockStatus = fitnessBadges.map((badge) => ({
            ...badge,
            unlocked: userBadgeIds.includes(badge.id),
          }))
  
          setBadges(badgesWithUnlockStatus)
        } catch (error) {
          console.error("Error loading badges:", error)
        } finally {
          setLoading(false)
        }
      }
  
      loadBadges()
    }, [user])
  
    const handleBadgePress = (badge: Badge) => {
      setSelectedBadge(badge)
      setShowDetailModal(true)
    }
  
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#FFFFFF" />
          <Text style={styles.loadingText}>Loading badges...</Text>
        </View>
      )
    }
  
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Badges</Text>
          <View style={styles.stats}>
            <Text style={styles.statsText}>
              {badges.filter((b) => b.unlocked).length}/{badges.length} Unlocked
            </Text>
          </View>
        </View>
  
        {badges.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No badges available</Text>
          </View>
        ) : (
          <FlatList
            data={badges}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <BadgeItem badge={item} onPress={handleBadgePress} />}
            horizontal
            showsHorizontalScrollIndicator={false}
            scrollEnabled={true}
          />
        )}
  
        <BadgeDetailModal visible={showDetailModal} onClose={() => setShowDetailModal(false)} badge={selectedBadge} />
      </View>
    )
  }
  
  const styles = StyleSheet.create({
    container: {
      marginBottom: 20,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },
    title: {
      fontSize: 18,
      fontWeight: "bold",
      color: "#FFFFFF",
    },
    stats: {
      backgroundColor: "#333333",
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
    },
    statsText: {
      fontSize: 12,
      color: "#CCCCCC",
    },
    loadingContainer: {
      padding: 20,
      alignItems: "center",
    },
    loadingText: {
      color: "#CCCCCC",
      marginTop: 8,
    },
    emptyContainer: {
      padding: 30,
      alignItems: "center",
      backgroundColor: "#222222",
      borderRadius: 12,
    },
    emptyText: {
      color: "#AAAAAA",
    },
  })
  