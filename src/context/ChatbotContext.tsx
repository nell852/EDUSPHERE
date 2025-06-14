"use client"

import type React from "react"
import { createContext, useContext, useState, useRef } from "react"
import { generateChatbotResponse } from "../services/aiService"

interface Message {
  id: string
  text: string
  sender: "user" | "bot"
  timestamp: Date
}

interface ChatbotContextType {
  messages: Message[]
  isOpen: boolean
  isLoading: boolean
  openChatbot: () => void
  closeChatbot: () => void
  sendMessage: (text: string) => Promise<void>
  clearMessages: () => void
}

const ChatbotContext = createContext<ChatbotContextType | undefined>(undefined)

export const ChatbotProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Bonjour ! Je suis votre assistant EduSphere. Comment puis-je vous aider aujourd'hui ?",
      sender: "bot",
      timestamp: new Date(),
    },
  ])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const messageIdCounter = useRef(2)

  const openChatbot = () => {
    setIsOpen(true)
  }

  const closeChatbot = () => {
    setIsOpen(false)
  }

  const sendMessage = async (text: string) => {
    if (!text.trim()) return

    const userMessage: Message = {
      id: messageIdCounter.current.toString(),
      text,
      sender: "user",
      timestamp: new Date(),
    }
    messageIdCounter.current += 1

    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)

    try {
      const response = await generateChatbotResponse(text)

      const botMessage: Message = {
        id: messageIdCounter.current.toString(),
        text: response,
        sender: "bot",
        timestamp: new Date(),
      }
      messageIdCounter.current += 1

      setMessages((prev) => [...prev, botMessage])
    } catch (error) {
      const errorMessage: Message = {
        id: messageIdCounter.current.toString(),
        text: "Désolé, je n'ai pas pu traiter votre demande. Veuillez réessayer.",
        sender: "bot",
        timestamp: new Date(),
      }
      messageIdCounter.current += 1

      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const clearMessages = () => {
    setMessages([
      {
        id: "1",
        text: "Bonjour ! Je suis votre assistant EduSphere. Comment puis-je vous aider aujourd'hui ?",
        sender: "bot",
        timestamp: new Date(),
      },
    ])
    messageIdCounter.current = 2
  }

  return (
    <ChatbotContext.Provider
      value={{
        messages,
        isOpen,
        isLoading,
        openChatbot,
        closeChatbot,
        sendMessage,
        clearMessages,
      }}
    >
      {children}
    </ChatbotContext.Provider>
  )
}

export const useChatbot = () => {
  const context = useContext(ChatbotContext)
  if (context === undefined) {
    throw new Error("useChatbot must be used within a ChatbotProvider")
  }
  return context
}
