import type React from "react"
import { View, ActivityIndicator, Text, StyleSheet, Modal } from "react-native"

interface LoadingIndicatorProps {
  visible?: boolean
  text?: string
  size?: "small" | "large"
  color?: string
  overlay?: boolean
  backgroundColor?: string
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  visible = true,
  text = "Chargement...",
  size = "large",
  color = "#6366f1",
  overlay = false,
  backgroundColor = "rgba(0, 0, 0, 0.5)",
}) => {
  if (!visible) return null

  const LoadingContent = () => (
    <View style={[styles.container, overlay && styles.overlayContainer]}>
      <View style={styles.loadingBox}>
        <ActivityIndicator size={size} color={color} />
        {text && <Text style={styles.loadingText}>{text}</Text>}
      </View>
    </View>
  )

  if (overlay) {
    return (
      <Modal transparent visible={visible} animationType="fade">
        <LoadingContent />
      </Modal>
    )
  }

  return <LoadingContent />
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  overlayContainer: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  loadingBox: {
    backgroundColor: "#ffffff",
    padding: 30,
    borderRadius: 12,
    alignItems: "center",
    minWidth: 120,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: "#374151",
    textAlign: "center",
    fontWeight: "500",
  },
})

export default LoadingIndicator
