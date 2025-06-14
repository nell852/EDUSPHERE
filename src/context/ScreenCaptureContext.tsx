"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { Platform, AppState, type AppStateStatus } from "react-native"
import { useSupabase } from "./SupabaseContext"
import { useAuth } from "./AuthContext"

interface ScreenCaptureContextType {
  isProtectionEnabled: boolean
  enableProtection: () => void
  disableProtection: () => void
  isScreenCaptured: boolean
}

const ScreenCaptureContext = createContext<ScreenCaptureContextType | undefined>(undefined)

export const ScreenCaptureProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isProtectionEnabled, setIsProtectionEnabled] = useState(false)
  const [isScreenCaptured, setIsScreenCaptured] = useState(false)
  const { supabase } = useSupabase()
  const { user } = useAuth()

  useEffect(() => {
    if (Platform.OS === "android") {
      // For Android, we can use FLAG_SECURE to prevent screenshots
      // This is handled in native code via a native module
      try {
        const NativeScreenProtection = require("../native/ScreenProtection").default

        if (isProtectionEnabled) {
          NativeScreenProtection.enableSecureMode()
        } else {
          NativeScreenProtection.disableSecureMode()
        }
      } catch (error) {
        console.error("Native screen protection module not available:", error)
      }
    } else if (Platform.OS === "ios") {
      // For iOS, we can detect screenshots but not prevent them
      const subscription = AppState.addEventListener("change", handleAppStateChange)

      return () => {
        subscription.remove()
      }
    }
  }, [isProtectionEnabled])

  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (nextAppState === "active" && Platform.OS === "ios") {
      // Check if a screenshot was taken while the app was in background
      try {
        const NativeScreenProtection = require("../native/ScreenProtection").default
        NativeScreenProtection.wasScreenCaptured((wasCaptured: boolean) => {
          if (wasCaptured && isProtectionEnabled) {
            setIsScreenCaptured(true)
            logScreenCaptureAttempt()

            // Reset after a short delay
            setTimeout(() => {
              setIsScreenCaptured(false)
            }, 3000)
          }
        })
      } catch (error) {
        console.error("Native screen protection module not available:", error)
      }
    }
  }

  const logScreenCaptureAttempt = async () => {
    if (user) {
      try {
        await supabase.from("security_logs").insert({
          user_id: user.id,
          event_type: "screen_capture_attempt",
          details: {
            platform: Platform.OS,
            device: Platform.OS === "ios" ? "iOS Device" : "Android Device",
          },
        })
      } catch (error) {
        console.error("Failed to log screen capture attempt:", error)
      }
    }
  }

  const enableProtection = () => {
    setIsProtectionEnabled(true)
  }

  const disableProtection = () => {
    setIsProtectionEnabled(false)
  }

  return (
    <ScreenCaptureContext.Provider
      value={{
        isProtectionEnabled,
        enableProtection,
        disableProtection,
        isScreenCaptured,
      }}
    >
      {children}
    </ScreenCaptureContext.Provider>
  )
}

export const useScreenCapture = () => {
  const context = useContext(ScreenCaptureContext)
  if (context === undefined) {
    throw new Error("useScreenCapture must be used within a ScreenCaptureProvider")
  }
  return context
}
