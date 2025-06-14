"use client"

import { useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native"
import { useNavigation } from "@react-navigation/native"
import type { StackNavigationProp } from '@react-navigation/stack'
import { useAuth } from "../../context/AuthContext"
import { useTheme } from "../../context/ThemeContext"
import Input from "../../components/common/Input"
import Button from "../../components/common/Button"
import SocialLoginButton from "../../components/auth/SocialLoginButton"
import { Mail, Lock } from "react-native-feather"
type AuthStackParamList = {
  Login: undefined
  Register: undefined
  ForgotPassword: undefined
}

const LoginScreen = () => {
  const navigation = useNavigation<StackNavigationProp<AuthStackParamList>>()
  const { login, loginWithSocial, loading } = useAuth()
  const { colors } = useTheme()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {}

    if (!email) {
      newErrors.email = "L'email est requis"
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email invalide"
    }

    if (!password) {
      newErrors.password = "Le mot de passe est requis"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleLogin = async () => {
    if (validate()) {
      await login(email, password)
    }
  }

  const handleSocialLogin = async (provider: "google" | "facebook" | "github" | "apple") => {
    await loginWithSocial(provider)
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView
        contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logoContainer}>
          <Image source={require("../../assets/icon.png")} style={styles.logo} />
          <Text style={[styles.appName, { color: colors.text }]}>EduSphere</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={[styles.title, { color: colors.text }]}>Connexion</Text>

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

          <Input
            label="Mot de passe"
            value={password}
            onChangeText={setPassword}
            placeholder="Entrez votre mot de passe"
            secureTextEntry
            error={errors.password}
            leftIcon={<Lock stroke={colors.textSecondary} width={20} height={20} />}
          />

          <TouchableOpacity
            onPress={() => navigation.navigate("ForgotPassword")}
            style={styles.forgotPasswordContainer}
          >
            <Text style={[styles.forgotPasswordText, { color: colors.gold }]}>Mot de passe oublié ?</Text>
          </TouchableOpacity>

          <Button
            title="Se connecter"
            onPress={handleLogin}
            loading={loading}
            style={{ backgroundColor: colors.gold }}
          />

          <View style={styles.dividerContainer}>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <Text style={[styles.dividerText, { color: colors.textSecondary }]}>OU</Text>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
          </View>

          <View style={styles.socialButtonsContainer}>
            <SocialLoginButton provider="google" onPress={() => handleSocialLogin("google")} />
            <SocialLoginButton provider="facebook" onPress={() => handleSocialLogin("facebook")} />
            <SocialLoginButton provider="github" onPress={() => handleSocialLogin("github")} />
            {Platform.OS === "ios" && <SocialLoginButton provider="apple" onPress={() => handleSocialLogin("apple")} />}
          </View>
        </View>

        <View style={styles.footerContainer}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>Vous n'avez pas de compte ?</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Register")}>
            <Text style={[styles.footerLink, { color: colors.gold }]}>S'inscrire</Text>
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
    justifyContent: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: "contain",
  },
  appName: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 10,
  },
  formContainer: {
    width: "100%",
    maxWidth: 400,
    alignSelf: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 24,
    textAlign: "center",
  },
  forgotPasswordContainer: {
    alignSelf: "flex-end",
    marginBottom: 20,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: "500",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 10,
    fontSize: 14,
  },
  socialButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  footerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
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

export default LoginScreen
