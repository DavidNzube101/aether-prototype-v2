"use client"

import { useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, FlatList } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { Linking } from 'react-native';

// FAQ data
const faqs = [
  {
    id: "1",
    question: "How do I create a challenge?",
    answer:
      "To create a challenge, go to the Challenges tab and tap the 'Create' button in the top right corner. Follow the steps to set up your challenge details, including the metric to track, duration, and stake amount.",
    category: "challenges",
  },
  {
    id: "2",
    question: "How do I join a challenge?",
    answer:
      "You can join challenges from the Explore tab or directly from a challenge invitation. Tap on a challenge to view details, then tap the 'Join' button and follow the instructions to stake your tokens.",
    category: "challenges",
  },
  {
    id: "3",
    question: "How are metrics tracked?",
    answer:
      "Metrics are tracked using your device's sensors like accelerometer, gyroscope, and GPS. The app automatically records your activity based on the sensors available on your device. Some metrics may require specific sensors that might not be available on all devices.",
    category: "metrics",
  },
  {
    id: "4",
    question: "How do I withdraw funds from my wallet?",
    answer:
      "To withdraw funds, go to the Wallet screen and tap 'Send'. Enter the recipient's Solana wallet address and the amount you want to send. Confirm the transaction with your PIN if enabled.",
    category: "wallet",
  },
  {
    id: "5",
    question: "What happens if I don't complete a challenge?",
    answer:
      "If you don't meet the challenge requirements by the end date, your staked amount will be distributed among the participants who successfully completed the challenge.",
    category: "challenges",
  },
  {
    id: "6",
    question: "How do I reset my password?",
    answer:
      "On the login screen, tap 'Forgot Password' and follow the instructions to reset your password. You'll receive an email with a link to create a new password.",
    category: "account",
  },
  {
    id: "7",
    question: "How are rewards calculated?",
    answer:
      "Rewards are calculated based on the total stake pool and the number of successful participants. The stake amounts from users who didn't complete the challenge are distributed proportionally among those who did.",
    category: "rewards",
  },
  {
    id: "8",
    question: "Is my data secure?",
    answer:
      "Yes, we use industry-standard encryption to protect your data. Your personal information is never shared with third parties without your consent. Your wallet private keys are stored securely on your device and are never transmitted to our servers.",
    category: "privacy",
  },
]

// Categories
const categories = [
  { id: "all", name: "All" },
  { id: "challenges", name: "Challenges" },
  { id: "metrics", name: "Metrics" },
  { id: "wallet", name: "Wallet" },
  { id: "account", name: "Account" },
  { id: "rewards", name: "Rewards" },
  { id: "privacy", name: "Privacy" },
]

