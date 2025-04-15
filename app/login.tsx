"use client"

import { useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Linking,
} from "react-native"
import Constants from "expo-constants"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import WebView from 'react-native-webview'

import { useAppKit } from "@reown/appkit-wagmi-react-native";
import "@walletconnect/react-native-compat";
import { WagmiProvider } from "wagmi";
import { SolanaAdapter } from "@reown/appkit-adapter-solana/react";
import { mainnet, polygon, arbitrum } from "@wagmi/core/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createAppKit,
  defaultWagmiConfig,
  AppKit,
} from "@reown/appkit-wagmi-react-native";


const queryClient = new QueryClient();

const projectId = "b718ed06e4b6136736ee92a84e7d83fc";

const metadata = {
  name: "Aether Fit",
  description: "Aether Fit",
  url: "https://reown.com/appkit",
  icons: ["https://avatars.githubusercontent.com/u/179229932"],
  redirect: {
    native: "aetherfit://",
    universal: "aetherfit.com",
  },
};

const chains = [mainnet, polygon, arbitrum] as const;

const wagmiConfig = defaultWagmiConfig({ chains, projectId, metadata });

createAppKit({
  projectId,
  wagmiConfig,
  defaultChain: mainnet, // Optional
  enableAnalytics: true, // Optional - defaults to your Cloud configuration
  features: {
    email: true,
    socials: ['x', 'discord', 'apple'],
    emailShowWallets: true,
    swaps: true,
  }
});


export default function Login() {
    const [showWebView, setShowWebView] = useState(false)
    const [webViewUrl, setWebViewUrl] = useState("")
    const router = useRouter()
    const { open } = useAppKit();

    

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
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
            <TouchableOpacity 
              style={styles.loginButton} 
              onPress={() => open()}
            >
              <Text style={styles.loginButtonText}>Log In with Wallet</Text>
            </TouchableOpacity>

            {/* <TouchableOpacity 
              style={styles.loginButton2} 
              onPress={() => console.log("Log In with Internet Identity")}
            >
              <Text style={styles.loginButton2Text}>Log In with Internet Identity</Text>
            </TouchableOpacity> */}

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
          </View>
        </ScrollView>
        <AppKit />
      </QueryClientProvider>
    </WagmiProvider>
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
})