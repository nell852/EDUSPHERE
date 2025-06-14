import type React from "react"
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"

interface CustomButtonProps {
  title: string
  onPress: () => void
  variant?: "primary" | "secondary" | "outline" | "danger" | "success"
  size?: "small" | "medium" | "large"
  disabled?: boolean
  loading?: boolean
  icon?: keyof typeof Ionicons.glyphMap
  iconPosition?: "left" | "right"
  fullWidth?: boolean
  style?: any
  textStyle?: any
}

const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  onPress,
  variant = "primary",
  size = "medium",
  disabled = false,
  loading = false,
  icon,
  iconPosition = "left",
  fullWidth = false,
  style,
  textStyle,
}) => {
  const getButtonStyle = () => {
    const baseStyle = [styles.button, styles[size]]

    if (fullWidth) {
      baseStyle.push(styles.fullWidth)
    }

    if (disabled || loading) {
      baseStyle.push(styles.disabled)
    } else {
      baseStyle.push(styles[variant])
    }

    return baseStyle
  }

  const getTextStyle = () => {
    const baseStyle = [styles.text, styles[`${size}Text`]]

    if (disabled || loading) {
      baseStyle.push(styles.disabledText)
    } else {
      baseStyle.push(styles[`${variant}Text`])
    }

    return baseStyle
  }

  const getIconColor = () => {
    if (disabled || loading) return "#9CA3AF"

    switch (variant) {
      case "primary":
      case "danger":
      case "success":
        return "#ffffff"
      case "secondary":
      case "outline":
        return "#6366f1"
      default:
        return "#ffffff"
    }
  }

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={getIconColor()} />
          <Text style={[getTextStyle(), { marginLeft: 8 }]}>Chargement...</Text>
        </View>
      )
    }

    return (
      <View style={styles.contentContainer}>
        {icon && iconPosition === "left" && (
          <Ionicons
            name={icon}
            size={size === "small" ? 16 : size === "large" ? 24 : 20}
            color={getIconColor()}
            style={styles.iconLeft}
          />
        )}
        <Text style={[getTextStyle(), textStyle]}>{title}</Text>
        {icon && iconPosition === "right" && (
          <Ionicons
            name={icon}
            size={size === "small" ? 16 : size === "large" ? 24 : 20}
            color={getIconColor()}
            style={styles.iconRight}
          />
        )}
      </View>
    )
  }

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {renderContent()}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },

  // Sizes
  small: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 36,
  },
  medium: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 44,
  },
  large: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    minHeight: 52,
  },

  // Variants
  primary: {
    backgroundColor: "#6366f1",
  },
  secondary: {
    backgroundColor: "#e5e7eb",
  },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#6366f1",
  },
  danger: {
    backgroundColor: "#ef4444",
  },
  success: {
    backgroundColor: "#10b981",
  },

  // Text styles
  text: {
    fontWeight: "600",
    textAlign: "center",
  },
  smallText: {
    fontSize: 14,
  },
  mediumText: {
    fontSize: 16,
  },
  largeText: {
    fontSize: 18,
  },

  // Text colors
  primaryText: {
    color: "#ffffff",
  },
  secondaryText: {
    color: "#374151",
  },
  outlineText: {
    color: "#6366f1",
  },
  dangerText: {
    color: "#ffffff",
  },
  successText: {
    color: "#ffffff",
  },

  // States
  disabled: {
    backgroundColor: "#f3f4f6",
    borderColor: "#e5e7eb",
  },
  disabledText: {
    color: "#9ca3af",
  },

  // Layout
  fullWidth: {
    width: "100%",
  },
  contentContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
})

export default CustomButton
