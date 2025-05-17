"use client"

import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"

export default function PrivacyPolicyScreen() {
  const router = useRouter()

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={{ width: 30 }} />
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.lastUpdated}>Last Updated: April 17, 2024</Text>

        <Text style={styles.sectionTitle}>1. Introduction</Text>
        <Text style={styles.paragraph}>
          Welcome to Aether Fit. We respect your privacy and are committed to protecting your personal data. This
          privacy policy will inform you about how we look after your personal data when you use our application and
          tell you about your privacy rights and how the law protects you.
        </Text>

        <Text style={styles.sectionTitle}>2. Data We Collect</Text>
        <Text style={styles.paragraph}>
          We collect several different types of information for various purposes to provide and improve our Service to
          you:
        </Text>
        <Text style={styles.bulletPoint}>• Personal Data: Email address, name, profile picture</Text>
        <Text style={styles.bulletPoint}>• Fitness Data: Steps, distance, calories, and other metrics</Text>
        <Text style={styles.bulletPoint}>• Usage Data: How you interact with our application</Text>
        <Text style={styles.bulletPoint}>• Device Data: IP address, browser type, device type</Text>

        <Text style={styles.sectionTitle}>3. How We Use Your Data</Text>
        <Text style={styles.paragraph}>We use the collected data for various purposes:</Text>
        <Text style={styles.bulletPoint}>• To provide and maintain our Service</Text>
        <Text style={styles.bulletPoint}>• To notify you about changes to our Service</Text>
        <Text style={styles.bulletPoint}>• To provide customer support</Text>
        <Text style={styles.bulletPoint}>• To gather analysis or valuable information to improve our Service</Text>
        <Text style={styles.bulletPoint}>• To monitor the usage of our Service</Text>
        <Text style={styles.bulletPoint}>• To detect, prevent and address technical issues</Text>

        <Text style={styles.sectionTitle}>4. Data Storage and Security</Text>
        <Text style={styles.paragraph}>
          Your data is stored securely on our servers and is protected by encryption. We implement appropriate technical
          and organizational measures to protect your personal data against unauthorized or unlawful processing,
          accidental loss, destruction, or damage.
        </Text>

        <Text style={styles.sectionTitle}>5. Blockchain Data</Text>
        <Text style={styles.paragraph}>
          As a blockchain-based application, certain data related to challenges and rewards may be stored on the Solana
          blockchain. Please note that data stored on a public blockchain is immutable and cannot be deleted.
        </Text>

        <Text style={styles.sectionTitle}>6. Your Rights</Text>
        <Text style={styles.paragraph}>You have the right to:</Text>
        <Text style={styles.bulletPoint}>• Access your personal data</Text>
        <Text style={styles.bulletPoint}>• Correct inaccurate personal data</Text>
        <Text style={styles.bulletPoint}>• Request deletion of your personal data</Text>
        <Text style={styles.bulletPoint}>• Object to processing of your personal data</Text>
        <Text style={styles.bulletPoint}>• Request restriction of processing your personal data</Text>
        <Text style={styles.bulletPoint}>• Request transfer of your personal data</Text>
        <Text style={styles.bulletPoint}>• Withdraw consent</Text>

        <Text style={styles.sectionTitle}>7. Third-Party Services</Text>
        <Text style={styles.paragraph}>
          Our Service may contain links to other sites that are not operated by us. If you click on a third-party link,
          you will be directed to that third party's site. We strongly advise you to review the Privacy Policy of every
          site you visit.
        </Text>

        <Text style={styles.sectionTitle}>8. Changes to This Privacy Policy</Text>
        <Text style={styles.paragraph}>
          We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new
          Privacy Policy on this page and updating the "last updated" date.
        </Text>

        <Text style={styles.sectionTitle}>9. Contact Us</Text>
        <Text style={styles.paragraph}>If you have any questions about this Privacy Policy, please contact us:</Text>
        <Text style={styles.bulletPoint}>• By email: privacy@aetherfit.com</Text>
        <Text style={styles.bulletPoint}>• By visiting the contact page on our website: www.aetherfit.com/contact</Text>
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
  lastUpdated: {
    color: "#AAAAAA",
    fontSize: 14,
    marginBottom: 20,
    fontStyle: "italic",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginTop: 20,
    marginBottom: 10,
  },
  paragraph: {
    color: "#CCCCCC",
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 15,
  },
  bulletPoint: {
    color: "#CCCCCC",
    fontSize: 14,
    lineHeight: 22,
    marginLeft: 15,
    marginBottom: 5,
  },
})
