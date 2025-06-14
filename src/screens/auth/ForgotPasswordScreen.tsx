"use client"

import { useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, Image, KeyboardAvoidingView, Platform } from "react-native"
import { useNavigation } from "@react-navigation/native"
import type { StackNavigationProp } from "@react-navigation/stack"
import { useAuth } from "../../context/AuthContext"
import { useTheme } from "../../context/ThemeContext"
import Input from "../../components/common/Input"
import Button from "../../components/common/Button"
import { Mail, ChevronLeft } from "react-native-feather"
type AuthStackParamList = {
  Login: undefined
  // add other routes if needed
}

const ForgotPasswordScreen = () => {
  const navigation = useNavigation<StackNavigationProp<AuthStackParamList>>()
  const { forgotPassword, loading } = useAuth()
  const { colors } = useTheme()

  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)

  const validate = () => {
    if (!email) {
      setError("L'email est requis")
      return false
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Email invalide")
      return false
    }
    setError("")
    return true
  }

  const handleSubmit = async () => {
    if (validate()) {
      await forgotPassword(email)
      setIsSubmitted(true)
    }
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
      </View>

      <View style={styles.content}>
        <Image source={require("../../assets/icon.png")} style={styles.image} />

        <Text style={[styles.title, { color: colors.text }]}>Mot de passe oublié ?</Text>

        {!isSubmitted ? (
          <>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
            </Text>

            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="Entrez votre email"
              keyboardType="email-address"
              autoCapitalize="none"
              error={error}
              leftIcon={<Mail stroke={colors.textSecondary} width={20} height={20} />}
            />

            <Button
              title="Envoyer le lien"
              onPress={handleSubmit}
              loading={loading}
              style={{ backgroundColor: colors.gold, marginTop: 16 }}
            />
          </>
        ) : (
          <>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Un email a été envoyé à {email} avec les instructions pour réinitialiser votre mot de passe.
            </Text>

            <Button
              title="Retour à la connexion"
              onPress={() => navigation.navigate("Login")}
              style={{ backgroundColor: colors.gold, marginTop: 24 }}
            />
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  backButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    maxWidth: 400,
    alignSelf: "center",
    width: "100%",
  },
  image: {
    width: 200,
    height: 200,
    resizeMode: "contain",
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 24,
  },
})

export default ForgotPasswordScreen
