"use client"

import { useState, useEffect } from "react"
import { View, StyleSheet, ActivityIndicator, TouchableOpacity, Text, Alert } from "react-native"
import { useRoute, useNavigation } from "@react-navigation/native"
import { WebView } from "react-native-webview"
import { useTheme } from "../../../context/ThemeContext"
import { useSupabase } from "../../../context/SupabaseContext"
import { useAuth } from "../../../context/AuthContext"
import { ChevronLeft } from "react-native-feather"

const ExamViewerScreen = () => {
  const route = useRoute()
  const navigation = useNavigation()
  const { colors } = useTheme()
  const { supabase } = useSupabase()
  const { user } = useAuth()

  const [loading, setLoading] = useState(true)
  const [exam, setExam] = useState<any>(null)

  const { examId, fileUrl } = route.params as { examId: string; fileUrl: string }

  useEffect(() => {
    fetchExamDetails()
    logViewActivity()
  }, [])

  const fetchExamDetails = async () => {
    try {
      const { data, error } = await supabase.from("exams").select("*").eq("id", examId).single()

      if (error) throw error
      setExam(data)
    } catch (error) {
      console.error("Error fetching exam details:", error)
      Alert.alert("Erreur", "Impossible de charger les détails de l'épreuve")
    } finally {
      setLoading(false)
    }
  }

  const logViewActivity = async () => {
    if (user) {
      try {
        await supabase.from("user_history").insert({
          user_id: user.id,
          activity_type: "view",
          resource_type: "exam",
          resource_id: examId,
        })
      } catch (error) {
        console.error("Error logging view activity:", error)
      }
    }
  }

  const renderPdfViewer = () => {
    if (!fileUrl) {
      return (
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.text }]}>Aucun fichier disponible pour cette épreuve</Text>
        </View>
      )
    }

    // Check if the file is a PDF
    const isPdf = fileUrl.toLowerCase().endsWith(".pdf")

    if (isPdf) {
      return (
        <WebView
          source={{ uri: fileUrl }}
          style={styles.webView}
          onLoadEnd={() => setLoading(false)}
          onError={() => {
            setLoading(false)
            Alert.alert("Erreur", "Impossible de charger le fichier")
          }}
        />
      )
    } else {
      // For other file types, display a message
      return (
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.text }]}>
            Ce type de fichier n'est pas pris en charge pour la visualisation
          </Text>
        </View>
      )
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft stroke={colors.text} width={24} height={24} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
          {exam?.title || "Visualiseur"}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {/* PDF Viewer */}
      <View style={styles.viewerContainer}>
        {renderPdfViewer()}
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={colors.gold} />
          </View>
        )}
      </View>
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
    fontSize: 18,
    fontWeight: "600",
    flex: 1,
    textAlign: "center",
  },
  viewerContainer: {
    flex: 1,
    position: "relative",
  },
  webView: {
    flex: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: "center",
  },
})

export default ExamViewerScreen
