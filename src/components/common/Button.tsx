"use client"

import type React from "react"
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  type ViewStyle,
  type TextStyle,
  type TouchableOpacityProps,
  View,
} from "react-native"
import { useTheme } from "../../context/ThemeContext"

interface ButtonProps extends TouchableOpacityProps {
  title: string
  onPress: () => void
  loading?: boolean
  disabled?: boolean
  variant?: "primary" | "secondary" | "outline"
  size?: "small" | "medium" | "large"
  style?: ViewStyle
  textStyle?: TextStyle
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = "primary",
  size = "medium",
  style,
  textStyle,
  leftIcon,
  rightIcon,
  ...props
}) => {
  const { colors } = useTheme()

  const getBackgroundColor = () => {
    if (disabled) return colors.textSecondary

    switch (variant) {
      case "primary":
        return colors.gold
      case "secondary":
        return colors.goldLight
      case "outline":
        return "transparent"
      default:
        return colors.gold
    }
  }

  const getBorderColor = () => {
    if (disabled) return colors.textSecondary

    switch (variant) {
      case "outline":
        return colors.gold
      default:
        return "transparent"
    }
  }

  const getTextColor = () => {
    if (disabled) return "#FFFFFF"

    switch (variant) {
      case "primary":
        return "#FFFFFF"
      case "secondary":
        return colors.text
      case "outline":
        return colors.gold
      default:
        return "#FFFFFF"
    }
  }

  const getButtonHeight = () => {
    switch (size) {
      case "small":
        return 36
      case "medium":
        return 48
      case "large":
        return 56
      default:
        return 48
    }
  }

  const getFontSize = () => {
    switch (size) {
      case "small":
        return 14
      case "medium":
        return 16
      case "large":
        return 18
      default:
        return 16
    }
  }

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          height: getButtonHeight(),
          borderWidth: variant === "outline" ? 2 : 0,
        },
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <>
          {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
          <Text
            style={[
              styles.text,
              {
                color: getTextColor(),
                fontSize: getFontSize(),
              },
              textStyle,
            ]}
          >
            {title}
          </Text>
          {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
        </>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    paddingHorizontal: 16,
  },
  text: {
    fontWeight: "600",
    textAlign: "center",
  },
  leftIcon: {
    marginRight: 8,
  },
  rightIcon: {
    marginLeft: 8,
  },
})

export default Button
