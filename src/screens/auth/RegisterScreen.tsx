"use client"

import { useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { useAuth } from "../../context/AuthContext"
import { useTheme } from "../../context/ThemeContext"
import Input from "../../components/common/Input"
import Button from "../../components/common/Button"
import { Mail, Lock, User, Calendar, ChevronLeft } from "react-native-feather"
import DateTimePicker from "@react-native-community/datetimepicker"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

const RegisterScreen = () => {
  const navigation = useNavigation()
  const { register, loading } = useAuth()
  const { colors } = useTheme()

  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [birthDate, setBirthDate] = useState(new Date(2000, 0, 1))
  const [gender, setGender] = useState<"male" | "female" | "other">("male")
  const [showDatePicker, setShowDatePicker] = useState(false)

  const [errors, setErrors] = useState<{
    firstName?: string
    lastName?: string
    email?: string
    password?: string
    confirmPassword?: string
  }>({})

  const validate = () => {
    const newErrors: {
      firstName?: string
      lastName?: string
      email?: string
      password?: string
      confirmPassword?: string
    } = {}

    if (!firstName) newErrors.firstName = "Le prénom est requis"
    if (!lastName) newErrors.lastName = "Le nom est requis"

    if (!email) {
      newErrors.email = "L'email est requis"
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email invalide"
    }

    if (!password) {
      newErrors.password = "Le mot de passe est requis"
    } else if (password.length < 8) {
      newErrors.password = "Le mot de passe doit contenir au moins 8 caractères"
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Les mots de passe ne correspondent pas"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleRegister = async () => {
    if (validate()) {
      await register(email, password, {
        firstName,
        lastName,
        birthDate: birthDate.toISOString(),
        gender,
      })
    }
  }

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false)
    if (selectedDate) {
      setBirthDate(selectedDate)
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView
        contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ChevronLeft stroke={colors.text} width={24} height={24} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>Inscription</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.formContainer}>
          <View style={styles.nameContainer}>
            <View style={styles.nameField}>
              <Input
                label="Prénom"
                value={firstName}
                onChangeText={setFirstName}
                placeholder="Prénom"
                error={errors.firstName}
                leftIcon={<User stroke={colors.textSecondary} width={20} height={20} />}
              />
            </View>
            <View style={styles.nameField}>
              <Input
                label="Nom"
                value={lastName}
                onChangeText={setLastName}
                placeholder="Nom"
                error={errors.lastName}
                leftIcon={<User stroke={colors.textSecondary} width={20} height={20} />}
              />
            </View>
          </View>

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

          <TouchableOpacity
            style={[styles.datePickerButton, { borderColor: colors.border }]}
            onPress={() => setShowDatePicker(true)}
          >
            <Calendar stroke={colors.textSecondary} width={20} height={20} style={styles.dateIcon} />
            <Text style={[styles.dateText, { color: colors.text }]}>
              {format(birthDate, "dd MMMM yyyy", { locale: fr })}
            </Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={birthDate}
              mode="date"
              display="default"
              onChange={handleDateChange}
              maximumDate={new Date()}
              minimumDate={new Date(1940, 0, 1)}
            />
          )}

          <View style={styles.genderContainer}>
            <Text style={[styles.genderLabel, { color: colors.text }]}>Genre</Text>
            <View style={styles.genderOptions}>
              <TouchableOpacity
                style={[
                  styles.genderOption,
                  {
                    backgroundColor: gender === "male" ? colors.gold : colors.background,
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
                    backgroundColor: gender === "female" ? colors.gold : colors.background,
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
                    backgroundColor: gender === "other" ? colors.gold : colors.background,
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
          </View>

          <Input
            label="Mot de passe"
            value={password}
            onChangeText={setPassword}
            placeholder="Entrez votre mot de passe"
            secureTextEntry
            error={errors.password}
            leftIcon={<Lock stroke={colors.textSecondary} width={20} height={20} />}
          />

          <Input
            label="Confirmer le mot de passe"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirmez votre mot de passe"
            secureTextEntry
            error={errors.confirmPassword}
            leftIcon={<Lock stroke={colors.textSecondary} width={20} height={20} />}
          />

          <Button
            title="S'inscrire"
            onPress={handleRegister}
            loading={loading}
            style={{ backgroundColor: colors.gold, marginTop: 16 }}
          />
        </View>

        <View style={styles.footerContainer}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>Vous avez déjà un compte ?</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text style={[styles.footerLink, { color: colors.gold }]}>Se connecter</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
  },
  formContainer: {
    width: "100%",
    maxWidth: 400,
    alignSelf: "center",
  },
  nameContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  nameField: {
    flex: 1,
    marginRight: 8,
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
  genderContainer: {
    marginBottom: 16,
  },
  genderLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
  },
  genderOptions: {
    flexDirection: "row",
    justifyContent: "space-between",
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
  footerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
  footerText: {
    fontSize: 14,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 5,
  },
})

export default RegisterScreen
