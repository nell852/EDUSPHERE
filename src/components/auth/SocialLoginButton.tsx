"use client"

import type React from "react"
import { TouchableOpacity, StyleSheet, Image } from "react-native"
import { useTheme } from "../../context/ThemeContext"

interface SocialLoginButtonProps {
  provider: "google" | "facebook" | "github" | "apple"
  onPress: () => void
}

const SocialLoginButton: React.FC<SocialLoginButtonProps> = ({ provider, onPress }) => {
  const { colors, isDark } = useTheme()

  const getIcon = () => {
    switch (provider) {
      case "google":
        return require("../../assets/social/google.png")
      case "facebook":
        return require("../../assets/social/facebook.png")
      case "github":
        return isDark
          ? require("../../assets/social/github-light.png")
          : require("../../assets/social/github-dark.png")
      case "apple":
        return isDark
          ? require("../../assets/social/apple-light.jpeg")
          : require("../../assets/social/apple-dark.jpeg")
      default:
        return require("../../assets/social/google.png")
    }
  }

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: colors.background,
          borderColor: colors.border,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Image source={getIcon()} style={styles.icon} />
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  icon: {
    width: 24,
    height: 24,
    resizeMode: "contain",
  },
})

export default SocialLoginButton
