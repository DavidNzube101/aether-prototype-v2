"use client"

import { useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from "react-native"
import { Ionicons } from "@expo/vector-icons"

interface StakePoolScreenProps {
  challengeData: any
  updateChallengeData: (data: any) => void
  onNext: () => void
}

export default function StakePoolScreen({ challengeData, updateChallengeData, onNext }: StakePoolScreenProps) {
  const [stakeCurrency, setStakeCurrency] = useState(challengeData.stakeCurrency || "USDC")
  const [stakeAmount, setStakeAmount] = useState(
    challengeData.stakeAmount ? challengeData.stakeAmount.toString() : "10",
  )
  const [error, setError] = useState("")

  // Handle next button press
  const handleNext = () => {
    // Validate stake amount
    const amount = Number.parseFloat(stakeAmount)
    if (isNaN(amount) || amount <= 0) {
      setError("Please enter a valid stake amount")
      return
    }

    updateChallengeData({
      stakeCurrency,
      stakeAmount: amount,
    })
    onNext()
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>Stake Pool Details</Text>
      <Text style={styles.subtitle}>Set up the stake currency and amount for your challenge</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Stake Currency</Text>
        <View style={styles.currencyOptions}>
          <TouchableOpacity
            style={[styles.currencyOption, stakeCurrency === "USDC" && styles.selectedCurrencyOption]}
            onPress={() => setStakeCurrency("USDC")}
          >
            <View style={styles.currencyIconContainer}>
              <Text style={styles.currencyIcon}>$</Text>
            </View>
            <Text style={styles.currencyName}>USDC</Text>
            {stakeCurrency === "USDC" && (
              <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" style={styles.checkmark} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.currencyOption, stakeCurrency === "SOL" && styles.selectedCurrencyOption]}
            onPress={() => setStakeCurrency("SOL")}
          >
            <View style={styles.currencyIconContainer}>
              <Text style={styles.currencyIcon}>◎</Text>
            </View>
            <Text style={styles.currencyName}>SOL</Text>
            {stakeCurrency === "SOL" && (
              <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" style={styles.checkmark} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Stake Amount</Text>
        <Text style={styles.sectionSubtitle}>Set the amount participants need to stake to join this challenge</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.currencySymbol}>{stakeCurrency === "USDC" ? "$" : "◎"}</Text>
          <TextInput
            style={styles.input}
            value={stakeAmount}
            onChangeText={(text) => {
              setStakeAmount(text)
              setError("")
            }}
            keyboardType="numeric"
            placeholder="10"
            placeholderTextColor="#666666"
          />
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={20} color="#CCCCCC" />
          <Text style={styles.infoText}>
            Recommended stake amounts: {"\n"}• Brook: 5-15 {stakeCurrency} {"\n"}• Ridge: 15-50 {stakeCurrency} {"\n"}•
            Peak: 50-100 {stakeCurrency} {"\n"}• Apex: 100+ {stakeCurrency}
          </Text>
        </View>
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
  currencyOptions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  currencyOption: {
    flex: 1,
    backgroundColor: "#111111",
    borderRadius: 12,
    padding: 15,
    marginHorizontal: 5,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#222222",
  },
  selectedCurrencyOption: {
    borderColor: "#FFFFFF",
  },
  currencyIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#222222",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  currencyIcon: {
    fontSize: 20,
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  currencyName: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  checkmark: {
    position: "absolute",
    top: 10,
    right: 10,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111111",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#222222",
    paddingHorizontal: 15,
    height: 50,
    marginBottom: 10,
  },
  currencySymbol: {
    fontSize: 18,
    color: "#FFFFFF",
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 18,
  },
  errorText: {
    color: "#FF6B6B",
    marginBottom: 10,
  },
  infoBox: {
    flexDirection: "row",
    backgroundColor: "#111111",
    borderRadius: 12,
    padding: 15,
    marginTop: 10,
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
})
