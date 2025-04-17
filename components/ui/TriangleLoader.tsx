"use client"

import { useEffect, useRef } from "react"
import { View, StyleSheet, Animated, Easing } from "react-native"

interface TriangleLoaderProps {
  isLoading: boolean
  size?: number
  color?: string
  backgroundColor?: string
  duration?: number
  strokeWidth?: number
}

export default function TriangleLoader({
  isLoading,
  size = 60,
  color = "#FFFFFF",
  backgroundColor = "#111111",
  duration = 1500,
  strokeWidth = 2,
}: TriangleLoaderProps) {
  // Animation value for rotation
  const rotateAnim = useRef(new Animated.Value(0)).current

  // Animation value for the moving dot
  const progressAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (isLoading) {
      // Rotation animation
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: duration * 2,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ).start()

      // Progress animation (dot moving around the triangle)
      Animated.loop(
        Animated.timing(progressAnim, {
          toValue: 1,
          duration: duration,
          easing: Easing.linear,
          useNativeDriver: false,
        }),
      ).start()
    } else {
      // Stop animations
      rotateAnim.stopAnimation()
      progressAnim.stopAnimation()
    }

    return () => {
      rotateAnim.stopAnimation()
      progressAnim.stopAnimation()
    }
  }, [isLoading, rotateAnim, progressAnim, duration])

  if (!isLoading) return null

  // Calculate triangle dimensions
  const triangleHeight = size * 0.866 // height of equilateral triangle (√3/2 * side)
  const halfSize = size / 2

  // Calculate triangle points
  const topPoint = { x: halfSize, y: 0 }
  const leftPoint = { x: 0, y: triangleHeight }
  const rightPoint = { x: size, y: triangleHeight }

  // Interpolate the dot position along the triangle perimeter
  const dotPosition = progressAnim.interpolate({
    inputRange: [0, 0.33, 0.66, 1],
    outputRange: [
      // Start at top point
      `${topPoint.x}px, ${topPoint.y}px`,
      // Move to right point
      `${rightPoint.x}px, ${rightPoint.y}px`,
      // Move to left point
      `${leftPoint.x}px, ${leftPoint.y}px`,
      // Back to top point
      `${topPoint.x}px, ${topPoint.y}px`,
    ],
  })

  // Rotation animation
  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  })

  return (
    <View style={[styles.container, { width: size, height: triangleHeight }]}>
      <Animated.View
        style={[
          styles.triangleContainer,
          {
            width: size,
            height: triangleHeight,
            transform: [{ rotate }],
          },
        ]}
      >
        {/* Triangle outline */}
        <View
          style={[
            styles.triangle,
            {
              borderBottomWidth: triangleHeight,
              borderLeftWidth: halfSize,
              borderRightWidth: halfSize,
              borderBottomColor: backgroundColor,
            },
          ]}
        />

        {/* Triangle border */}
        <View style={styles.triangleBorderContainer}>
          <View
            style={[
              styles.triangleBorder,
              {
                width: size,
                height: triangleHeight,
                borderWidth: strokeWidth,
                borderColor: color,
              },
            ]}
          />
        </View>

        {/* Moving dot */}
        <Animated.View
          style={[
            styles.dot,
            {
              width: strokeWidth * 3,
              height: strokeWidth * 3,
              borderRadius: strokeWidth * 1.5,
              backgroundColor: color,
              transform: [
                {
                  translateX: progressAnim.interpolate({
                    inputRange: [0, 0.33, 0.66, 1],
                    outputRange: [topPoint.x, rightPoint.x, leftPoint.x, topPoint.x],
                  }),
                },
                {
                  translateY: progressAnim.interpolate({
                    inputRange: [0, 0.33, 0.66, 1],
                    outputRange: [topPoint.y, rightPoint.y, leftPoint.y, topPoint.y],
                  }),
                },
              ],
            },
          ]}
        />
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
  triangleContainer: {
    position: "relative",
  },
  triangle: {
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    position: "absolute",
  },
  triangleBorderContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  triangleBorder: {
    position: "absolute",
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    // The actual border is drawn using the clip-path in the web version
    // For React Native, we're using a simplified approach
  },
  dot: {
    position: "absolute",
    zIndex: 10,
  },
})
