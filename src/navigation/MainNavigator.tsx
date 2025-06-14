"use client"

import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { View, StyleSheet } from "react-native"
import { Home, Book, FileText, Users, User } from "react-native-feather"
import HomeScreen from "../screens/main/HomeScreen"
import LibraryNavigator from "./LibraryNavigator"
import ExamBankNavigator from "./ExamBankNavigator"
import CommunityNavigator from "./CommunityNavigator"
import ProfileNavigator from "./ProfileNavigator"
import ChatbotButton from "../components/ChatbotButton"
import { useTheme } from "../context/ThemeContext"

const Tab = createBottomTabNavigator()

const MainNavigator = () => {
  const { colors } = useTheme()

  return (
    <View style={styles.container}>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: colors.background,
            borderTopColor: colors.border,
            height: 60,
            paddingBottom: 10,
          },
          tabBarActiveTintColor: colors.gold,
          tabBarInactiveTintColor: colors.textSecondary,
          tabBarShowLabel: true,
        }}
      >
        <Tab.Screen
          name="HomeTab"
          component={HomeScreen}
          options={{
            tabBarLabel: "Accueil",
            tabBarIcon: ({ color, size }) => <Home stroke={color} width={size} height={size} />,
          }}
        />
        <Tab.Screen
          name="LibraryTab"
          component={LibraryNavigator}
          options={{
            tabBarLabel: "Bibliothèque",
            tabBarIcon: ({ color, size }) => <Book stroke={color} width={size} height={size} />,
          }}
        />
        <Tab.Screen
          name="ExamBankTab"
          component={ExamBankNavigator}
          options={{
            tabBarLabel: "Épreuves",
            tabBarIcon: ({ color, size }) => <FileText stroke={color} width={size} height={size} />,
          }}
        />
        <Tab.Screen
          name="CommunityTab"
          component={CommunityNavigator}
          options={{
            tabBarLabel: "Communauté",
            tabBarIcon: ({ color, size }) => <Users stroke={color} width={size} height={size} />,
          }}
        />
        <Tab.Screen
          name="ProfileTab"
          component={ProfileNavigator}
          options={{
            tabBarLabel: "Profil",
            tabBarIcon: ({ color, size }) => <User stroke={color} width={size} height={size} />,
          }}
        />
      </Tab.Navigator>

      {/* Floating Chatbot Button */}
      <ChatbotButton />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
})

export default MainNavigator
