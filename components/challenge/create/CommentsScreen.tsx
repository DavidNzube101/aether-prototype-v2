"use client"

import { useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native"
import { Ionicons } from "@expo/vector-icons"

interface CommentsScreenProps {
  challengeData: any
  updateChallengeData: (data: any) => void
  onNext: () => void
}

export default function CommentsScreen({ challengeData, updateChallengeData, onNext }: CommentsScreenProps) {
  const [allowComments, setAllowComments] = useState(
    challengeData.allowComments !== undefined ? challengeData.allowComments : true,
  )

  // Handle next button press
  const handleNext = () => {
    updateChallengeData({
      allowComments,
    })
    onNext()
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>Challenge Comments</Text>
      <Text style={styles.subtitle}>Choose whether to enable comments for your challenge</Text>

      <View style={styles.optionsContainer}>
        <TouchableOpacity
          style={[styles.optionCard, allowComments && styles.selectedOptionCard]}
          onPress={() => setAllowComments(true)}
        >
          <View style={styles.optionHeader}>
            <Ionicons name="chatbubble-outline" size={30} color="#FFFFFF" />
            <Text style={styles.optionTitle}>Enable Comments</Text>
            {allowComments && (
              <View style={styles.checkmark}>
                <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
              </View>
            )}
          </View>

          <Text style={styles.optionDescription}>
            Allow participants to comment and interact with each other during the challenge.
          </Text>

          <View style={styles.benefitsContainer}>
            <Text style={styles.benefitsTitle}>Benefits:</Text>
            <View style={styles.benefitItem}>
              <Ionicons name="checkmark" size={16} color="#4CAF50" />
              <Text style={styles.benefitText}>Increased community engagement</Text>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="checkmark" size={16} color="#4CAF50" />
              <Text style={styles.benefitText}>Participants can share tips and motivation</Text>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="checkmark" size={16} color="#4CAF50" />
              <Text style={styles.benefitText}>Higher completion rates through accountability</Text>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.optionCard, !allowComments && styles.selectedOptionCard]}
          onPress={() => setAllowComments(false)}
        >
          <View style={styles.optionHeader}>
            <Ionicons name="chatbubble-slash-outline" size={30} color="#FFFFFF" />
            <Text style={styles.optionTitle}>Disable Comments</Text>
            {!allowComments && (
              <View style={styles.checkmark}>
                <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
              </View>
            )}
          </View>

          <Text style={styles.optionDescription}>
            Create a focused challenge experience without participant comments.
          </Text>

          <View style={styles.benefitsContainer}>
            <Text style={styles.benefitsTitle}>Benefits:</Text>
            <View style={styles.benefitItem}>
              <Ionicons name="checkmark" size={16} color="#4CAF50" />
              <Text style={styles.benefitText}>Minimizes distractions</Text>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="checkmark" size={16} color="#4CAF50" />
              <Text style={styles.benefitText}>Reduces moderation requirements</Text>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="checkmark" size={16} color="#4CAF50" />
              <Text style={styles.benefitText}>Better for competitive challenges</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
        <Text style={styles.nextButtonText}>Next</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#CCCCCC",
    marginBottom: 30,
  },
  optionsContainer: {
    marginBottom: 30,
  },
  optionCard: {
    backgroundColor: "#111111",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#222222",
  },
  selectedOptionCard: {
    borderColor: "#FFFFFF",
  },
  optionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginLeft: 10,
  },
  checkmark: {
    marginLeft: "auto",
  },
  optionDescription: {
    fontSize: 14,
    color: "#CCCCCC",
    marginBottom: 15,
    lineHeight: 22,
  },
  benefitsContainer: {
    backgroundColor: "#222222",
    borderRadius: 8,
    padding: 15,
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 10,
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  benefitText: {
    fontSize: 14,
    color: "#CCCCCC",
    marginLeft: 10,
  },
  nextButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 30,
    padding: 15,
    alignItems: "center",
    marginTop: 20,
  },
  nextButtonText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "bold",
  },
})
