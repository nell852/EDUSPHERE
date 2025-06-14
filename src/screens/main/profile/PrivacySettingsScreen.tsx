"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView, Alert } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { useSupabase } from "../../../context/SupabaseContext"
import { useTheme } from "../../../context/ThemeContext"
import { useAuth } from "../../../context/AuthContext"
import { ChevronLeft, Shield, Eye, Lock, Bell } from "react-native-feather"

const PrivacySettingsScreen = () => {
  const navigation = useNavigation()
  const { supabase } = useSupabase()
  const { colors } = useTheme()
  const { user } = useAuth()

  const [loading, setLoading] = useState(true)
  const [settings, setSettings] = useState<PrivacySettings>({
  profileVisibility: "public", // public, connections, private
  showEmail: false,
  showSchool: true,
  activityTracking: true,
  allowNotifications: true,
  twoFactorAuth: false,
})

  

  useEffect(() => {
    if (user) {
      fetchPrivacySettings()
    }
  }, [user])

  const fetchPrivacySettings = async () => {
    try {
      // In a real app, you would fetch these settings from the database
      // For now, we'll use mock data
      setLoading(false)
    } catch (error) {
      console.error("Error fetching privacy settings:", error)
      setLoading(false)
    }
  }

interface PrivacySettings {
    profileVisibility: "public" | "connections" | "private"
    showEmail: boolean
    showSchool: boolean
    activityTracking: boolean
    allowNotifications: boolean
    twoFactorAuth: boolean
}

type PrivacySettingKey = keyof PrivacySettings

const updateSetting = async (key: PrivacySettingKey, value: PrivacySettings[PrivacySettingKey]) => {
    try {
        setSettings((prev: PrivacySettings) => ({ ...prev, [key]: value }))
        
        // In a real app, you would update these settings in the database
        // For now, we'll just show a success message
        
        // Example of how you might update settings in a real app:
        // const { error } = await supabase
        //   .from('user_settings')
        //   .update({ [key]: value })
        //   .eq('user_id', user.id)
        
        // if (error) throw error
    } catch (error) {
        console.error(`Error updating ${key}:`, error)
        Alert.alert("Erreur", "Impossible de mettre à jour les paramètres")
    }
}

  const handleProfileVisibilityChange = (value: "public" | "connections" | "private") => {
    updateSetting("profileVisibility", value)
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft stroke={colors.text} width={24} height={24} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Confidentialité et sécurité</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Shield stroke={colors.gold} width={20} height={20} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Visibilité du profil</Text>
          </View>

          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Qui peut voir mon profil ?</Text>
            
            <TouchableOpacity
              style={styles.option}
              onPress={() => handleProfileVisibilityChange("public")}
            >
              <View style={styles.radioContainer}>
                <View
                  style={[
                    styles.radioOuter,
                    { borderColor: colors.gold }
                  ]}
                >
                  {settings.profileVisibility === "public" && (
                    <View style={[styles.radioInner, { backgroundColor: colors.gold }]} />
                  )}
                </View>
                <Text style={[styles.optionText, { color: colors.text }]}>Tout le monde</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.option}
              onPress={() => handleProfileVisibilityChange("connections")}
            >
              <View style={styles.radioContainer}>
                <View
                  style={[
                    styles.radioOuter,
                    { borderColor: colors.gold }
                  ]}
                >
                  {settings.profileVisibility === "connections" && (
                    <View style={[styles.radioInner, { backgroundColor: colors.gold }]} />
                  )}
                </View>
                <Text style={[styles.optionText, { color: colors.text }]}>Mes collègues uniquement</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.option}
              onPress={() => handleProfileVisibilityChange("private")}
            >
              <View style={styles.radioContainer}>
                <View
                  style={[
                    styles.radioOuter,
                    { borderColor: colors.gold }
                  ]}
                >
                  {settings.profileVisibility === "private" && (
                    <View style={[styles.radioInner, { backgroundColor: colors.gold }]} />
                  )}
                </View>
                <Text style={[styles.optionText, { color: colors.text }]}>Personne</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Eye stroke={colors.gold} width={20} height={20} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Informations visibles</Text>
          </View>

          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <View style={styles.switchOption}>
              <Text style={[styles.switchText, { color: colors.text }]}>Afficher mon email</Text>
              <Switch
                value={settings.showEmail}
                onValueChange={(value) => updateSetting("showEmail", value)}
                trackColor={{ false: colors.border, true: colors.gold }}
                thumbColor="#FFFFFF"
              />
            </View>
            
            <View style={styles.switchOption}>
              <Text style={[styles.switchText, { color: colors.text }]}>Afficher mon école</Text>
              <Switch
                value={settings.showSchool}
                onValueChange={(value) => updateSetting("showSchool", value)}
                trackColor={{ false: colors.border, true: colors.gold }}
                thumbColor="#FFFFFF"
              />
            </View>
            
            <View style={styles.switchOption}>
              <Text style={[styles.switchText, { color: colors.text }]}>Suivi d'activité</Text>
              <Switch
                value={settings.activityTracking}
                onValueChange={(value) => updateSetting("activityTracking", value)}
                trackColor={{ false: colors.border, true: colors.gold }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Bell stroke={colors.gold} width={20} height={20} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Notifications</Text>
          </View>

          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <View style={styles.switchOption}>
              <Text style={[styles.switchText, { color: colors.text }]}>Autoriser les notifications</Text>
              <Switch
                value={settings.allowNotifications}
                onValueChange={(value) => updateSetting("allowNotifications", value)}
                trackColor={{ false: colors.border, true: colors.gold }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Lock stroke={colors.gold} width={20} height={20} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Sécurité</Text>
          </View>

          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <View style={styles.switchOption}>
              <Text style={[styles.switchText, { color: colors.text }]}>Authentification à deux facteurs</Text>
              <Switch
                value={settings.twoFactorAuth}
                onValueChange={(value) => updateSetting("twoFactorAuth", value)}
                trackColor={{ false: colors.border, true: colors.gold }}
                thumbColor="#FFFFFF"
              />
            </View>
            
            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.gold }]}
              onPress={() => Alert.alert("Changement de mot de passe", "Fonctionnalité à venir")}
            >
              <Text style={styles.buttonText}>Changer le mot de passe</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.dangerButton, { backgroundColor: colors.error }]}
          onPress={() => Alert.alert(
            "Supprimer le compte",
            "Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.",
            [
              { text: "Annuler", style: "cancel" },
              { text: "Supprimer", style: "destructive", onPress: () => {} }
            ]
          )}
        >
          <Text style={styles.dangerButtonText}>Supprimer mon compte</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 8,
  },
  card: {
    borderRadius: 12,
    padding: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 16,
  },
  option: {
    marginBottom: 12,
  },
  radioContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  optionText: {
    fontSize: 16,
  },
  switchOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  switchText: {
    fontSize: 16,
  },
  button: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  dangerButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 40,
  },
  dangerButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
})

export default PrivacySettingsScreen
