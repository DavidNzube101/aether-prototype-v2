"use client"

import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"

export default function TermsConditionsScreen() {
  const router = useRouter()

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms & Conditions</Text>
        <View style={{ width: 30 }} />
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.lastUpdated}>Last Updated: April 17, 2024</Text>

        <Text style={styles.paragraph}>
          Please read these Terms and Conditions carefully before using the Aether Fit application.
        </Text>

        <Text style={styles.sectionTitle}>1. Agreement to Terms</Text>
        <Text style={styles.paragraph}>
          By accessing or using our application, you agree to be bound by these Terms. If you disagree with any part of
          the terms, you may not access the application.
        </Text>

        <Text style={styles.sectionTitle}>2. Use of the Application</Text>
        <Text style={styles.paragraph}>
          Aether Fit grants you a non-exclusive, non-transferable, revocable license to use the application for your
          personal, non-commercial purposes. You may not:
        </Text>
        <Text style={styles.bulletPoint}>• Use the application for any illegal purpose</Text>
        <Text style={styles.bulletPoint}>• Attempt to gain unauthorized access to any portion of the application</Text>
        <Text style={styles.bulletPoint}>• Modify, adapt, or hack the application</Text>
        <Text style={styles.bulletPoint}>• Use the application to generate spam or unsolicited messages</Text>

        <Text style={styles.sectionTitle}>3. Accounts and Registration</Text>
        <Text style={styles.paragraph}>
          When you create an account with us, you must provide accurate, complete, and current information. You are
          responsible for safeguarding the password and for all activities that occur under your account.
        </Text>

        <Text style={styles.sectionTitle}>4. Fitness Challenges and Rewards</Text>
        <Text style={styles.paragraph}>
          Aether Fit allows users to participate in fitness challenges and earn rewards. By participating in challenges:
        </Text>
        <Text style={styles.bulletPoint}>
          • You acknowledge that rewards are subject to the terms of each specific challenge
        </Text>
        <Text style={styles.bulletPoint}>• You agree to provide accurate fitness data</Text>
        <Text style={styles.bulletPoint}>
          • You understand that staked amounts may be lost if challenge requirements are not met
        </Text>
        <Text style={styles.bulletPoint}>• You acknowledge that blockchain transactions are irreversible</Text>

        <Text style={styles.sectionTitle}>5. Wallet and Cryptocurrency</Text>
        <Text style={styles.paragraph}>
          The application includes a cryptocurrency wallet feature. By using this feature:
        </Text>
        <Text style={styles.bulletPoint}>• You are responsible for maintaining the security of your wallet</Text>
        <Text style={styles.bulletPoint}>• You acknowledge that lost private keys cannot be recovered</Text>
        <Text style={styles.bulletPoint}>• You understand that cryptocurrency transactions are irreversible</Text>
        <Text style={styles.bulletPoint}>• You agree to comply with all applicable laws regarding cryptocurrency</Text>

        <Text style={styles.sectionTitle}>6. Intellectual Property</Text>
        <Text style={styles.paragraph}>
          The application and its original content, features, and functionality are owned by Aether Fit and are
          protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
        </Text>

        <Text style={styles.sectionTitle}>7. Disclaimer of Warranties</Text>
        <Text style={styles.paragraph}>
          The application is provided "as is" and "as available" without any warranties of any kind, either express or
          implied. We do not warrant that the application will be uninterrupted or error-free.
        </Text>

        <Text style={styles.sectionTitle}>8. Limitation of Liability</Text>
        <Text style={styles.paragraph}>
          In no event shall Aether Fit be liable for any indirect, incidental, special, consequential, or punitive
          damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
        </Text>

        <Text style={styles.sectionTitle}>9. Health Disclaimer</Text>
        <Text style={styles.paragraph}>
          Aether Fit is not a medical application and is not intended to diagnose, treat, cure, or prevent any disease.
          Consult with a healthcare professional before starting any fitness program.
        </Text>

        <Text style={styles.sectionTitle}>10. Changes to Terms</Text>
        <Text style={styles.paragraph}>
          We reserve the right to modify or replace these Terms at any time. If a revision is material, we will provide
          at least 30 days' notice prior to any new terms taking effect.
        </Text>

        <Text style={styles.sectionTitle}>11. Governing Law</Text>
        <Text style={styles.paragraph}>
          These Terms shall be governed by and construed in accordance with the laws of the United States, without
          regard to its conflict of law provisions.
        </Text>

        <Text style={styles.sectionTitle}>12. Contact Us</Text>
        <Text style={styles.paragraph}>
          If you have any questions about these Terms, please contact us at legal@aetherfit.com.
        </Text>
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
