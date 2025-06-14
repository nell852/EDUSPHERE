"use client"

import "react-native-gesture-handler"
import { useEffect, useState } from "react"
import { NavigationContainer } from "@react-navigation/native"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { StatusBar } from "react-native"
import { ThemeProvider } from "./src/context/ThemeContext"
import { AuthProvider } from "./src/context/AuthContext"
import { ChatbotProvider } from "./src/context/ChatbotContext"
import { SupabaseProvider } from "./src/context/SupabaseContext"
import RootNavigator from "./src/navigation/RootNavigator"
import SplashScreen from "./src/screens/SplashScreen"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { ScreenCaptureProvider } from "./src/context/ScreenCaptureContext"

export default function App() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate splash screen loading time
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return <SplashScreen />
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SupabaseProvider>
          <AuthProvider>
            <ThemeProvider>
              <ScreenCaptureProvider>
                <ChatbotProvider>
                  <NavigationContainer>
                    <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
                    <RootNavigator />
                  </NavigationContainer>
                </ChatbotProvider>
              </ScreenCaptureProvider>
            </ThemeProvider>
          </AuthProvider>
        </SupabaseProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}
