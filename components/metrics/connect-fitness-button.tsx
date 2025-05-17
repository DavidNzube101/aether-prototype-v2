import { TouchableOpacity, StyleSheet, Text, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useSafeAreaInsets } from "react-native-safe-area-context"

interface ConnectFitnessButtonProps {
  onPress: () => void
  isConnected: boolean
}

export default function ConnectFitnessButton({ onPress, isConnected }: ConnectFitnessButtonProps) {
  const insets = useSafeAreaInsets()

  return (
    <View style={[styles.container, { bottom: insets.bottom + 70 }]}>
      <TouchableOpacity
        style={[styles.button, isConnected ? styles.connectedButton : styles.disconnectedButton]}
        onPress={onPress}
      >
        <Ionicons
          name={isConnected ? "fitness" : "fitness-outline"}
          size={20}
          color={isConnected ? "#000000" : "#FFFFFF"}
          style={styles.icon}
        />
        <Text style={[styles.text, isConnected ? styles.connectedText : styles.disconnectedText]}>
          {isConnected ? "Fitness Connected" : "Connect Fitness"}
        </Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    alignSelf: "center",
    zIndex: 999,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  disconnectedButton: {
    backgroundColor: "#333333",
    borderWidth: 1,
    borderColor: "#FFFFFF",
  },
  connectedButton: {
    backgroundColor: "#34C759",
  },
  icon: {
    marginRight: 8,
  },
  text: {
    fontWeight: "600",
    fontSize: 14,
  },
  disconnectedText: {
    color: "#FFFFFF",
  },
  connectedText: {
    color: "#000000",
  },
})
