"use client"

import type React from "react"
import { createContext, useContext, useState } from "react"

interface ThemeColors {
  primary: string
  background: string
  card: string
  text: string
  textSecondary: string
  border: string
  notification: string
  gold: string
  goldLight: string
  error: string
  success: string
  warning: string
  info: string
}

interface ThemeContextType {
  isDark: boolean
  toggleTheme: () => void
  colors: ThemeColors
}

const lightColors: ThemeColors = {
  primary: "#FFFFFF",
  background: "#FFFFFF",
  card: "#F8F8F8",
  text: "#000000",
  textSecondary: "#666666",
  border: "#E0E0E0",
  notification: "#FF3B30",
  gold: "#DAA520",
  goldLight: "#F5DEB3",
  error: "#FF3B30",
  success: "#34C759",
  warning: "#FF9500",
  info: "#007AFF",
}

const darkColors: ThemeColors = {
  primary: "#1C1C1E",
  background: "#000000",
  card: "#121212",
  text: "#FFFFFF",
  textSecondary: "#ADADAD",
  border: "#2C2C2E",
  notification: "#FF453A",
  gold: "#FFD700",
  goldLight: "#806A00",
  error: "#FF453A",
  success: "#30D158",
  warning: "#FF9F0A",
  info: "#0A84FF",
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDark, setIsDark] = useState(false)

  const toggleTheme = () => {
    setIsDark(!isDark)
  }

  const colors = isDark ? darkColors : lightColors

  return <ThemeContext.Provider value={{ isDark, toggleTheme, colors }}>{children}</ThemeContext.Provider>
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
