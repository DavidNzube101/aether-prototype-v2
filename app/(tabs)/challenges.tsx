import { View, Text, StyleSheet } from "react-native"

export default function ChallengesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Challenges Screen</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000000",
  },
  text: {
    color: "#FFFFFF",
    fontSize: 18,
  },
})
