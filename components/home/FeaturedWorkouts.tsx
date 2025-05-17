import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import TriangleLoader from '../ui/TriangleLoader'
import { fetchWorkouts, Workout } from '../../utils/fetchWorkouts'
import { shuffleArray } from '../../utils/shuffleArray'
import { Linking } from 'react-native'

export const FeaturedWorkouts = () => {
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [refreshing, setRefreshing] = useState(false)

  const loadWorkouts = async () => {
    setLoading(true)
    try {
      const data = await fetchWorkouts()
      setWorkouts(shuffleArray(data))
      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load workouts')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadWorkouts()
  }, [])

  const onRefresh = () => {
    setRefreshing(true)
    loadWorkouts()
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <TriangleLoader isLoading={true} size={60} />
      </View>
    )
  }

  if (error) {
    return <Text style={styles.errorText}>{error}</Text>
  }

  console.log(workouts)

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Featured Workouts</Text>
        <TouchableOpacity onPress={loadWorkouts}>
          <Text style={styles.seeAllText}>Refresh</Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#CCCCCC" />
        }
      >
        {workouts.map((w) => (
          <TouchableOpacity key={w.id} style={styles.workoutCard} onPress={()=> Linking.openURL("https://")}>
            <Image
              source={w.image ? { uri: w.image } : require('../../assets/images/challenges/steps-challenge.png')}
              style={styles.workoutImage}
              resizeMode="cover"
            />
            <View style={styles.workoutInfo}>
              <Text style={styles.workoutName}>{w.title}</Text>
              <Text style={styles.workoutInstructor}>With {w.instructor}</Text>
              <View style={styles.workoutStats}>
                <View style={styles.statItem}>
                  <Ionicons name="time-outline" size={14} color="#CCCCCC" />
                  <Text style={styles.statText}>{w.duration}</Text>
                </View>
                <View style={styles.statItem}>
                  <Ionicons name="speedometer-outline" size={14} color="#CCCCCC" />
                  <Text style={styles.statText}>{w.difficulty}/5 Difficulty</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  seeAllText: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  errorText: {
    color: '#FF6B6B',
    textAlign: 'center',
  },
  workoutCard: {
    flexDirection: 'row',
    backgroundColor: '#111111',
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 15,
    overflow: 'hidden',
    height: 100,
  },
  workoutImage: {
    width: 100,
    height: '100%',
    resizeMode: 'cover',
  },
  workoutInfo: {
    flex: 1,
    padding: 15,
    justifyContent: 'space-between',
  },
  workoutName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  workoutInstructor: {
    fontSize: 12,
    color: '#CCCCCC',
  },
  workoutStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  statText: {
    fontSize: 12,
    color: '#CCCCCC',
    marginLeft: 4,
  },
})
