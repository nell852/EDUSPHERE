"use client"

import React from "react"
import { TouchableOpacity, StyleSheet, Animated } from "react-native"
import { MessageCircle } from "react-native-feather"
import { useChatbot } from "../context/ChatbotContext"
import ChatbotModal from "./ChatbotModal"
import { useTheme } from "../context/ThemeContext"

const ChatbotButton = () => {
  const { isOpen, openChatbot } = useChatbot()
  const { colors } = useTheme()
  const scaleAnim = React.useRef(new Animated.Value(1)).current

  React.useEffect(() => {
    const pulseAnimation = Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.2,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ])

    const intervalId = setInterval(() => {
      pulseAnimation.start()
    }, 3000)

    return () => clearInterval(intervalId)
  }, [])

  return (
    <>
      <Animated.View style={[styles.buttonContainer, { transform: [{ scale: scaleAnim }] }]}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.gold }]}
          onPress={openChatbot}
          activeOpacity={0.8}
        >
          <MessageCircle stroke="#FFFFFF" width={24} height={24} />
        </TouchableOpacity>
      </Animated.View>

      <ChatbotModal visible={isOpen} />
    </>
  )
}

const styles = StyleSheet.create({
  buttonContainer: {
    position: "absolute",
    bottom: 80,
    right: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
})

export default ChatbotButton
