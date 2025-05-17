"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { metrics, type FitnessMetric } from "../../../data/fitnessMetrics"

interface ChallengeTypeScreenProps {
  challengeData: any
  updateChallengeData: (data: any) => void
  onNext: () => void
}

export default function ChallengeTypeScreen({ challengeData, updateChallengeData, onNext }: ChallengeTypeScreenProps) {
  const [selectedIntensity, setSelectedIntensity] = useState(challengeData.intensity || "")
  const [selectedMetric, setSelectedMetric] = useState<FitnessMetric | null>(null)
  const [measurementValue, setMeasurementValue] = useState(challengeData.measurementValue || "")
  const [error, setError] = useState("")

  // Filter metrics based on selected intensity
  const filteredMetrics = selectedIntensity
    ? metrics.filter((metric) => metric.challengeLevel === selectedIntensity)
    : []

  // Initialize selected metric from challenge data if it exists
  useEffect(() => {
    if (challengeData.selectedMetric && selectedIntensity) {
      const metric = metrics.find(
        (m) => m.name === challengeData.selectedMetric.name && m.challengeLevel === selectedIntensity,
      )
      if (metric) {
        setSelectedMetric(metric)
      }
    }
  }, [challengeData.selectedMetric, selectedIntensity])

  // Select a metric
  const selectMetric = (metric: FitnessMetric) => {
    setSelectedMetric(metric)
    setError("")
  }

  // Handle next button press
  const handleNext = () => {
    // Validate inputs
    if (!selectedIntensity) {
      setError("Please select an intensity level")
      return
    }

    if (!selectedMetric) {
      setError("Please select a metric")
      return
    }

    if (!measurementValue.trim()) {
      setError(`Please enter a target value for ${selectedMetric.name}`)
      return
    }

    // Validate measurement value is a number for numeric metrics
    const numericMetrics = [
      "steps",
      "meters",
      "reps",
      "m/s",
      "steps per minute",
      "meters per step",
      "calories",
      "meters climbed",
      "km/h",
      "bpm",
      "ml/kg/min",
      "pool laps",
      "breaths per minute",
    ]

    if (numericMetrics.includes(selectedMetric.measurement) && isNaN(Number(measurementValue))) {
      setError(`Please enter a valid number for ${selectedMetric.name}`)
      return
    }

    // Update challenge data
    updateChallengeData({
      intensity: selectedIntensity,
      selectedMetric: selectedMetric,
      measurementValue: measurementValue,
      type: selectedMetric.name, // Set the challenge type to the metric name
    })

    onNext()
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>Select Challenge Type</Text>
      <Text style={styles.subtitle}>Choose the intensity level for your challenge</Text>

      <View style={styles.intensityContainer}>
        {["Brook", "Ridge", "Peak", "Apex"].map((intensity) => (
          <TouchableOpacity
            key={intensity}
            style={[styles.intensityCard, selectedIntensity === intensity && styles.selectedIntensityCard]}
            onPress={() => {
              setSelectedIntensity(intensity)
              setSelectedMetric(null) // Reset selected metric when intensity changes
              setError("")
            }}
          >
            <Text style={styles.intensityTitle}>{intensity}</Text>
            <Text style={styles.intensityDescription}>
              {intensity === "Brook" && "Beginner friendly"}
              {intensity === "Ridge" && "Moderate difficulty"}
              {intensity === "Peak" && "Advanced level"}
              {intensity === "Apex" && "Expert level"}
            </Text>
            {selectedIntensity === intensity && (
              <View style={styles.checkmark}>
                <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {selectedIntensity && (
        <>
          <Text style={styles.metricsTitle}>Available Metrics</Text>
          <Text style={styles.metricsSubtitle}>Select one metric to track for this challenge</Text>

          <View style={styles.metricsContainer}>
            {filteredMetrics.map((metric) => (
              <TouchableOpacity
                key={metric.name}
                style={[styles.metricCard, selectedMetric?.name === metric.name && styles.selectedMetricCard]}
                onPress={() => selectMetric(metric)}
              >
                <Text style={styles.metricName}>{metric.name}</Text>
                <Text style={styles.metricSensors}>Sensors: {metric.sensors.join(", ")}</Text>
                <Text style={styles.metricMeasurement}>Measurement: {metric.measurement}</Text>
                {selectedMetric?.name === metric.name && (
                  <View style={styles.metricCheckmark}>
                    <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      {selectedMetric && (
        <View style={styles.measurementContainer}>
          <Text style={styles.measurementTitle}>Target Measurement</Text>
          <Text style={styles.measurementSubtitle}>
            Enter the target value for {selectedMetric.name} ({selectedMetric.measurement})
          </Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={measurementValue}
              onChangeText={(text) => {
                setMeasurementValue(text)
                setError("")
              }}
              placeholder={`Enter target ${selectedMetric.measurement}`}
              placeholderTextColor="#666666"
              keyboardType={
                ["steps", "meters", "reps", "calories", "meters climbed", "bpm", "pool laps"].includes(
                  selectedMetric.measurement,
                )
                  ? "numeric"
                  : "default"
              }
            />
          </View>

          <View style={styles.exampleContainer}>
            <Text style={styles.exampleTitle}>Example targets:</Text>
            {selectedMetric.name === "Steps" && <Text style={styles.exampleText}>• 10,000 steps per day</Text>}
            {selectedMetric.name === "Distance Traveled" && (
              <Text style={styles.exampleText}>• 5,000 meters per day</Text>
            )}
            {selectedMetric.name === "Repetition Counting" && (
              <Text style={styles.exampleText}>• 50 reps per session</Text>
            )}
            {selectedMetric.name === "Calories Burned" && (
              <Text style={styles.exampleText}>• 500 calories per day</Text>
            )}
            {selectedMetric.name === "Heart Rate" && (
              <Text style={styles.exampleText}>• 140 bpm maximum during workout</Text>
            )}
          </View>
        </View>
      )}

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <TouchableOpacity
        style={[
          styles.nextButton,
          (!selectedIntensity || !selectedMetric || !measurementValue) && styles.disabledButton,
        ]}
        onPress={handleNext}
        disabled={!selectedIntensity || !selectedMetric || !measurementValue}
      >
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
  intensityContainer: {
    marginBottom: 30,
  },
  intensityCard: {
    backgroundColor: "#111111",
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#222222",
  },
  selectedIntensityCard: {
    borderColor: "#FFFFFF",
  },
  intensityTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 5,
  },
  intensityDescription: {
    fontSize: 14,
    color: "#CCCCCC",
  },
  checkmark: {
    position: "absolute",
    top: 15,
    right: 15,
  },
  metricsTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 10,
  },
  metricsSubtitle: {
    fontSize: 14,
    color: "#CCCCCC",
    marginBottom: 20,
  },
  metricsContainer: {
    marginBottom: 30,
  },
  metricCard: {
    backgroundColor: "#111111",
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#222222",
  },
  selectedMetricCard: {
    borderColor: "#FFFFFF",
  },
  metricName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 5,
  },
  metricSensors: {
    fontSize: 12,
    color: "#CCCCCC",
    marginBottom: 5,
  },
  metricMeasurement: {
    fontSize: 12,
    color: "#CCCCCC",
  },
  metricCheckmark: {
    position: "absolute",
    top: 15,
    right: 15,
  },
  measurementContainer: {
    backgroundColor: "#111111",
    borderRadius: 12,
    padding: 15,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: "#222222",
  },
  measurementTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 5,
  },
  measurementSubtitle: {
    fontSize: 14,
    color: "#CCCCCC",
    marginBottom: 15,
  },
  inputContainer: {
    backgroundColor: "#222222",
    borderRadius: 8,
    marginBottom: 15,
  },
  input: {
    padding: 12,
    color: "#FFFFFF",
    fontSize: 16,
  },
  exampleContainer: {
    backgroundColor: "#222222",
    borderRadius: 8,
    padding: 12,
  },
  exampleTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 5,
  },
  exampleText: {
    fontSize: 14,
    color: "#CCCCCC",
    marginBottom: 3,
  },
  errorText: {
    color: "#FF6B6B",
    marginBottom: 15,
    textAlign: "center",
  },
  nextButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 30,
    padding: 15,
    alignItems: "center",
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: "#333333",
  },
  nextButtonText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "bold",
  },
})
