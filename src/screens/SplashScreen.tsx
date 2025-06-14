"use client"

import { useEffect, useRef } from "react"
import { View, StyleSheet, Animated, Easing, Image } from "react-native"
import LottieView from "lottie-react-native"
import { schoolLogos } from "../constants/schoolLogos"

const SplashScreen = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current
  const scaleAnim = useRef(new Animated.Value(0.8)).current
  const rotateAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    // Fade in main logo
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start()

    // Scale up main logo
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start()

    // Rotate animation for school logos
    Animated.timing(rotateAnim, {
      toValue: 1,
      duration: 2000,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start()
  }, [])

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  })

  return (
    <View style={styles.container}>
      {/* Main logo */}
      <Animated.Image
        source={require('../assets/CDP-logo-dore-PNG-1536x658.png')}
        style={[
          styles.mainLogo,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      />

      {/* School logos animation */}
      <View style={styles.schoolLogosContainer}>
        {schoolLogos.map((logo, index) => {
          const angle = (index * 2 * Math.PI) / schoolLogos.length
          const radius = 120

          return (
            <Animated.View
              key={index}
              style={[
                styles.schoolLogo,
                {
                  transform: [
                    {
                      translateX: rotateAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, radius * Math.cos(angle)],
                      }),
                    },
                    {
                      translateY: rotateAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, radius * Math.sin(angle)],
                      }),
                    },
                    {
                      scale: rotateAnim.interpolate({
                        inputRange: [0, 0.5, 1],
                        outputRange: [0, 1.2, 1],
                      }),
                    },
                  ],
                  opacity: rotateAnim,
                },
              ]}
            >
              <Image source={logo} style={styles.schoolLogoImage} />
            </Animated.View>
          )
        })}
      </View>

      {/* Gold accent animation */}
      <LottieView
        source={require('../assets/animations/gold-sparkle.json')}
        autoPlay
        loop
        style={styles.lottieAnimation}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  mainLogo: {
    width: 150,
    height: 150,
    resizeMode: "contain",
  },
  schoolLogosContainer: {
    position: "absolute",
    width: 300,
    height: 300,
    alignItems: "center",
    justifyContent: "center",
  },
  schoolLogo: {
    position: "absolute",
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  schoolLogoImage: {
    width: 40,
    height: 40,
    resizeMode: "contain",
  },
  lottieAnimation: {
    position: "absolute",
    width: 400,
    height: 400,
  },
})

export default SplashScreen
