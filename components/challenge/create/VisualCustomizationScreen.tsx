"use client"

import { useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import * as ImagePicker from "expo-image-picker"

interface VisualCustomizationScreenProps {
  challengeData: any
  updateChallengeData: (data: any) => void
  onNext: () => void
}

export default function VisualCustomizationScreen({
  challengeData,
  updateChallengeData,
  onNext,
}: VisualCustomizationScreenProps) {
  const [bannerImage, setBannerImage] = useState(challengeData.bannerImage)
  const [iconImage, setIconImage] = useState(challengeData.iconImage)

  // Pick banner image
  const pickBannerImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    })

    if (!result.canceled) {
      setBannerImage(result.assets[0].uri)
    }
  }

  // Pick icon image
  const pickIconImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    })

    if (!result.canceled) {
      setIconImage(result.assets[0].uri)
    }
  }

  // Handle next button press
  const handleNext = () => {
    updateChallengeData({
      bannerImage,
      iconImage,
    })
    onNext()
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>Visual Customization</Text>
      <Text style={styles.subtitle}>Upload images to make your challenge stand out</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Banner Image</Text>
        <Text style={styles.sectionSubtitle}>
          This will be displayed at the top of your challenge card (16:9 ratio recommended)
        </Text>

        <TouchableOpacity style={styles.imageUploadContainer} onPress={pickBannerImage}>
          {bannerImage ? (
            <Image source={{ uri: bannerImage }} style={styles.bannerPreview} />
          ) : (
            <View style={styles.uploadPlaceholder}>
              <Ionicons name="image-outline" size={40} color="#CCCCCC" />
              <Text style={styles.uploadText}>Tap to upload banner</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Challenge Icon</Text>
        <Text style={styles.sectionSubtitle}>
          This will be displayed as your challenge's icon (1:1 ratio recommended)
        </Text>

        <TouchableOpacity style={styles.iconUploadContainer} onPress={pickIconImage}>
          {iconImage ? (
            <Image source={{ uri: iconImage }} style={styles.iconPreview} />
          ) : (
            <View style={styles.uploadPlaceholder}>
              <Ionicons name="image-outline" size={30} color="#CCCCCC" />
              <Text style={styles.uploadText}>Tap to upload icon</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
        <Text style={styles.nextButtonText}>Next</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#CCCCCC",
    marginBottom: 30,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 10,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#CCCCCC",
    marginBottom: 15,
  },
  imageUploadContainer: {
    backgroundColor: "#111111",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#222222",
    overflow: "hidden",
    height: 180,
  },
  bannerPreview: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  uploadPlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  uploadText: {
    color: "#CCCCCC",
    marginTop: 10,
    fontSize: 14,
  },
  iconUploadContainer: {
    backgroundColor: "#111111",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#222222",
    overflow: "hidden",
    height: 100,
    width: 100,
    alignSelf: "center",
  },
  iconPreview: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  nextButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 30,
    padding: 15,
    alignItems: "center",
    marginTop: 20,
  },
  nextButtonText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "bold",
  },
})
