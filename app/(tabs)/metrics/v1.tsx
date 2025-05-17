// "use client"

// import { useState, useEffect } from "react"
// import { View, Text, TouchableOpacity, ScrollView, Modal, Alert, StyleSheet } from "react-native"
// import { Ionicons } from "@expo/vector-icons"
// import { useRouter } from "expo-router"
// import { metrics } from "../../../types/fitnessMetrics"
// import { getAuth } from "firebase/auth"
// import { getUserMetrics, resetMetrics, injectDummyMetricValues } from "../../../services/metrics-service"
// import type { FitnessMetric } from "../../../types/fitnessMetrics"

// export default function MetricsScreen() {
//   const router = useRouter()
//   const [userMetrics, setUserMetrics] = useState<Record<string, number>>({})
//   const [loading, setLoading] = useState(true)
//   const [selectedMetric, setSelectedMetric] = useState<FitnessMetric | null>(null)
//   const [modalVisible, setModalVisible] = useState(false)
//   const auth = getAuth()

//   useEffect(() => {
//     // Check if user is authenticated
//     const user = auth.currentUser
//     if (!user) {
//       Alert.alert("Authentication Required", "Please log in to view your metrics", [
//         { text: "OK", onPress: () => router.replace("/login") },
//       ])
//       return
//     }

//     fetchUserMetrics()
//   }, [])

