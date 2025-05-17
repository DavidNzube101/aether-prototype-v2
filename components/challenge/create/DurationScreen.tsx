"use client"

import { useState, useEffect } from "react"
import { Platform } from "react-native"
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import DateTimePicker from "@react-native-community/datetimepicker"

interface DurationScreenProps {
  challengeData: any
  updateChallengeData: (data: any) => void
  onNext: () => void
}

export default function DurationScreen({ challengeData, updateChallengeData, onNext }: DurationScreenProps) {
  const [startDate, setStartDate] = useState(challengeData.startDate || new Date())
  const [endDate, setEndDate] = useState(challengeData.endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))
  const [showStartPicker, setShowStartPicker] = useState(false)
  const [showEndPicker, setShowEndPicker] = useState(false)
  const [error, setError] = useState("")
  const [isAndroid, setIsAndroid] = useState(false)

  // Detect platform on component mount
  useEffect(() => {
    setIsAndroid(Platform.OS === "android")

    // Log initial dates for debugging
    console.log("Initial startDate:", startDate)
    console.log("Initial endDate:", endDate)
  }, [])

  // Calculate duration in days
  const durationInDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))

  // Handle start date change
  const onStartDateChange = (event, selectedDate) => {
    // On Android, the picker is dismissed automatically
    if (isAndroid) {
      setShowStartPicker(false)
    }

    // Only update if a date was actually selected (not cancelled)
    if (selectedDate) {
      console.log("New start date selected:", selectedDate)
      setStartDate(selectedDate)

      // If end date is before new start date, adjust end date
      if (endDate < selectedDate) {
        const newEndDate = new Date(selectedDate)
        newEndDate.setDate(newEndDate.getDate() + 7) // Default to 7 days later
        setEndDate(newEndDate)
        console.log("End date adjusted to:", newEndDate)
      }

      setError("")
    }
  }

  // Handle end date change
  const onEndDateChange = (event, selectedDate) => {
    // On Android, the picker is dismissed automatically
    if (isAndroid) {
      setShowEndPicker(false)
    }

    // Only update if a date was actually selected (not cancelled)
    if (selectedDate) {
      console.log("New end date selected:", selectedDate)
      setEndDate(selectedDate)
      setError("")
    }
  }

  // Format date for display
  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // Handle next button press
  const handleNext = () => {
    // Validate duration
    if (durationInDays < 3) {
      setError("Challenge duration must be at least 3 days")
      return
    }

    if (durationInDays > 90) {
      setError("Challenge duration cannot exceed 90 days")
      return
    }

    updateChallengeData({
      startDate,
      endDate,
    })
    onNext()
  }

  // Close date picker on iOS
  const handleClosePicker = () => {
    setShowStartPicker(false)
    setShowEndPicker(false)
  }

  // Render date picker based on platform
  const renderDatePicker = (isStartDate) => {
    const currentDate = isStartDate ? startDate : endDate
    const onChange = isStartDate ? onStartDateChange : onEndDateChange
    const minDate = isStartDate
      ? new Date() // Start date minimum is today
      : new Date(startDate.getTime() + 24 * 60 * 60 * 1000) // End date minimum is start date + 1 day
    const maxDate = isStartDate
      ? new Date(Date.now() + 89 * 24 * 60 * 60 * 1000) // Start date maximum is today + 89 days
      : new Date(startDate.getTime() + 90 * 24 * 60 * 60 * 1000) // End date maximum is start date + 90 days

    // For Android, render directly
    if (isAndroid) {
      return (
        (isStartDate ? showStartPicker : showEndPicker) && (
          <DateTimePicker
            testID={isStartDate ? "startDatePicker" : "endDatePicker"}
            value={currentDate}
            mode="date"
            display="default"
            onChange={onChange}
            minimumDate={minDate}
            maximumDate={maxDate}
          />
        )
      )
    }

    // For iOS, render in a modal
    return (
      (isStartDate ? showStartPicker : showEndPicker) && (
        <Modal
          transparent={true}
          animationType="slide"
          visible={isStartDate ? showStartPicker : showEndPicker}
          onRequestClose={handleClosePicker}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.pickerHeader}>
                <Text style={styles.pickerTitle}>{isStartDate ? "Select Start Date" : "Select End Date"}</Text>
                <TouchableOpacity onPress={handleClosePicker} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              <DateTimePicker
                testID={isStartDate ? "startDatePicker" : "endDatePicker"}
                value={currentDate}
                mode="date"
                display="spinner"
                onChange={onChange}
                minimumDate={minDate}
                maximumDate={maxDate}
                style={styles.datePicker}
                textColor="#FFFFFF"
              />

              <TouchableOpacity style={styles.confirmButton} onPress={handleClosePicker}>
                <Text style={styles.confirmButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )
    )
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>Challenge Duration</Text>
      <Text style={styles.subtitle}>Set the start and end dates for your challenge</Text>

      <View style={styles.durationSummary}>
        <Text style={styles.durationText}>
          Duration: <Text style={styles.durationValue}>{durationInDays} days</Text>
        </Text>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Start Date</Text>
        <TouchableOpacity
          style={[styles.datePickerButton, showStartPicker && styles.datePickerButtonActive]}
          onPress={() => {
            setShowStartPicker(true)
            setShowEndPicker(false)
            console.log("Opening start date picker")
          }}
        >
          <Text style={styles.dateText}>{formatDate(startDate)}</Text>
          <Ionicons name="calendar-outline" size={24} color="#CCCCCC" />
        </TouchableOpacity>

        {renderDatePicker(true)}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>End Date</Text>
        <TouchableOpacity
          style={[styles.datePickerButton, showEndPicker && styles.datePickerButtonActive]}
          onPress={() => {
            setShowEndPicker(true)
            setShowStartPicker(false)
            console.log("Opening end date picker")
          }}
        >
          <Text style={styles.dateText}>{formatDate(endDate)}</Text>
          <Ionicons name="calendar-outline" size={24} color="#CCCCCC" />
        </TouchableOpacity>

        {renderDatePicker(false)}
      </View>

      <View style={styles.infoBox}>
        <Ionicons name="information-circle-outline" size={20} color="#CCCCCC" />
        <Text style={styles.infoText}>
          Challenge duration must be between 3 and 90 days. Longer challenges tend to have higher dropout rates, while
          shorter challenges may not provide enough time for meaningful progress.
        </Text>
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
  durationSummary: {
    backgroundColor: "#111111",
    borderRadius: 12,
    padding: 15,
    marginBottom: 30,
    alignItems: "center",
  },
  durationText: {
    fontSize: 18,
    color: "#FFFFFF",
  },
  durationValue: {
    fontWeight: "bold",
  },
  errorText: {
    color: "#FF6B6B",
    marginTop: 10,
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
  datePickerButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#111111",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#222222",
    padding: 15,
  },
  datePickerButtonActive: {
    borderColor: "#FFFFFF",
  },
  dateText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
  infoBox: {
    flexDirection: "row",
    backgroundColor: "#111111",
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  infoText: {
    color: "#CCCCCC",
    fontSize: 14,
    marginLeft: 10,
    flex: 1,
    lineHeight: 22,
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
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#111111",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  pickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  closeButton: {
    padding: 5,
  },
  datePicker: {
    backgroundColor: "#222222",
    height: 200,
    marginBottom: 20,
  },
  confirmButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 15,
    alignItems: "center",
  },
  confirmButtonText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "bold",
  },
})
