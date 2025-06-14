"use client"

import { useState, useRef, useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Keyboard, Alert } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { useAuth } from "../../context/AuthContext"
import { useTheme } from "../../context/ThemeContext"
import Button from "../../components/common/Button"
import { ChevronLeft } from "react-native-feather"

const VerifyMatriculeScreen = () => {
  const navigation = useNavigation()
  const { verifyMatricule, loading } = useAuth()
  const { colors } = useTheme()

  const [matricule, setMatricule] = useState(["", "", "", "", "", ""])
  const inputRefs = useRef<Array<TextInput | null>>([])

  useEffect(() => {
    // Focus the first input when the screen mounts
    setTimeout(() => {
      inputRefs.current[0]?.focus()
    }, 100)
  }, [])

  const handleChangeText = (text: string, index: number) => {
    if (text.length > 1) {
      // Handle paste of multiple characters
      const chars = text.split("")
      const newMatricule = [...matricule]

      for (let i = 0; i < chars.length && index + i < matricule.length; i++) {
        newMatricule[index + i] = chars[i]
      }

      setMatricule(newMatricule)

      // Focus the next input after the last pasted character
      const nextIndex = Math.min(index + chars.length, matricule.length - 1)
      inputRefs.current[nextIndex]?.focus()
    } else {
      // Handle single character input
      const newMatricule = [...matricule]
      newMatricule[index] = text
      setMatricule(newMatricule)

      if (text !== "" && index < matricule.length - 1) {
        inputRefs.current[index + 1]?.focus()
      }
    }
  }

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && matricule[index] === "" && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleVerify = async () => {
    const matriculeString = matricule.join("")
    if (matriculeString.length !== 6) {
      Alert.alert("Erreur", "Veuillez entrer un matricule valide à 6 caractères.")
      return
    }

    const isValid = await verifyMatricule(matriculeString)
    if (isValid) {
      Alert.alert("Succès", "Votre matricule a été vérifié avec succès.")
      navigation.goBack()
    } else {
      Alert.alert("Erreur", "Le matricule entré est invalide. Veuillez réessayer.")
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft stroke={colors.text} width={24} height={24} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>Vérification du matricule</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Veuillez entrer le matricule à 6 caractères qui vous a été envoyé par email.
        </Text>

        <View style={styles.matriculeContainer}>
          {matricule.map((digit, index) => (
  <TextInput
    key={index}
    ref={(ref) => {
      inputRefs.current[index] = ref
    }}
    style={[
      styles.digitInput,
      {
        backgroundColor: colors.card,
        borderColor: colors.border,
        color: colors.text,
      },
    ]}
    value={digit}
    onChangeText={(text) => handleChangeText(text, index)}
    onKeyPress={(e) => handleKeyPress(e, index)}
    maxLength={1}
    keyboardType="default"
    autoCapitalize="characters"
    selectTextOnFocus
    onSubmitEditing={() => {
      if (index < matricule.length - 1) {
        inputRefs.current[index + 1]?.focus()
      } else {
        Keyboard.dismiss()
      }
    }}
  />
))}
        </View>

        <Button
          title="Vérifier"
          onPress={handleVerify}
          loading={loading}
          style={{ backgroundColor: colors.gold, marginTop: 32 }}
        />

        <TouchableOpacity style={styles.resendContainer}>
          <Text style={[styles.resendText, { color: colors.textSecondary }]}>Vous n'avez pas reçu de matricule ? </Text>
          <Text style={[styles.resendLink, { color: colors.gold }]}>Renvoyer</Text>
        </TouchableOpacity>
      </View>
    </View>
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
  matriculeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 24,
  },
  digitInput: {
    width: 50,
    height: 60,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
  resendContainer: {
    flexDirection: "row",
    marginTop: 24,
  },
  resendText: {
    fontSize: 14,
  },
  resendLink: {
    fontSize: 14,
    fontWeight: "600",
  },
})

export default VerifyMatriculeScreen
