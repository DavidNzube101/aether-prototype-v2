
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from "@expo/vector-icons"

export default function MaxFitCard() {
  return (
    <View style={styles.mainCard}>
        
        <Ionicons name='sparkles-outline' size={60} color="#ffffff" ></Ionicons>
        <Text style={{ color: "#ffffff", fontSize: 60 }}>MaxFit</Text>

    </View>
  );
}

const styles = StyleSheet.create({
  mainCard: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",


  }
})