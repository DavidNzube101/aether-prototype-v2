"use client"

import { useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from "react-native"
import { Ionicons } from "@expo/vector-icons"

interface ChallengeInfoScreenProps {
  challengeData: any
  updateChallengeData: (data: any) => void
  onNext: () => void
}

// Predefined rules
const PREDEFINED_RULES = [
  "Complete daily requirements to earn rewards",
  "Progress must be tracked through the app",
  "Challenges can be completed at your own pace within the timeframe",
  "Stake amounts are locked until challenge completion or failure",
  "Partial completion will result in partial rewards",
  "Verification may be required for certain activities",
  "No cheating or manipulation of tracking data",
  "Respect other participants in challenge discussions",
]

export default function ChallengeInfoScreen({ challengeData, updateChallengeData, onNext }: ChallengeInfoScreenProps) {
  const [title, setTitle] = useState(challengeData.title || "")
  const [description, setDescription] = useState(challengeData.description || "")
  const [selectedRules, setSelectedRules] = useState<string[]>(challengeData.rules || [])
  const [customRule, setCustomRule] = useState(challengeData.customRule || "")
  const [errors, setErrors] = useState({
    title: "",
    description: "",
  })

  // Toggle rule selection
  const toggleRule = (rule: string) => {
    if (selectedRules.includes(rule)) {
      setSelectedRules(selectedRules.filter((r) => r !== rule))
    } else {
      setSelectedRules([...selectedRules, rule])
    }
  }

  // Add custom rule
  const addCustomRule = () => {
    if (customRule.trim() && !selectedRules.includes(customRule.trim())) {
      setSelectedRules([...selectedRules, customRule.trim()])
      setCustomRule("")
    }
  }

  // Handle next button press
  const handleNext = () => {
    const newErrors = {
      title: "",
      description: "",
    }

    // Validate title
    if (!title.trim()) {
      newErrors.title = "Title is required"
    } else if (title.length < 5) {
      newErrors.title = "Title must be at least 5 characters"
    }

    // Validate description
    if (!description.trim()) {
      newErrors.description = "Description is required"
    } else if (description.length < 20) {
      newErrors.description = "Description must be at least 20 characters"
    }

    setErrors(newErrors)

    // If no errors, proceed to next step
    if (!newErrors.title && !newErrors.description) {
      updateChallengeData({
        title,
        description,
        rules: selectedRules,
        customRule,
      })
      onNext()
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>Challenge Information</Text>
      <Text style={styles.subtitle}>Provide details about your challenge</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Challenge Title</Text>
        <TextInput
          style={[styles.input, errors.title ? styles.inputError : null]}
          value={title}
          onChangeText={(text) => {
            setTitle(text)
            if (errors.title) setErrors({ ...errors, title: "" })
          }}
          placeholder="e.g., 10K Steps Challenge"
          placeholderTextColor="#666666"
          maxLength={50}
        />
        {errors.title ? <Text style={styles.errorText}>{errors.title}</Text> : null}
        <Text style={styles.characterCount}>{title.length}/50</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Description</Text>
        <TextInput
          style={[styles.textArea, errors.description ? styles.inputError : null]}
          value={description}
          onChangeText={(text) => {
            setDescription(text)
            if (errors.description) setErrors({ ...errors, description: "" })
          }}
          placeholder="Describe your challenge, its goals, and what participants can expect..."
          placeholderTextColor="#666666"
          multiline
          numberOfLines={5}
          maxLength={500}
        />
        {errors.description ? <Text style={styles.errorText}>{errors.description}</Text> : null}
        <Text style={styles.characterCount}>{description.length}/500</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Challenge Rules</Text>
        <Text style={styles.sectionSubtitle}>Select predefined rules or add your own custom rules</Text>

        <View style={styles.rulesContainer}>
          {PREDEFINED_RULES.map((rule, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.ruleItem, selectedRules.includes(rule) && styles.selectedRuleItem]}
              onPress={() => toggleRule(rule)}
            >
              <Text style={styles.ruleText}>{rule}</Text>
              {selectedRules.includes(rule) && (
                <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" style={styles.checkmark} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.customRuleContainer}>
          <TextInput
            style={styles.customRuleInput}
            value={customRule}
            onChangeText={setCustomRule}
            placeholder="Add a custom rule..."
            placeholderTextColor="#666666"
          />
          <TouchableOpacity
            style={[styles.addRuleButton, !customRule.trim() && styles.disabledButton]}
            onPress={addCustomRule}
            disabled={!customRule.trim()}
          >
            <Ionicons name="add" size={24} color={customRule.trim() ? "#000000" : "#666666"} />
          </TouchableOpacity>
        </View>

        {selectedRules.length > 0 && (
          <View style={styles.selectedRulesContainer}>
            <Text style={styles.selectedRulesTitle}>Selected Rules ({selectedRules.length})</Text>
            {selectedRules.map((rule, index) => (
              <View key={index} style={styles.selectedRule}>
                <Text style={styles.selectedRuleText}>{rule}</Text>
                <TouchableOpacity onPress={() => toggleRule(rule)}>
                  <Ionicons name="close-circle" size={20} color="#CCCCCC" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
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
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 10,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#CCCCCC",
    marginBottom: 15,
  },
  input: {
    backgroundColor: "#111111",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#222222",
    padding: 15,
    color: "#FFFFFF",
    fontSize: 16,
  },
  inputError: {
    borderColor: "#FF6B6B",
  },
  errorText: {
    color: "#FF6B6B",
    marginTop: 5,
  },
  characterCount: {
    color: "#666666",
    fontSize: 12,
    textAlign: "right",
    marginTop: 5,
  },
  textArea: {
    backgroundColor: "#111111",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#222222",
    padding: 15,
    color: "#FFFFFF",
    fontSize: 16,
    textAlignVertical: "top",
    minHeight: 120,
  },
  rulesContainer: {
    marginBottom: 20,
  },
  ruleItem: {
    backgroundColor: "#111111",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#222222",
    padding: 15,
    marginBottom: 10,
  },
  selectedRuleItem: {
    borderColor: "#FFFFFF",
  },
  ruleText: {
    color: "#FFFFFF",
    fontSize: 14,
    paddingRight: 30, // Space for checkmark
  },
  checkmark: {
    position: "absolute",
    top: 15,
    right: 15,
  },
  customRuleContainer: {
    flexDirection: "row",
    marginBottom: 20,
  },
  customRuleInput: {
    flex: 1,
    backgroundColor: "#111111",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#222222",
    padding: 15,
    color: "#FFFFFF",
    fontSize: 16,
    marginRight: 10,
  },
  addRuleButton: {
    backgroundColor: "#FFFFFF",
    width: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#333333",
  },
  selectedRulesContainer: {
    backgroundColor: "#111111",
    borderRadius: 12,
    padding: 15,
  },
  selectedRulesTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  selectedRule: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#222222",
  },
  selectedRuleText: {
    color: "#CCCCCC",
    fontSize: 14,
    flex: 1,
    marginRight: 10,
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
