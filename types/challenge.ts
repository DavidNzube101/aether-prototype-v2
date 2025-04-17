// Define the Creator type structure
export interface Creator {
  app_name: string
  offchain_identifier: string
  onchain_identifier: string
}

// Define the Challenge type structure
export interface Challenge {
  id: string | number
  name: string
  image: any // React Native image source or URL string
  icon?: any // Optional icon image source or URL string
  reward: string
  timeLeft: string
  type: "Fitness" | "Wellness" | "Endurance" | string
  sponsored: boolean
  duration: number
  stakeCurrency: "USDC" | "SOL"
  intensity: "Brook" | "Ridge" | "Peak" | "Apex"
  stakeAmount: number
  likes: number
  dislikes: number
  hasChatroom: boolean
  creator: Creator | string // Updated to support both string and Creator object
  description?: string
  status?: "active" | "inactive" | "expired"
  startDate?: string
  endDate?: string
  rules?: string[]
  metrics?: string[]
  activated_status?: "active" | "inactive" | "expired"
  selectedMetric?: any // Metric object or string
  measurementValue?: string // Target value for the metric
  metricMeasurement?: string // Unit of measurement
  targetValue?: string // Alternative name for measurement value

  // New community statistics fields
  participants?: string[] // Array of offchain_ids of participants
  participant_count?: number // Number of participants
  completed_count?: number // Number of participants who completed the challenge
  liked_by?: string[] // Array of offchain_ids of users who liked the challenge
}

// Define filter types
export interface ChallengeFilters {
  type: string
  sponsored: string
  duration: [number, number]
  stakeCurrency: string
  intensity: string
  status?: string
}