//   const fetchUserMetrics = async () => {
//     try {
//       setLoading(true)
//       const metricsData = await getUserMetrics()
//       setUserMetrics(metricsData)
//     } catch (error) {
//       console.error("Error fetching user metrics:", error)
//       Alert.alert("Error", "Failed to load metrics. Please try again.")
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleMetricPress = (metric: FitnessMetric) => {
//     setSelectedMetric(metric)
//     setModalVisible(true)
//   }

//   const handleResetMetrics = async () => {
//     try {
//       await resetMetrics()
//       Alert.alert("Success", "Metrics have been reset and saved to history")
//       fetchUserMetrics()
//     } catch (error) {
//       console.error("Error resetting metrics:", error)
//       Alert.alert("Error", "Failed to reset metrics. Please try again.")
//     }
//   }

//   const handleInjectDummyValues = async () => {
//     try {
//       await injectDummyMetricValues()
//       Alert.alert("Success", "Dummy values have been injected into metrics")
//       fetchUserMetrics()
//     } catch (error) {
//       console.error("Error injecting dummy values:", error)
//       Alert.alert("Error", "Failed to inject dummy values. Please try again.")
//     }
//   }

//   const renderMetricValue = (metricName: string) => {
//     const value = userMetrics[metricName] || 0
//     const metricInfo = metrics.find((m) => m.name === metricName)
//     return `${value} ${metricInfo?.measurement || ""}`
//   }

//   const metricIcons: Record<string, keyof typeof Ionicons.glyphMap> = {
//     "Steps": "footsteps",
//     "Distance Traveled": "map",
//     "Activity Recognition": "body",
//     "Repetition Counting": "repeat",
//     "Posture Analysis": "phone-portrait",
//     "Speed/Pace": "speedometer",
//     "Cadence": "timer",
//     "Stride Length": "resize",
//     "Calories Burned": "flame",
//     "Sleep Tracking": "moon",
//     "Elevation Gain": "trending-up",
//     "Route Mapping": "locate",
//     "Cycling Metrics": "bicycle",
//     "Balance/Stability": "git-compare",
//     "METs": "analytics",
//     "Fall Detection": "warning",
//     "Heart Rate": "heart",
//     "VO₂ Max Estimation": "fitness",
//     "Stress Levels": "happy",
//     "Swim Tracking": "water",
//     "Breathing Rate": "cloudy-night"
//   }

//   const renderMetricItem = (metric: FitnessMetric, index: number) => (
//     <TouchableOpacity key={index} style={styles.metricItem} onPress={() => handleMetricPress(metric)}>
//       <Text style={styles.metricName}>{metric.name}</Text>
//       <Ionicons 
//           name={metricIcons[metric.name]} 
//           size={40} 
//           style={styles.metricIcon} 
//           color="#FFFFFF" 
//         />
//       <Text style={styles.metricValue}>{renderMetricValue(metric.name)}</Text>
//     </TouchableOpacity>
//   )

//   // Group metrics into rows of 2
//   const renderMetricRows = () => {
//     const rows = []
//     for (let i = 0; i < metrics.length; i += 2) {
//       const row = (
//         <View key={i} style={styles.metricRow}>
//           {renderMetricItem(metrics[i], i)}
          
//           {i + 1 < metrics.length && renderMetricItem(metrics[i + 1], i + 1)}
//         </View>
//       )
//       rows.push(row)
//     }
//     return rows
//   }

//   return (
//     <View style={styles.container}>
//       <View style={styles.header}>
//         <Text style={styles.headerTitle}>Fitness Metrics</Text>
//         <View style={styles.headerButtons}>
//           <TouchableOpacity style={styles.headerButton} onPress={handleResetMetrics}>
//             <Ionicons name="refresh" size={20} color="#FFFFFF" />
//             <Text style={styles.headerButtonText}>Reset</Text>
//           </TouchableOpacity>
//           <TouchableOpacity style={styles.headerButton} onPress={handleInjectDummyValues}>
//             <Ionicons name="flask" size={20} color="#FFFFFF" />
//             <Text style={styles.headerButtonText}>Test</Text>
//           </TouchableOpacity>
//         </View>
//       </View>

//       {loading ? (
//         <View style={styles.loadingContainer}>
//           <Text style={styles.loadingText}>Loading metrics...</Text>
//         </View>
//       ) : (
//         <ScrollView style={styles.scrollContainer}>{renderMetricRows()}</ScrollView>
//       )}

//       {/* Metric Details Modal */}
//       <Modal
//         animationType="slide"
//         transparent={true}
//         visible={modalVisible}
//         onRequestClose={() => setModalVisible(false)}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContent}>
//             <View style={styles.modalHeader}>
//               <Text style={styles.modalTitle}>{selectedMetric?.name}</Text>
//               <TouchableOpacity onPress={() => setModalVisible(false)}>
//                 <Ionicons name="close" size={24} color="#FFFFFF" />
//               </TouchableOpacity>
//             </View>

//             <ScrollView style={styles.modalScrollContent}>
//               <View style={styles.metricDetailRow}>
//                 <Text style={styles.metricDetailLabel}>Current Value:</Text>
//                 <Text style={styles.metricDetailValue}>
//                   {selectedMetric ? renderMetricValue(selectedMetric.name) : ""}
//                 </Text>
//               </View>

//               <View style={styles.metricDetailRow}>
//                 <Text style={styles.metricDetailLabel}>Measurement:</Text>
//                 <Text style={styles.metricDetailValue}>{selectedMetric?.measurement}</Text>
//               </View>

//               <View style={styles.metricDetailRow}>
//                 <Text style={styles.metricDetailLabel}>Challenge Level:</Text>
//                 <Text style={styles.metricDetailValue}>{selectedMetric?.challengeLevel}</Text>
//               </View>

//               <View style={styles.metricDetailRow}>
//                 <Text style={styles.metricDetailLabel}>Sensors:</Text>
//                 <View>
//                   {selectedMetric?.sensors.map((sensor, index) => (
//                     <Text key={index} style={styles.metricDetailValue}>
//                       • {sensor}
//                     </Text>
//                   ))}
//                 </View>
//               </View>

//               <View style={styles.metricDetailSection}>
//                 <Text style={styles.metricDetailSectionTitle}>How it's calculated</Text>
//                 <Text style={styles.metricDetailText}>
//                   {selectedMetric?.name === "Steps" &&
//                     "Steps are calculated using the accelerometer and gyroscope to detect the characteristic motion pattern of walking. Each step is counted when a complete step cycle is detected."}
//                   {selectedMetric?.name === "Distance Traveled" &&
//                     "Distance is calculated using GPS coordinates for outdoor activities, or estimated from step count and stride length for indoor activities."}
//                   {selectedMetric?.name === "Activity Recognition" &&
//                     "Machine learning algorithms analyze patterns from accelerometer and gyroscope data to identify different types of activities like walking, running, or cycling."}
//                   {selectedMetric?.name === "Repetition Counting" &&
//                     "Repetitions are counted by identifying specific motion patterns that correspond to exercises like push-ups, squats, or sit-ups."}
//                   {selectedMetric?.name === "Posture Analysis" &&
//                     "Posture is analyzed by detecting the orientation and movement patterns of the device, comparing them to reference patterns of good posture."}
//                   {selectedMetric?.name === "Speed/Pace" &&
//                     "Speed is calculated by measuring the distance traveled over time using GPS data, or estimated from step frequency and stride length."}
//                   {selectedMetric?.name === "Cadence" &&
//                     "Cadence measures steps per minute by counting the number of steps taken in a given time period."}
//                   {selectedMetric?.name === "Stride Length" &&
//                     "Stride length is calculated by dividing the total distance traveled by the number of steps taken."}
//                   {selectedMetric?.name === "Calories Burned" &&
//                     "Calories are estimated based on user's weight, activity type, intensity, and duration using metabolic equivalents (METs)."}
//                   {selectedMetric?.name === "Sleep Tracking" &&
//                     "Sleep is tracked by analyzing micro-movements during rest, ambient light, and sound to determine sleep stages and quality."}
//                   {selectedMetric?.name === "Elevation Gain" &&
//                     "Elevation gain is measured using the barometric pressure sensor to detect changes in altitude during activities."}
//                   {selectedMetric?.name === "Route Mapping" &&
//                     "Routes are mapped by recording GPS coordinates at regular intervals during outdoor activities."}
//                   {selectedMetric?.name === "Cycling Metrics" &&
//                     "Cycling metrics include speed, distance, and cadence calculated from GPS data and motion sensors."}
//                   {selectedMetric?.name === "Balance/Stability" &&
//                     "Balance is assessed by measuring the stability of movement patterns and body sway using gyroscope data."}
//                   {selectedMetric?.name === "METs" &&
//                     "Metabolic Equivalent of Task (MET) values are calculated based on activity intensity, with one MET being the energy used at rest."}
//                   {selectedMetric?.name === "Fall Detection" &&
//                     "Falls are detected by identifying sudden acceleration changes followed by impact and lack of movement."}
//                   {selectedMetric?.name === "Heart Rate" &&
//                     "Heart rate is measured using the camera flash and sensor to detect subtle color changes in fingertip blood flow, or via connected wearable devices."}
//                   {selectedMetric?.name === "VO₂ Max Estimation" &&
//                     "VO₂ max is estimated using heart rate data during exercise, combined with pace/speed data and user demographics."}
//                   {selectedMetric?.name === "Stress Levels" &&
//                     "Stress levels are estimated by analyzing heart rate variability, breathing patterns, and facial expressions."}
//                   {selectedMetric?.name === "Swim Tracking" &&
//                     "Swimming is tracked by detecting characteristic motion patterns of different swim strokes using accelerometer data."}
//                   {selectedMetric?.name === "Breathing Rate" &&
//                     "Breathing rate is measured by detecting subtle chest movements using the accelerometer or by analyzing audio patterns."}
//                 </Text>
//               </View>
//             </ScrollView>
//           </View>
//         </View>
//       </Modal>
//     </View>
//   )
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#000000",
//   },
//   header: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     paddingHorizontal: 20,
//     paddingTop: 50,
//     paddingBottom: 15,
//   },
//   headerTitle: {
//     fontSize: 24,
//     fontWeight: "bold",
//     color: "#FFFFFF",
//   },
//   headerButtons: {
//     flexDirection: "row",
//   },
//   headerButton: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#333333",
//     paddingHorizontal: 12,
//     paddingVertical: 8,
//     borderRadius: 20,
//     marginLeft: 10,
//   },
//   headerButtonText: {
//     color: "#FFFFFF",
//     marginLeft: 5,
//     fontSize: 12,
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   loadingText: {
//     color: "#CCCCCC",
//     fontSize: 16,
//   },
//   scrollContainer: {
//     flex: 1,
//     padding: 15,
//   },
//   metricRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginBottom: 15,
//   },
//   metricItem: {
//     width: "48%",
//     backgroundColor: "#222222",
//     borderRadius: 12,
//     padding: 15,
//     minHeight: 100,
//     justifyContent: "space-between",
//   },
//   metricName: {
//     fontSize: 19,
//     fontWeight: "bold",
//     color: "#FFFFFF",
//     marginBottom: 10,
//   },
//   metricIcon: {
//     alignSelf: "flex-end",
//     margin: 10,
//   },
//   metricValue: {
//     fontSize: 17,
//     color: "#878686",
//     fontWeight: "bold",
//   },
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: "rgba(0, 0, 0, 0.7)",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   modalContent: {
//     width: "90%",
//     maxHeight: "80%",
//     backgroundColor: "#222222",
//     borderRadius: 12,
//     overflow: "hidden",
//   },
//   modalHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     padding: 15,
//     borderBottomWidth: 1,
//     borderBottomColor: "#333333",
//   },
//   modalTitle: {
//     fontSize: 18,
//     fontWeight: "bold",
//     color: "#FFFFFF",
//   },
//   modalScrollContent: {
//     padding: 15,
//   },
//   metricDetailRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginBottom: 15,
//     alignItems: "flex-start",
//   },
//   metricDetailLabel: {
//     fontSize: 14,
//     color: "#AAAAAA",
//     width: "40%",
//   },
//   metricDetailValue: {
//     fontSize: 14,
//     color: "#FFFFFF",
//     fontWeight: "500",
//     width: "60%",
//     textAlign: "right",
//   },
//   metricDetailSection: {
//     marginTop: 20,
//     marginBottom: 20,
//   },
//   metricDetailSectionTitle: {
//     fontSize: 16,
//     fontWeight: "bold",
//     color: "#FFFFFF",
//     marginBottom: 10,
//   },
//   metricDetailText: {
//     fontSize: 14,
//     color: "#f5f5f5",
//     lineHeight: 20,
//   },
// })