export default function HelpCenterScreen() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null)

  // Filter FAQs based on search query and selected category
  const filteredFaqs = faqs.filter((faq) => {
    const matchesSearch =
      searchQuery === "" ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory = selectedCategory === "all" || faq.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  const toggleFaq = (id: string) => {
    setExpandedFaq(expandedFaq === id ? null : id)
  }

  const renderFaqItem = ({ item }: { item: (typeof faqs)[0] }) => (
    <TouchableOpacity
      style={[styles.faqItem, expandedFaq === item.id && styles.faqItemExpanded]}
      onPress={() => toggleFaq(item.id)}
    >
      <View style={styles.faqHeader}>
        <Text style={styles.faqQuestion}>{item.question}</Text>
        <Ionicons name={expandedFaq === item.id ? "chevron-up" : "chevron-down"} size={20} color="#FFFFFF" />
      </View>
      {expandedFaq === item.id && <Text style={styles.faqAnswer}>{item.answer}</Text>}
    </TouchableOpacity>
  )

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help Center</Text>
        <View style={{ width: 30 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#AAAAAA" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for help..."
            placeholderTextColor="#666666"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery !== "" && (
            <TouchableOpacity onPress={() => setSearchQuery("")} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color="#AAAAAA" />
            </TouchableOpacity>
          )}
        </View>

        {/* Category ScrollView with fixed height */}
        <View style={styles.categoriesWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[styles.categoryButton, selectedCategory === category.id && styles.categoryButtonActive]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <Text
                  style={[
                    styles.categoryButtonText,
                    selectedCategory === category.id && styles.categoryButtonTextActive,
                  ]}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Main content area */}
        <View style={styles.faqContainer}>
          {filteredFaqs.length > 0 ? (
            <FlatList
              data={filteredFaqs}
              renderItem={renderFaqItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.faqList}
            />
          ) : (
            <View style={styles.noResultsContainer}>
              <Ionicons name="search" size={50} color="#444444" />
              <Text style={styles.noResultsText}>No results found</Text>
              <Text style={styles.noResultsSubtext}>Try different keywords or browse the categories</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.contactContainer}>
        <Text style={styles.contactText}>Still need help?</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
          
          <TouchableOpacity
            style={{...styles.contactButton, flexDirection: "row", flexWrap: "wrap", alignItems: "center"}}
            onPress={() => {
              const SUPPORT_mail = '+23491324725';
              const openMailApp = () => {
                const email_url = `mailto:${SUPPORT_mail}`;

                Linking.openURL(SUPPORT_mail)
                  .catch((error) => console.error('An error occurred while opening the phone app:', error));
              };
            }}
          >
            <Ionicons 
              name="phone-portrait-outline" 
              size={20}
              color="#000000" 
            />
            <Text style={styles.contactButtonText}>Phone</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{...styles.contactButton, flexDirection: "row", flexWrap: "wrap", alignItems: "center"}}
            onPress={() => {
              const SUPPORT_phoneNumber = '+23491324725';
              const openPhoneApp = () => {
                const phone_url = `tel:${SUPPORT_phoneNumber}`;

                Linking.openURL(phone_url)
                  .catch((error) => console.error('An error occurred while opening the phone app:', error));
              };
            }}
          >
            <Ionicons 
              name="mail-outline" 
              size={20}
              color="#000000" 
            />
            
            <Text style={styles.contactButtonText}>Mail</Text>
          </TouchableOpacity>
        </View>
      </View>
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
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#222222",
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 20,
    height: 50, // Fixed height for search container
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 16,
    paddingVertical: 12,
  },
  clearButton: {
    padding: 5,
  },
  // New wrapper to ensure proper height and spacing
  categoriesWrapper: {
    height: 50, // Fixed height for the category section
    marginBottom: 15,
  },
  categoriesContainer: {
    alignItems: "center", // Center items vertically
    height: 50, // Match parent height
  },
  categoryButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: "#222222",
    borderRadius: 20,
    marginRight: 10,
    height: 36, // Fixed height for buttons
    justifyContent: "center", // Center text vertically
  },
  categoryButtonActive: {
    backgroundColor: "#ffffff",
    color: "#000000",
  },
  categoryButtonText: {
    color: "#AAAAAA",
    fontSize: 14,
  },
  categoryButtonTextActive: {
    color: "#000000",
    fontWeight: "bold",
  },
  // Container for the FAQ list to ensure proper flex behavior
  faqContainer: {
    flex: 1,
  },
  faqList: {
    paddingBottom: 20,
  },
  faqItem: {
    backgroundColor: "#222222",
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  faqItemExpanded: {
    backgroundColor: "#333333",
  },
  faqHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  faqQuestion: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
    flex: 1,
    marginRight: 10,
  },
  faqAnswer: {
    color: "#CCCCCC",
    fontSize: 14,
    marginTop: 10,
    lineHeight: 20,
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  noResultsText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 15,
    marginBottom: 5,
  },
  noResultsSubtext: {
    color: "#AAAAAA",
    fontSize: 14,
    textAlign: "center",
  },
  contactContainer: {
    backgroundColor: "#222222",
    padding: 20,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#333333",
  },
  contactText: {
    color: "#FFFFFF",
    fontSize: 16,
    marginBottom: 10,
  },
  contactButton: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 20,
    margin: 10,
    color: "#000000",
    paddingVertical: 10,
    borderRadius: 20,
  },
  contactButtonText: {
    color: "#000000",
    fontWeight: "bold",
  },
})
