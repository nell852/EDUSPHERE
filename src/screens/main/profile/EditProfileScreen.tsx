"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native"
import { useNavigation } from "@react-navigation/native"
import { useSupabase } from "../../../context/SupabaseContext"
import { useTheme } from "../../../context/ThemeContext"
import { useAuth } from "../../../context/AuthContext"
import { ChevronLeft, Camera, User, Mail, Calendar } from "react-native-feather"
import * as ImagePicker from "expo-image-picker"
import Input from "../../../components/common/Input"
import Button from "../../../components/common/Button"
import DateTimePicker from "@react-native-community/datetimepicker"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

const EditProfileScreen = () => {
  const navigation = useNavigation()
  const { supabase } = useSupabase()
  const { colors } = useTheme()
  const { user } = useAuth()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [birthDate, setBirthDate] = useState<Date | null>(null)
  const [gender, setGender] = useState<"male" | "female" | "other">("male")
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [errors, setErrors] = useState<{
    firstName?: string
    lastName?: string
    email?: string
  }>({})

  useEffect(() => {
    if (user) {
      fetchProfile()
    }
  }, [user])

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", user?.id).single()

      if (error) throw error

      setProfile(data)
      setFirstName(data.first_name || "")
      setLastName(data.last_name || "")
      setEmail(data.email || "")
      setBirthDate(data.birth_date ? new Date(data.birth_date) : null)
      setGender(data.gender || "male")
      setAvatarUrl(data.avatar_url)
    } catch (error) {
      console.error("Error fetching profile:", error)
      Alert.alert("Erreur", "Impossible de charger votre profil")
    } finally {
      setLoading(false)
    }
  }

  const validate = () => {
    const newErrors: {
      firstName?: string
      lastName?: string
      email?: string
    } = {}

    if (!firstName) newErrors.firstName = "Le prénom est requis"
    if (!lastName) newErrors.lastName = "Le nom est requis"

    if (!email) {
      newErrors.email = "L'email est requis"
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email invalide"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return

    setSaving(true)
    try {
      const updates = {
        first_name: firstName,
        last_name: lastName,
        email,
        birth_date: birthDate?.toISOString(),
        gender,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase.from("profiles").update(updates).eq("id", user?.id)

      if (error) throw error

      Alert.alert("Succès", "Votre profil a été mis à jour avec succès")
      navigation.goBack()
    } catch (error) {
      console.error("Error updating profile:", error)
      Alert.alert("Erreur", "Impossible de mettre à jour votre profil")
    } finally {
      setSaving(false)
    }
  }

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      })

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri
        const fileExt = uri.split(".").pop()
        const fileName = `${user?.id}-${Date.now()}.${fileExt}`
        const filePath = `avatars/${fileName}`

        // Upload image to Supabase Storage
        const formData = new FormData()
        formData.append("file", {
          uri,
          name: fileName,
          type: `image/${fileExt}`,
        } as any)

        const { data, error } = await supabase.storage.from("avatars").upload(filePath, formData)

        if (error) throw error

        // Get public URL
        const { data: publicUrlData } = supabase.storage.from("avatars").getPublicUrl(filePath)

        setAvatarUrl(publicUrlData.publicUrl)
      }
    } catch (error) {
      console.error("Error picking image:", error)
      Alert.alert("Erreur", "Impossible de sélectionner l'image")
    }
  }

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false)
    if (selectedDate) {
      setBirthDate(selectedDate)
    }
  }

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.gold} />
      </View>
    )
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft stroke={colors.text} width={24} height={24} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Modifier le profil</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.avatarContainer}>
          <Image
            source={avatarUrl ? { uri: avatarUrl } : require("../../../assets/icon.png")}
            style={styles.avatar}
          />
          <TouchableOpacity style={[styles.avatarEditButton, { backgroundColor: colors.gold }]} onPress={pickImage}>
            <Camera stroke="#FFFFFF" width={20} height={20} />
          </TouchableOpacity>
        </View>

        <View style={styles.formContainer}>
          <Input
            label="Prénom"
            value={firstName}
            onChangeText={setFirstName}
            placeholder="Entrez votre prénom"
            error={errors.firstName}
            leftIcon={<User stroke={colors.textSecondary} width={20} height={20} />}
          />

          <Input
            label="Nom"
            value={lastName}
            onChangeText={setLastName}
            placeholder="Entrez votre nom"
            error={errors.lastName}
            leftIcon={<User stroke={colors.textSecondary} width={20} height={20} />}
          />

          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="Entrez votre email"
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
            leftIcon={<Mail stroke={colors.textSecondary} width={20} height={20} />}
          />

          <Text style={[styles.label, { color: colors.text }]}>Date de naissance</Text>
          <TouchableOpacity
            style={[styles.datePickerButton, { borderColor: colors.border }]}
            onPress={() => setShowDatePicker(true)}
          >
            <Calendar stroke={colors.textSecondary} width={20} height={20} style={styles.dateIcon} />
            <Text style={[styles.dateText, { color: colors.text }]}>
              {birthDate ? format(birthDate, "dd MMMM yyyy", { locale: fr }) : "Sélectionner une date"}
            </Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={birthDate || new Date()}
              mode="date"
              display="default"
              onChange={handleDateChange}
              maximumDate={new Date()}
              minimumDate={new Date(1940, 0, 1)}
            />
          )}

          <Text style={[styles.label, { color: colors.text }]}>Genre</Text>
          <View style={styles.genderOptions}>
            <TouchableOpacity
              style={[
                styles.genderOption,
                {
                  backgroundColor: gender === "male" ? colors.gold : colors.card,
                  borderColor: gender === "male" ? colors.gold : colors.border,
                },
              ]}
              onPress={() => setGender("male")}
            >
              <Text
                style={[
                  styles.genderText,
                  {
                    color: gender === "male" ? "#FFFFFF" : colors.text,
                  },
                ]}
              >
                Homme
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.genderOption,
                {
                  backgroundColor: gender === "female" ? colors.gold : colors.card,
                  borderColor: gender === "female" ? colors.gold : colors.border,
                },
              ]}
              onPress={() => setGender("female")}
            >
              <Text
                style={[
                  styles.genderText,
                  {
                    color: gender === "female" ? "#FFFFFF" : colors.text,
                  },
                ]}
              >
                Femme
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.genderOption,
                {
                  backgroundColor: gender === "other" ? colors.gold : colors.card,
                  borderColor: gender === "other" ? colors.gold : colors.border,
                },
              ]}
              onPress={() => setGender("other")}
            >
              <Text
                style={[
                  styles.genderText,
                  {
                    color: gender === "other" ? "#FFFFFF" : colors.text,
                  },
                ]}
              >
                Autre
              </Text>
            </TouchableOpacity>
          </View>

          <Button
            title="Enregistrer les modifications"
            onPress={handleSave}
            loading={saving}
            style={{ backgroundColor: colors.gold, marginTop: 24 }}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
  scrollContent: {
    padding: 20,
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 24,
    position: "relative",
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  avatarEditButton: {
    position: "absolute",
    bottom: 0,
    right: "35%",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  formContainer: {
    width: "100%",
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
  },
  datePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    height: 50,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  dateIcon: {
    marginRight: 12,
  },
  dateText: {
    fontSize: 16,
  },
  genderOptions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  genderOption: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  genderText: {
    fontWeight: "500",
  },
})

// Add ActivityIndicator component
const ActivityIndicator = ({ size, color }) => {
  return (
    <View
      style={{
        width: size === "large" ? 36 : 24,
        height: size === "large" ? 36 : 24,
        borderRadius: size === "large" ? 18 : 12,
        borderWidth: 2,
        borderColor: color,
        borderTopColor: "transparent",
        transform: [{ rotate: "45deg" }],
      }}
    ></View>
  )
}

export default EditProfileScreen
