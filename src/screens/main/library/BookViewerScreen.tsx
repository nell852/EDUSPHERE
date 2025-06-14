"use client"

import { useState, useEffect } from "react"
import { View, StyleSheet, ActivityIndicator, TouchableOpacity, Text, Alert } from "react-native"
import { useRoute, useNavigation } from "@react-navigation/native"
import { WebView } from "react-native-webview"
import { useTheme } from "../../../context/ThemeContext"
import { useSupabase } from "../../../context/SupabaseContext"
import { useAuth } from "../../../context/AuthContext"
import { useScreenCapture } from "../../../context/ScreenCaptureContext"
import { ChevronLeft, AlertTriangle } from "react-native-feather"

const BookViewerScreen = () => {
  const route = useRoute()
  const navigation = useNavigation()
  const { colors } = useTheme()
  const { supabase } = useSupabase()
  const { user } = useAuth()
  const { isScreenCaptured } = useScreenCapture()

  const [loading, setLoading] = useState(true)
  const [book, setBook] = useState<any>(null)

  const { bookId, fileUrl } = route.params as { bookId: string; fileUrl: string }

  useEffect(() => {
    fetchBookDetails()
    logViewActivity()
  }, [])

  const fetchBookDetails = async () => {
    try {
      const { data, error } = await supabase.from("books").select("*").eq("id", bookId).single()

      if (error) throw error
      setBook(data)
    } catch (error) {
      console.error("Error fetching book details:", error)
      Alert.alert("Erreur", "Impossible de charger les détails du livre")
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
          resource_type: "book",
          resource_id: bookId,
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
          <Text style={[styles.errorText, { color: colors.text }]}>Aucun fichier disponible pour ce livre</Text>
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
      {/* Screen capture warning */}
      {isScreenCaptured && (
        <View style={[styles.captureWarning, { backgroundColor: colors.error }]}>
          <AlertTriangle stroke="#FFFFFF" width={20} height={20} />
          <Text style={styles.captureWarningText}>
            Capture d'écran détectée ! Le contenu est protégé par des droits d'auteur.
          </Text>
        </View>
      )}

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft stroke={colors.text} width={24} height={24} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
          {book?.title || "Visualiseur"}
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
  captureWarning: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    paddingHorizontal: 16,
  },
  captureWarningText: {
    color: "#FFFFFF",
    marginLeft: 8,
    fontSize: 12,
    fontWeight: "500",
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

export default BookViewerScreen
