"use client"

import { useEffect, useRef } from "react"
import { View, StyleSheet, Animated, Easing } from "react-native"

interface LoadingBarProps {
  isLoading: boolean
  width?: number | string
  height?: number
  backgroundColor?: string
  foregroundColor?: string
  duration?: number
}

export default function LoadingBar({
  isLoading,
  width = "100%",
  height = 3,
  backgroundColor = "#222222",
  foregroundColor = "#FFFFFF",
  duration = 1500,
}: LoadingBarProps) {
  const translateX = useRef(new Animated.Value(-100)).current

  useEffect(() => {
    if (isLoading) {
      // Reset position
      translateX.setValue(-100)

      // Start animation
      Animated.loop(
        Animated.timing(translateX, {
          toValue: 100,
          duration,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ).start()
    } else {
      // Stop animation
      translateX.stopAnimation()
    }

    return () => {
      translateX.stopAnimation()
    }
  }, [isLoading, translateX, duration])

  if (!isLoading) return null

  return (
    <View style={[styles.container, { width, height, backgroundColor }]}>
      <Animated.View
        style={[
          styles.bar,
          {
            backgroundColor: foregroundColor,
            transform: [
              {
                translateX: translateX.interpolate({
                  inputRange: [-100, 100],
                  outputRange: ["-100%", "100%"],
                }),
              },
            ],
          },
        ]}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    borderRadius: 2,
  },
  bar: {
    width: "50%",
    height: "100%",
  },
})
