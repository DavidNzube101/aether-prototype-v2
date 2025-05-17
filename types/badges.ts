type BadgeTier = "merit" | "master" | "mythic"

type Badge = {
  id: string
  name: string
  description: string
  requirements: string
  tier: BadgeTier
  value: number // In AETH (fictional currency)
  visual: {
    colorScheme: string
    icon: string
  }
  unlocked: boolean
}

const fitnessBadges: Badge[] = [
  {
    id: "aether-pulse-initiate",
    name: "Aether Pulse Initiate",
    description: "Awakened the primal rhythm of movement across 5+ biometric dimensions",
    requirements: "Complete 5 Brook-tier, 3 Ridge-tier, and 1 Peak-tier challenges",
    tier: "merit",
    value: 500,
    visual: {
      colorScheme: "cyberpunk-purple",
      icon: "pulse-arc",
    },
    unlocked: false,
  },
  {
    id: "kinetic-symphony",
    name: "Kinetic Symphony Virtuoso",
    description: "Orchestrated perfect harmony between body metrics and environmental sensors",
    requirements: "Maintain 85%+ accuracy across 10+ challenges using 3+ sensor types",
    tier: "merit",
    value: 750,
    visual: {
      colorScheme: "neon-teal",
      icon: "waveform-burst",
    },
    unlocked: false,
  },
  {
    id: "celestial-dynamo",
    name: "Celestial Dynamo Adept",
    description: "Channeled stellar-grade energy through biomechanical interfaces",
    requirements: "Burn 50,000+ calories using Peak/Apex challenges with HRV tracking",
    tier: "master",
    value: 1500,
    visual: {
      colorScheme: "supernova-orange",
      icon: "stellar-core",
    },
    unlocked: false,
  },
  {
    id: "neurokinetic-flow",
    name: "Neurokinetic Flow Sovereign",
    description: "Transcended physical limits through neural-sensor synchronization",
    requirements: "Achieve 95th percentile in 3+ Peak-tier biofeedback challenges",
    tier: "master",
    value: 2500,
    visual: {
      colorScheme: "quantum-blue",
      icon: "brain-circuit",
    },
    unlocked: false,
  },
  {
    id: "quantum-zenith",
    name: "Quantum Zenith Paragon",
    description: "Manifested peak human potential across all sensorium dimensions",
    requirements: "Max out all Apex-tier metrics simultaneously for 24hrs",
    tier: "mythic",
    value: 5000,
    visual: {
      colorScheme: "chromatic-aberration",
      icon: "multiverse-glyph",
    },
    unlocked: false,
  },
  {
    id: "omnisensorium-prime",
    name: "Omnisensorium Prime",
    description: "Become one with the sensor grid through total biometric communion",
    requirements: "Sync all 21 metrics at 99% precision for 7 consecutive days",
    tier: "mythic",
    value: 10000,
    visual: {
      colorScheme: "prismatic-shift",
      icon: "hologram-matrix",
    },
    unlocked: false,
  },
]

export type { Badge, BadgeTier }
export { fitnessBadges }
