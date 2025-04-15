import { View, Text, StyleSheet } from "react-native"

export default function Page() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>This is the main entry point.</Text>
      {/* You can render any component here for testing purposes. */}
      {/* <HomeScreen /> */}
      {/* <ExploreScreen /> */}
      {/* <ChallengesScreen /> */}
      {/* <ProfileScreen /> */}
      {/* <Onboarding /> */}
      {/* <Login /> */}
      {/* <SignUp /> */}
      {/* <Index /> */}
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
