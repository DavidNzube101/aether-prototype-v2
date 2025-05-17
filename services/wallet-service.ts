import { getFirestore, doc, getDoc, setDoc, updateDoc, arrayUnion } from "firebase/firestore"
import { getAuth } from "firebase/auth"

const db = getFirestore()
const auth = getAuth()

/**
 * Get user wallet information
 * @param userId User ID
 * @returns Wallet information
 */
export async function getUserWallet(userId: string): Promise<any> {
  try {
    const walletRef = doc(db, "userWallets", userId)
    const walletSnap = await getDoc(walletRef)

    if (walletSnap.exists()) {
      return walletSnap.data()
    }

    // If wallet doesn't exist, create a new one
    const newWallet = {
      address: generateWalletAddress(), // Generate a random wallet address
      balance: 10.0, // Start with 10 SOL for testing
      transactions: [
        {
          type: "receive",
          amount: 10.0,
          date: new Date().toISOString().split("T")[0],
          status: "completed",
          description: "Initial balance",
        },
      ],
      requirePin: false,
    }

    await setDoc(walletRef, newWallet)
    return newWallet
  } catch (error) {
    console.error("Error getting user wallet:", error)
    throw error
  }
}

/**
 * Get wallet address for the current user
 * @returns Wallet address string
 */
export async function getWalletAddress(): Promise<string> {
  try {
    const user = auth.currentUser
    if (!user) {
      throw new Error("User not authenticated")
    }

    const wallet = await getUserWallet(user.uid)
    return wallet.address || ""
  } catch (error) {
    console.error("Error getting wallet address:", error)
    throw error
  }
}

/**
 * Get wallet balance for the current user
 * @returns Wallet balance as a number
 */
export async function getWalletBalance(): Promise<number> {
  try {
    const user = auth.currentUser
    if (!user) {
      throw new Error("User not authenticated")
    }

    const wallet = await getUserWallet(user.uid)
    return wallet.balance || 0
  } catch (error) {
    console.error("Error getting wallet balance:", error)
    throw error
  }
}

/**
 * Send transaction from current user's wallet
 * @param recipientAddress Recipient wallet address
 * @param amount Amount to send
 * @returns Success status
 */
export async function sendTransaction(recipientAddress: string, amount: number): Promise<boolean> {
  try {
    const user = auth.currentUser
    if (!user) {
      throw new Error("User not authenticated")
    }

    // Calculate fee (0.4%)
    const fee = amount * 0.004

    // Send the transaction
    return await sendSolana(user.uid, recipientAddress, amount, fee)
  } catch (error) {
    console.error("Error sending transaction:", error)
    throw error
  }
}

/**
 * Send SOL from user's wallet to another address
 * @param userId User ID
 * @param recipientAddress Recipient wallet address
 * @param amount Amount to send
 * @param fee Transaction fee
 * @returns Success status
 */
export async function sendSolana(
  userId: string,
  recipientAddress: string,
  amount: number,
  fee: number,
): Promise<boolean> {
  try {
    // Get user wallet
    const walletRef = doc(db, "userWallets", userId)
    const walletSnap = await getDoc(walletRef)

    if (!walletSnap.exists()) {
      throw new Error("Wallet not found")
    }

    const wallet = walletSnap.data()
    const totalAmount = amount + fee

    // Check if user has enough balance
    if (wallet.balance < totalAmount) {
      throw new Error("Insufficient balance")
    }

    // Update wallet balance
    const newBalance = wallet.balance - totalAmount

    // Add transaction to history
    const transaction = {
      type: "send",
      amount: amount,
      fee: fee,
      recipient: recipientAddress,
      date: new Date().toISOString().split("T")[0],
      status: "completed",
      description: `Sent to ${recipientAddress.substring(0, 8)}...`,
    }

    // Update wallet in Firestore
    await updateDoc(walletRef, {
      balance: newBalance,
      transactions: arrayUnion(transaction),
    })

    return true
  } catch (error) {
    console.error("Error sending SOL:", error)
    throw error
  }
}

/**
 * Generate a random Solana wallet address
 * @returns Random wallet address
 */
function generateWalletAddress(): string {
  const chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"
  let result = ""
  for (let i = 0; i < 44; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * Set wallet PIN
 * @param userId User ID
 * @param pin PIN code
 * @returns Success status
 */
export async function setWalletPin(userId: string, pin: string): Promise<boolean> {
  try {
    const walletRef = doc(db, "userWallets", userId)

    // In a real app, you would hash the PIN before storing it
    // For this demo, we'll just store a flag that PIN is required
    await updateDoc(walletRef, {
      requirePin: true,
    })

    return true
  } catch (error) {
    console.error("Error setting wallet PIN:", error)
    throw error
  }
}

/**
 * Verify wallet PIN
 * @param userId User ID
 * @param pin PIN code
 * @returns Success status
 */
export async function verifyWalletPin(userId: string, pin: string): Promise<boolean> {
  try {
    // In a real app, you would verify the PIN against a stored hash
    // For this demo, we'll just return true
    return true
  } catch (error) {
    console.error("Error verifying wallet PIN:", error)
    throw error
  }
}
