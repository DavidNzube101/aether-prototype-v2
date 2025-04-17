// Define sensor types
type Sensor =
  | "Accelerometer"
  | "Gyroscope"
  | "GPS"
  | "Barometer"
  | "Camera"
  | "Microphone"
  | "AmbientLightSensor"
  | "Wearable";

// Define fitness metric
type FitnessMetric = {
  name: string;
  sensors: Sensor[];
  challengeLevel: "Brook" | "Ridge" | "Peak" | "Apex";
  measurement: string;
};

// Full list of 21 metrics
const metrics: FitnessMetric[] = [
  // Brook (Easy)
  {
    name: "Steps",
    sensors: ["Accelerometer", "Gyroscope"],
    challengeLevel: "Brook",
    measurement: "steps"
  },
  {
    name: "Distance Traveled",
    sensors: ["GPS", "Accelerometer"],
    challengeLevel: "Brook",
    measurement: "meters"
  },
  {
    name: "Activity Recognition",
    sensors: ["Accelerometer", "Gyroscope"],
    challengeLevel: "Brook",
    measurement: "activity type"
  },
  {
    name: "Repetition Counting",
    sensors: ["Accelerometer", "Gyroscope"],
    challengeLevel: "Brook",
    measurement: "reps"
  },
  {
    name: "Posture Analysis",
    sensors: ["Accelerometer", "Gyroscope"],
    challengeLevel: "Brook",
    measurement: "posture quality"
  },

  // Ridge (Medium)
  {
    name: "Speed/Pace",
    sensors: ["GPS", "Accelerometer"],
    challengeLevel: "Ridge",
    measurement: "m/s"
  },
  {
    name: "Cadence",
    sensors: ["Accelerometer"],
    challengeLevel: "Ridge",
    measurement: "steps per minute"
  },
  {
    name: "Stride Length",
    sensors: ["Accelerometer", "GPS"],
    challengeLevel: "Ridge",
    measurement: "meters per step"
  },
  {
    name: "Calories Burned",
    sensors: ["Accelerometer", "GPS"],
    challengeLevel: "Ridge",
    measurement: "calories"
  },
  {
    name: "Sleep Tracking",
    sensors: ["Accelerometer", "Microphone", "AmbientLightSensor"],
    challengeLevel: "Ridge",
    measurement: "sleep quality"
  },

  // Peak (Hard)
  {
    name: "Elevation Gain",
    sensors: ["Barometer"],
    challengeLevel: "Peak",
    measurement: "meters climbed"
  },
  {
    name: "Route Mapping",
    sensors: ["GPS"],
    challengeLevel: "Peak",
    measurement: "route coordinates"
  },
  {
    name: "Cycling Metrics",
    sensors: ["GPS", "Accelerometer"],
    challengeLevel: "Peak",
    measurement: "km/h"
  },
  {
    name: "Balance/Stability",
    sensors: ["Gyroscope", "Accelerometer"],
    challengeLevel: "Peak",
    measurement: "balance score"
  },
  {
    name: "METs",
    sensors: ["Accelerometer", "GPS"],
    challengeLevel: "Peak",
    measurement: "MET values"
  },
  {
    name: "Fall Detection",
    sensors: ["Accelerometer", "Gyroscope"],
    challengeLevel: "Peak",
    measurement: "fall incidents"
  },

  // Apex (Intense)
  {
    name: "Heart Rate",
    sensors: ["Camera", "Wearable"],
    challengeLevel: "Apex",
    measurement: "bpm"
  },
  {
    name: "VO₂ Max Estimation",
    sensors: ["GPS", "Accelerometer", "Wearable"],
    challengeLevel: "Apex",
    measurement: "ml/kg/min"
  },
  {
    name: "Stress Levels",
    sensors: ["Camera", "Microphone"],
    challengeLevel: "Apex",
    measurement: "stress score"
  },
  {
    name: "Swim Tracking",
    sensors: ["Accelerometer"],
    challengeLevel: "Apex",
    measurement: "pool laps"
  },
  {
    name: "Breathing Rate",
    sensors: ["Microphone", "Accelerometer"],
    challengeLevel: "Apex",
    measurement: "breaths per minute"
  },
];

// Challenge type constraints
type ChallengeTier = "Brook" | "Ridge" | "Peak" | "Apex";

type ChallengeCategory<T extends ChallengeTier> = {
  name: string;
  tier: T;
  allowedMetrics: FitnessMetric[];
};

// Example usage
const BrookChallenge: ChallengeCategory<"Brook"> = {
  name: "Beginner Daily Steps",
  tier: "Brook",
  allowedMetrics: metrics.filter((m) => m.challengeLevel === "Brook"),
};

const ApexChallenge: ChallengeCategory<"Apex"> = {
  name: "Elite Triathlon Prep",
  tier: "Apex",
  allowedMetrics: metrics.filter((m) => m.challengeLevel === "Apex"),
};

export { metrics, ChallengeTier, ChallengeCategory, FitnessMetric };