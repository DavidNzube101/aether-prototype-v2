"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Modal, Alert, ActivityIndicator } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import * as Clipboard from "expo-clipboard"
import { getAuth } from "firebase/auth"
import { convertCurrency, formatCurrency, SUPPORTED_CURRENCIES } from "../../../../utils/currency-converter"
import { useAuth } from "../../../../context/auth-context"
import { getUserProfile, type UserProfile } from "../../../../utils/user-service"
import * as SecureStore from "expo-secure-store"
import { getUserWallet, getWalletAddress, getWalletBalance, sendTransaction } from "../../../../services/wallet-service"
import USDC from "@/components/currency/USDC"

// PIN for wallet access
const WALLET_PIN_KEY = "wallet_pin"

export default function WalletPaymentScreen() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [walletAddress, setWalletAddress] = useState("")
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [walletBalance, setWalletBalance] = useState("0.00")
  const [showReceiveModal, setShowReceiveModal] = useState(false)
  const [showSendModal, setShowSendModal] = useState(false)
  const [recipientAddress, setRecipientAddress] = useState("")
  const [sendAmount, setSendAmount] = useState("")
  const [transactionFee, setTransactionFee] = useState("0.00")
  const [totalAmount, setTotalAmount] = useState("0.00")
  const [conversionError, setConversionError] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [pinProtected, setPinProtected] = useState(false)
  const [showPinModal, setShowPinModal] = useState(false)
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null)
  const [pin, setPin] = useState("")
  const [pinAction, setPinAction] = useState<"verify" | "set">("verify")
  const [pinError, setPinError] = useState("")
  const [pinVerificationRequired, setPinVerificationRequired] = useState(false)
  const auth = getAuth()
  const { user } = useAuth()

  useEffect(() => {
    async function fetchUserProfile() {
      if (!user?.uid) return

      try {
        setLoading(true)
        const profile = await getUserProfile(user.uid)
        setUserProfile(profile)
      } catch (error) {
        console.error("Error fetching user profile:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserProfile()
  }, [user])

  // Check if PIN protection is enabled, but don't show the modal automatically
  useEffect(() => {
    async function checkPinStatus() {
      try {
        const storedPin = await SecureStore.getItemAsync(WALLET_PIN_KEY)
        setPinProtected(!!storedPin)
        setPinVerificationRequired(!!storedPin)

        // Load wallet data regardless of PIN status
        loadWalletData()
      } catch (error) {
        console.error("Error checking PIN protection:", error)
        loadWalletData()
      }
    }

    checkPinStatus()
  }, [])

  // In wallet-payments.tsx - update the useEffect for currency conversion
  useEffect(() => {
    async function performCurrencyConversion() {
      if (!userProfile?.currency?.id) return

      try {
        setConversionError(false)
        const userCurrency = userProfile.currency.id

        // Convert from wallet currency (assumed to be USDC) to user's currency
        const { convertedAmount, success } = await convertCurrency(
          Number(userProfile?.walletBalance),
          "USDC",
          userCurrency,
        )

        setConvertedAmount(convertedAmount)
        if (!success) {
          setConversionError(true)
        }
      } catch (error) {
        console.error("Error converting currency:", error)
        setConversionError(true)
      }
    }

    performCurrencyConversion()
  }, [userProfile, walletBalance, userProfile?.currency?.id])

  const loadWalletData = async () => {
    try {
      setLoading(true)
      const user = auth.currentUser
      if (!user) {
        Alert.alert("Authentication Required", "Please log in to access your wallet", [
          { text: "OK", onPress: () => router.replace("/login") },
        ])
        return
      }

      try {
        // Get wallet address
        const address = await getWalletAddress()
        setWalletAddress(address)

        // Get wallet balance
        const balance = await getWalletBalance()
        setWalletBalance(balance.toFixed(2))
      } catch (error) {
        console.error("Error loading wallet data:", error)
        // If there's an error getting the wallet data, try to get the full wallet
        const wallet = await getUserWallet(user.uid)
        if (wallet) {
          setWalletAddress(wallet.address || "")
          setWalletBalance((wallet.balance || 0).toFixed(2))
        } else {
          throw new Error("Could not load wallet data")
        }
      }
    } catch (error) {
      console.error("Error loading wallet data:", error)
      Alert.alert("Error", "Failed to load wallet data. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleCopyAddress = async () => {
    try {
      await Clipboard.setStringAsync(walletAddress)
      Alert.alert("Success", "Wallet address copied to clipboard")
    } catch (error) {
      console.error("Error copying address:", error)
      Alert.alert("Error", "Failed to copy address. Please try again.")
    }
  }

  const handleSendAmountChange = (value: string) => {
    setSendAmount(value)

    // Calculate transaction fee (0.4%)
    const amount = Number.parseFloat(value) || 0
    const fee = amount * 0.004
    setTransactionFee(fee.toFixed(2))

    // Calculate total amount
    setTotalAmount((amount + fee).toFixed(2))
  }

  const handleSendTransaction = async () => {
    // Check if PIN verification is required before sending
    if (pinVerificationRequired) {
      setPinAction("verify")
      setShowPinModal(true)
      return
    }

    proceedWithTransactionValidation()
  }

  const proceedWithTransactionValidation = () => {
    try {
      // Validate input
      if (!recipientAddress.trim()) {
        Alert.alert("Error", "Please enter a recipient address")
        return
      }

      const amount = Number.parseFloat(sendAmount)
      if (isNaN(amount) || amount <= 0) {
        Alert.alert("Error", "Please enter a valid amount")
        return
      }

      const total = Number.parseFloat(totalAmount)
      const balance = Number.parseFloat(walletBalance)
      if (total > balance) {
        Alert.alert("Error", "Insufficient balance for this transaction")
        return
      }

      // Confirm transaction
      Alert.alert(
        "Confirm Transaction",
        `Send ${sendAmount} SOL to ${recipientAddress}?\nTransaction fee: ${transactionFee} SOL\nTotal: ${totalAmount} SOL`,
        [
          { text: "Cancel", style: "cancel" },
          { text: "Confirm", onPress: processTransaction },
        ],
      )
    } catch (error) {
      console.error("Error validating transaction:", error)
      Alert.alert("Error", "Failed to validate transaction. Please try again.")
    }
  }

  const processTransaction = async () => {
    try {
      setProcessing(true)

      // Send transaction
      const success = await sendTransaction(recipientAddress, Number.parseFloat(sendAmount))

      if (success) {
        Alert.alert("Success", "Transaction sent successfully", [
          {
            text: "OK",
            onPress: () => {
              setShowSendModal(false)
              setRecipientAddress("")
              setSendAmount("")
              loadWalletData() // Refresh wallet data
            },
          },
        ])
      } else {
        throw new Error("Transaction failed")
      }
    } catch (error) {
      console.error("Error sending transaction:", error)
      Alert.alert("Error", "Failed to send transaction. Please try again.")
    } finally {
      setProcessing(false)
    }
  }

  const handlePinSubmit = async () => {
    try {
      if (pinAction === "verify") {
        // Verify existing PIN
        const storedPin = await SecureStore.getItemAsync(WALLET_PIN_KEY)
        if (pin === storedPin) {
          setShowPinModal(false)
          setPinError("")
          setPin("")

          // If this was for a transaction, proceed with it
          if (showSendModal) {
            proceedWithTransactionValidation()
          }
        } else {
          setPinError("Incorrect PIN. Please try again.")
        }
      } else if (pinAction === "set") {
        // Set new PIN
        if (pin.length < 4) {
          setPinError("PIN must be at least 4 digits")
          return
        }

        await SecureStore.setItemAsync(WALLET_PIN_KEY, pin)
        setPinProtected(true)
        setPinVerificationRequired(true)
        setShowPinModal(false)
        setPinError("")
        setPin("")
        Alert.alert("Success", "Wallet PIN set successfully")
      }
    } catch (error) {
      console.error("Error handling PIN:", error)
      setPinError("An error occurred. Please try again.")
    }
  }

  const handleWalletPinToggle = async (value: boolean) => {
    if (value) {
      // Enable wallet PIN - show the PIN modal
      setPinAction("set")
      setShowPinModal(true)
    } else {
      // Disable wallet PIN
      Alert.alert("Remove Wallet PIN", "Are you sure you want to remove the PIN protection from your wallet?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            await SecureStore.deleteItemAsync(WALLET_PIN_KEY)
            setPinProtected(false)
            setPinVerificationRequired(false)
          },
        },
      ])
    }
  }

  const CLUSTER = "Testnet"

  const userCurrency = userProfile?.currency?.id || "USD"

  const formattedConvertedAmount = convertedAmount !== null ? formatCurrency(convertedAmount, userCurrency) : "..."

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Wallet & Payments</Text>
        <TouchableOpacity onPress={() => handleWalletPinToggle(!pinProtected)} style={styles.pinButton}>
          <Ionicons name={pinProtected ? "lock-closed" : "lock-open"} size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ffffff" />
          <Text style={styles.loadingText}>Loading wallet...</Text>
        </View>
      ) : (
        <View style={styles.content}>
          <View style={styles.walletCard}>
            <View style={styles.walletHeader}>
              <Text style={styles.walletTitle}>Wallet</Text>
              <View style={styles.walletBadge}>
                <Text style={styles.walletBadgeText}>{CLUSTER}</Text>
              </View>
            </View>

            <View style={styles.balanceContainer}>
              <Text style={styles.balanceLabel}>Balance</Text>
              <View style={styles.balanceAmountContainer}>
                <USDC />
                {/* <SOLANA /> */}
                <Text style={styles.balanceAmount}>
                  {userProfile?.walletBalance !== null
                    ? userProfile?.walletBalance.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })
                    : "0.00"}
                </Text>
              </View>

              <View>
                {loading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : conversionError ? (
                  <Text style={styles.errorText}>Conversion unavailable</Text>
                ) : (
                  <Text style={styles.balanceUsd}>
                    ≈ {SUPPORTED_CURRENCIES[userCurrency as keyof typeof SUPPORTED_CURRENCIES]?.symbol}
                    {convertedAmount !== null
                      ? convertedAmount.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })
                      : "converting"}{" "}
                    {userCurrency}
                  </Text>
                )}
              </View>
            </View>

            <View style={styles.addressContainer}>
              <Text style={styles.addressLabel}>Wallet Address</Text>
              <View style={styles.addressRow}>
                <Text style={styles.addressText} numberOfLines={1} ellipsizeMode="middle">
                  {walletAddress}
                </Text>
                <TouchableOpacity onPress={handleCopyAddress} style={styles.copyButton}>
                  <Ionicons name="copy-outline" size={18} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.actionsContainer}>
              <TouchableOpacity
                style={[styles.actionButton, styles.receiveButton]}
                onPress={() => setShowReceiveModal(true)}
              >
                <Ionicons name="arrow-down-outline" size={20} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>Receive</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.actionButton, styles.sendButton]} onPress={() => setShowSendModal(true)}>
                <Ionicons name="arrow-up-outline" size={20} color="#000000" />
                <Text style={styles.actionButtonText2}>Send</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.transactionsContainer}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <View style={styles.emptyTransactions}>
              <Ionicons name="list" size={40} color="#444444" />
              <Text style={styles.emptyTransactionsText}>No recent transactions</Text>
            </View>
          </View>
        </View>
      )}

      {/* Receive Modal */}
      <Modal
        visible={showReceiveModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowReceiveModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Receive SOL</Text>
              <TouchableOpacity onPress={() => setShowReceiveModal(false)}>
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.receiveInstructions}>
                Share your wallet address to receive SOL. Only send SOL to this address.
              </Text>

              <View style={styles.qrPlaceholder}>
                <Ionicons name="qr-code" size={120} color="#FFFFFF" />
              </View>

              <View style={styles.receiveAddressContainer}>
                <Text style={styles.receiveAddressLabel}>Your Wallet Address</Text>
                <Text style={styles.receiveAddress} selectable={true}>
                  {walletAddress}
                </Text>
                <TouchableOpacity style={styles.copyAddressButton} onPress={handleCopyAddress}>
                  <Ionicons name="copy-outline" size={18} color="#FFFFFF" />
                  <Text style={styles.copyAddressText}>Copy Address</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Send Modal */}
      <Modal
        visible={showSendModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowSendModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Send SOL</Text>
              <TouchableOpacity onPress={() => setShowSendModal(false)} disabled={processing}>
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Recipient Address</Text>
                <TextInput
                  style={styles.input}
                  value={recipientAddress}
                  onChangeText={setRecipientAddress}
                  placeholder="Enter SOL address"
                  placeholderTextColor="#666666"
                  editable={!processing}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Amount (SOL)</Text>
                <TextInput
                  style={styles.input}
                  value={sendAmount}
                  onChangeText={handleSendAmountChange}
                  placeholder="0.00"
                  placeholderTextColor="#666666"
                  keyboardType="decimal-pad"
                  editable={!processing}
                />
              </View>

              <View style={styles.feeContainer}>
                <View style={styles.feeRow}>
                  <Text style={styles.feeLabel}>Transaction Fee (0.4%)</Text>
                  <Text style={styles.feeValue}>◎ {transactionFee}</Text>
                </View>
                <View style={styles.feeRow}>
                  <Text style={styles.totalLabel}>Total Amount</Text>
                  <Text style={styles.totalValue}>◎ {totalAmount}</Text>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.sendTransactionButton, processing && styles.processingButton]}
                onPress={handleSendTransaction}
                disabled={processing}
              >
                {processing ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <>
                    <Ionicons name="paper-plane" size={18} color="#FFFFFF" />
                    <Text style={styles.sendTransactionButtonText}>Send Transaction</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* PIN Modal */}
      <Modal
        visible={showPinModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          if (pinAction === "set") {
            setShowPinModal(false)
            setPin("")
            setPinError("")
          }
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.pinModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{pinAction === "verify" ? "Enter Wallet PIN" : "Set Wallet PIN"}</Text>
              {pinAction === "set" && (
                <TouchableOpacity
                  onPress={() => {
                    setShowPinModal(false)
                    setPin("")
                    setPinError("")
                  }}
                >
                  <Ionicons name="close" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.pinModalBody}>
              <Text style={styles.pinInstructions}>
                {pinAction === "verify"
                  ? "Enter your PIN to access your wallet"
                  : "Set a PIN to protect your wallet (minimum 4 digits)"}
              </Text>

              <TextInput
                style={styles.pinInput}
                value={pin}
                onChangeText={setPin}
                placeholder="Enter PIN"
                placeholderTextColor="#666666"
                keyboardType="numeric"
                secureTextEntry={true}
                maxLength={8}
                autoFocus={true}
              />

              {pinError ? <Text style={styles.pinErrorText}>{pinError}</Text> : null}

              <TouchableOpacity style={styles.pinSubmitButton} onPress={handlePinSubmit}>
                <Text style={styles.pinSubmitButtonText}>{pinAction === "verify" ? "Unlock Wallet" : "Set PIN"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  currencyIcon: {
    width: 30,
    height: 30,
    marginRight: 5,
    borderRadius: 15,
    marginTop: -5,
  },
  pinButton: {
    padding: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#CCCCCC",
    fontSize: 16,
    marginTop: 10,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  walletCard: {
    backgroundColor: "#222222",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  walletHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  walletTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  walletBadge: {
    backgroundColor: "#ffffff",
    color: "#000000",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  walletBadgeText: {
    color: "#000000",
    fontSize: 12,
    fontWeight: "bold",
  },
  balanceContainer: {
    marginBottom: 20,
  },
  balanceLabel: {
    fontSize: 14,
    color: "#AAAAAA",
    marginBottom: 5,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 5,
  },
  balanceAmountContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  balanceUsd: {
    fontSize: 14,
    color: "#AAAAAA",
  },
  addressContainer: {
    marginBottom: 20,
  },
  addressLabel: {
    fontSize: 14,
    color: "#AAAAAA",
    marginBottom: 5,
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#333333",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  addressText: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 14,
  },
  errorText: {
    fontSize: 14,
    color: "#FF6B6B",
    fontStyle: "italic",
  },
  copyButton: {
    padding: 5,
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    flex: 0.48,
  },
  receiveButton: {
    backgroundColor: "#333333",
  },
  sendButton: {
    backgroundColor: "#ffffff",
    color: "#000000",
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    marginLeft: 8,
  },
  actionButtonText2: {
    color: "#000000",
    fontWeight: "bold",
    marginLeft: 8,
  },
  transactionsContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 15,
  },
  emptyTransactions: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#222222",
    borderRadius: 12,
    padding: 30,
  },
  emptyTransactionsText: {
    color: "#AAAAAA",
    marginTop: 10,
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    backgroundColor: "#222222",
    borderRadius: 12,
    overflow: "hidden",
  },
  pinModalContent: {
    width: "80%",
    backgroundColor: "#222222",
    borderRadius: 12,
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#333333",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
  },

  modalBody: {
    padding: 20,
  },
  receiveInstructions: {
    color: "#CCCCCC",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 20,
  },
  qrPlaceholder: {
    alignSelf: "center",
    backgroundColor: "#333333",
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  receiveAddressContainer: {
    alignItems: "center",
  },
  receiveAddressLabel: {
    fontSize: 14,
    color: "#AAAAAA",
    marginBottom: 10,
  },
  receiveAddress: {
    color: "#FFFFFF",
    textAlign: "center",
    backgroundColor: "#333333",
    padding: 12,
    borderRadius: 8,
    width: "100%",
    marginBottom: 15,
  },
  copyAddressButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#333333",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  copyAddressText: {
    color: "#FFFFFF",
    marginLeft: 5,
    fontSize: 14,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    color: "#AAAAAA",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#333333",
    borderRadius: 8,
    padding: 12,
    color: "#FFFFFF",
    fontSize: 16,
  },
  feeContainer: {
    backgroundColor: "#333333",
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
  },
  feeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  feeLabel: {
    color: "#AAAAAA",
    fontSize: 14,
  },
  feeValue: {
    color: "#FFFFFF",
    fontSize: 14,
  },
  totalLabel: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  totalValue: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  sendTransactionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    color: "#000000",
    borderRadius: 8,
    padding: 15,
  },
  processingButton: {
    backgroundColor: "#666666",
  },
  sendTransactionButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 8,
  },
  pinModalBody: {
    padding: 20,
    alignItems: "center",
  },
  pinInstructions: {
    color: "#CCCCCC",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 20,
  },
  pinInput: {
    backgroundColor: "#333333",
    borderRadius: 8,
    padding: 12,
    color: "#FFFFFF",
    fontSize: 24,
    textAlign: "center",
    width: "80%",
    marginBottom: 20,
  },
  pinErrorText: {
    color: "#FF6B6B",
    marginBottom: 15,
    textAlign: "center",
  },
  pinSubmitButton: {
    backgroundColor: "#ffffff",
    color: "#000000",
    borderRadius: 8,
    padding: 15,
    width: "100%",
    alignItems: "center",
  },
  pinSubmitButtonText: {
    color: "#000000",
    fontWeight: "bold",
    fontSize: 16,
  },
})
