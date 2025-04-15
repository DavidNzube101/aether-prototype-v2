"use client"

import { useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
} from "react-native"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { Connection, clusterApiUrl, PublicKey } from '@solana/web3.js';



export default function Login() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const router = useRouter()

    const handleLogin = () => {
    // Implement login logic here
    console.log("Login with:", email, password)
    // Navigate to main app
    router.push("/(tabs)")
    }

    const handleSignUp = () => {
    router.push("/signup")
    }

    const SOLFLARE_AUTH_URL = "https://solflare.com/auth?redirect_uri=myapp://auth";
    const SOLFLARE_CONNECT_URL = "https://solflare.com/ul/v1/connect?redirect_link=myapp://onConnect"

    const initiateSolflareLogin = async () => {
        // Open authentication URL in the browser
        const result = await WebBrowser.openAuthSessionAsync(SOLFLARE_AUTH_URL);
        if (result.type === 'success' && result.url) {
            // Extract query parameters from the URL (e.g., publicKey)
            const { queryParams } = Linking.parse(result.url);
            if (queryParams && queryParams.publicKey) {
            const userPubkey = new PublicKey(queryParams.publicKey);
            console.log("User connected with public key:", userPubkey.toString());
            
            // Create a connection to the Solana network
            const connection = new Connection(clusterApiUrl('devnet'));
            // Continue with your logic to interact with the network...
            }
        }
    }


  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardAvoidingView}>
        <ScrollView contentContainerStyle={styles.scrollView}>
          <View style={styles.logoContainer}>
            <Image source={require("../assets/logo.jpg")} style={styles.logo} />
            <Text style={styles.appName}>Aether Fit</Text>
          </View>

          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>
            Gamifying the Fitness market — Leveraging cryptocurrency staking to incentivize users to complete fitness
            challenges.
          </Text>

          <View style={styles.formContainer}>
            {/* <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color="#CCCCCC" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#999999"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#CCCCCC" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#999999"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#CCCCCC" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity> */}

            <TouchableOpacity style={styles.loginButton} onPress={initiateSolflareLogin}>
              <Text style={styles.loginButtonText}>Log In with Solflare</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.loginButton2} onPress={handleLogin}>
              <Text style={styles.loginButton2Text}>Log In with Internet Identity</Text>
            </TouchableOpacity>

            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.divider} />
            </View>

            <View style={styles.socialButtonsContainer}>
              <TouchableOpacity style={styles.socialButton}>
                <Ionicons name="logo-google" size={20} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialButton}>
                <Ionicons name="logo-apple" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* <View style={styles.signupContainer}>
              <Text style={styles.signupText}>Don't have an account? </Text>
              <TouchableOpacity onPress={handleSignUp}>
                <Text style={styles.signupLink}>Sign Up</Text>
              </TouchableOpacity>
            </View> */}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  logo: {
    width: 80,
    height: 80,
    resizeMode: "contain",
    borderRadius: 40,
  },
  appName: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: "#CCCCCC",
    marginBottom: 40,
    lineHeight: 22,
  },
  formContainer: {
    width: "100%",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#333333",
    marginBottom: 25,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    color: "#FFFFFF",
    fontSize: 16,
  },
  eyeIcon: {
    padding: 10,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 30,
  },
  forgotPasswordText: {
    color: "#CCCCCC",
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 30,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
  },
  loginButton2: {
    backgroundColor: "#000000",
    borderRadius: 30,
    borderColor: "#FFFFFF",
    borderWidth: 1,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
  },
  loginButtonText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "bold",
  },
  loginButton2Text: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
},
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#333333",
  },
  dividerText: {
    color: "#CCCCCC",
    paddingHorizontal: 10,
    fontSize: 14,
  },
  socialButtonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 40,
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#333333",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 10,
  },
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  signupText: {
    color: "#CCCCCC",
    fontSize: 14,
  },
  signupLink: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },
})
