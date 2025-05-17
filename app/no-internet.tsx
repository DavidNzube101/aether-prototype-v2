// app/no-internet.tsx
import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { useRouter } from 'expo-router';

export default function NoInternetScreen() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>😞 No Internet Connection</Text>
      <Text style={styles.subtitle}>
        Please check your network settings.
      </Text>
      <Button
        title="Try Again"
        onPress={() => router.replace('/')} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
});
