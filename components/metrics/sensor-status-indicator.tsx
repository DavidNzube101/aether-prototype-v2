import type React from "react"
import { View, Text, StyleSheet } from "react-native"
import { Activity, AlertCircle, CheckCircle } from "lucide-react-native"

type SensorStatus = "active" | "inactive" | "error"

interface SensorStatusIndicatorProps {
  status: SensorStatus
}

const SensorStatusIndicator: React.FC<SensorStatusIndicatorProps> = ({ status }) => {
  const getStatusIcon = () => {
    switch (status) {
      case "active":
        return <CheckCircle size={24} color="#34C759" />
      case "inactive":
        return <Activity size={24} color="#FF9500" />
      case "error":
        return <AlertCircle size={24} color="#FF3B30" />
    }
  }

  const getStatusText = () => {
    switch (status) {
      case "active":
        return "Sensors Active"
      case "inactive":
        return "Sensors Inactive"
      case "error":
        return "Sensor Error"
    }
  }

  const getStatusDescription = () => {
    switch (status) {
      case "active":
        return "Your fitness metrics are being tracked in real-time."
      case "inactive":
        return "Tap to start tracking your fitness metrics."
      case "error":
        return "There was an error accessing your device sensors. Please check permissions."
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {getStatusIcon()}
        <Text style={styles.title}>{getStatusText()}</Text>
      </View>
      <Text style={styles.description}>{getStatusDescription()}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginLeft: 8,
  },
  description: {
    fontSize: 14,
    color: "#CCCCCC",
    marginLeft: 32,
  },
})

export default SensorStatusIndicator
