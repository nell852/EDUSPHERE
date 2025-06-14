"use client"

import { useState } from "react"
import type React from "react"
import { useRef, useEffect } from "react"
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native"
import { X, Send } from "react-native-feather"
import { useChatbot } from "../context/ChatbotContext"
import { useTheme } from "../context/ThemeContext"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"

interface ChatbotModalProps {
  visible: boolean
}

const ChatbotModal: React.FC<ChatbotModalProps> = ({ visible }) => {
  const { messages, closeChatbot, sendMessage, isLoading } = useChatbot()
  const { colors } = useTheme()
  const [inputText, setInputText] = useState("")
  const flatListRef = useRef<FlatList>(null)
  const inputRef = useRef<TextInput>(null)

  useEffect(() => {
    if (visible && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true })
      }, 100)
    }
  }, [visible, messages])

  const handleSend = () => {
    if (inputText.trim() && !isLoading) {
      sendMessage(inputText)
      setInputText("")
    }
  }

  const renderMessageItem = ({ item }: { item: any }) => {
    const isBot = item.sender === "bot"

    return (
      <View style={[styles.messageContainer, isBot ? styles.botMessageContainer : styles.userMessageContainer]}>
        <View
          style={[
            styles.messageBubble,
            isBot
              ? [styles.botMessageBubble, { backgroundColor: colors.card }]
              : [styles.userMessageBubble, { backgroundColor: colors.gold }],
          ]}
        >
          <Text style={[styles.messageText, isBot ? { color: colors.text } : { color: "#FFFFFF" }]}>{item.text}</Text>
        </View>
        <Text style={[styles.timestamp, { color: colors.textSecondary }]}>
          {formatDistanceToNow(new Date(item.timestamp), {
            addSuffix: true,
            locale: fr,
          })}
        </Text>
      </View>
    )
  }

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={closeChatbot}>
      <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.gold }]}>
          <Text style={styles.headerTitle}>Assistant EduSphere</Text>
          <TouchableOpacity onPress={closeChatbot} style={styles.closeButton}>
            <X stroke="#FFFFFF" width={24} height={24} />
          </TouchableOpacity>
        </View>

        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessageItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesContainer}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
        >
          <View style={[styles.inputContainer, { backgroundColor: colors.card }]}>
            <TextInput
              ref={inputRef}
              style={[styles.input, { color: colors.text, backgroundColor: colors.background }]}
              placeholder="Posez votre question..."
              placeholderTextColor={colors.textSecondary}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
              editable={!isLoading}
            />
            <TouchableOpacity
              onPress={handleSend}
              style={[
                styles.sendButton,
                { backgroundColor: colors.gold, opacity: isLoading || !inputText.trim() ? 0.5 : 1 },
              ]}
              disabled={isLoading || !inputText.trim()}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Send stroke="#FFFFFF" width={20} height={20} />
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  closeButton: {
    padding: 4,
  },
  messagesContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  messageContainer: {
    marginBottom: 16,
    maxWidth: "80%",
  },
  botMessageContainer: {
    alignSelf: "flex-start",
  },
  userMessageContainer: {
    alignSelf: "flex-end",
  },
  messageBubble: {
    borderRadius: 16,
    padding: 12,
  },
  botMessageBubble: {
    borderBottomLeftRadius: 4,
  },
  userMessageBubble: {
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  timestamp: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#E0E0E0",
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    maxHeight: 120,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
})

export default ChatbotModal
