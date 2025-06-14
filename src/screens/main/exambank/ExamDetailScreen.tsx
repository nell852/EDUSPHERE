"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from "react-native"
import { useRoute, useNavigation, NavigationProp } from "@react-navigation/native"
import { useSupabase } from "../../../context/SupabaseContext"
import { useTheme } from "../../../context/ThemeContext"
import { useAuth } from "../../../context/AuthContext"
import { ChevronLeft, Download, Eye, Calendar, BookOpen } from "react-native-feather"
import * as FileSystem from "expo-file-system"
import * as Sharing from "expo-sharing"

// Define the navigation param list for this stack
type RootStackParamList = {
  ExamDetail: { examId: string }
  ExamViewer: { examId: string; fileUrl: string }
  // ...other routes if needed
}

const ExamDetailScreen = () => {
  const route = useRoute()
  const navigation = useNavigation<NavigationProp<RootStackParamList>>()
  const { supabase } = useSupabase()
  const { colors } = useTheme()
  const { user } = useAuth()

  const [exam, setExam] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)
  const [school, setSchool] = useState<any>(null)
  const [academicLevel, setAcademicLevel] = useState<any>(null)

  const { examId } = route.params as { examId: string }

  useEffect(() => {
    fetchExamDetails()
  }, [])

  const fetchExamDetails = async () => {
    try {
      const { data, error } = await supabase
        .from("exams")
        .select("*, schools(*), academic_levels(*)")
        .eq("id", examId)
        .single()

      if (error) throw error
      setExam(data)
      setSchool(data.schools)
      setAcademicLevel(data.academic_levels)
    } catch (error) {
      console.error("Error fetching exam details:", error)
      Alert.alert("Erreur", "Impossible de charger les détails de l'épreuve")
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async () => {
    if (!exam?.file_url) {
      Alert.alert("Erreur", "Aucun fichier disponible pour cette épreuve")
      return
    }

    try {
      setDownloading(true)

      // Log download attempt
      if (user) {
        await supabase.from("user_history").insert({
          user_id: user.id,
          activity_type: "download",
          resource_type: "exam",
          resource_id: examId,
        })
      }

      // Download file
      const fileUri = `${FileSystem.documentDirectory}${exam.title.replace(/\s+/g, "_")}.pdf`
      const downloadResumable = FileSystem.createDownloadResumable(exam.file_url, fileUri)

      const downloadResult = await downloadResumable.downloadAsync()
      if (!downloadResult || !downloadResult.uri) {
        throw new Error("Le téléchargement a échoué")
      }
      const uri = downloadResult.uri

      // Check if sharing is available
      const isSharingAvailable = await Sharing.isAvailableAsync()
      if (isSharingAvailable) {
        await Sharing.shareAsync(uri)
      } else {
        Alert.alert("Succès", "Fichier téléchargé avec succès")
      }
    } catch (error) {
  const handleView = () => {
    navigation.navigate("ExamViewer", { examId, fileUrl: exam?.file_url as string })
  }
      setDownloading(false)
    }
  }

  const handleView = () => {
    navigation.navigate("ExamViewer", { examId, fileUrl: exam?.file_url })
  }

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.gold} />
      </View>
    )
  }

  if (!exam) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>Épreuve non trouvée</Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[styles.backButton, { backgroundColor: colors.gold }]}
        >
          <Text style={styles.backButtonText}>Retour</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft stroke={colors.text} width={24} height={24} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.examHeader}>
          <View style={[styles.examIconContainer, { backgroundColor: colors.goldLight }]}>
            <BookOpen stroke={colors.gold} width={32} height={32} />
          </View>
          <Text style={[styles.examTitle, { color: colors.text }]}>{exam.title}</Text>
          <View style={styles.examMeta}>
            <View style={[styles.tag, { backgroundColor: colors.gold }]}>
              <Text style={styles.tagText}>{exam.subject}</Text>
            </View>
            {exam.year && (
              <View style={[styles.tag, { backgroundColor: colors.card }]}>
                <Text style={[styles.tagText, { color: colors.text }]}>{exam.year}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>École</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>{school?.name || "Non spécifiée"}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Niveau</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>{academicLevel?.name || "Non spécifié"}</Text>
          </View>
          {exam.year && (
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Année</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>{exam.year}</Text>
            </View>
          )}
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Date d'ajout</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>
              {new Date(exam.created_at).toLocaleDateString("fr-FR")}
            </Text>
          </View>
        </View>

        {exam.description && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Description</Text>
            <Text style={[styles.description, { color: colors.textSecondary }]}>{exam.description}</Text>
          </View>
        )}

        <View style={styles.actionsContainer}>
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.gold }]} onPress={handleView}>
            <Eye stroke="#FFFFFF" width={20} height={20} />
            <Text style={styles.actionButtonText}>Consulter</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.card }]}
            onPress={handleDownload}
            disabled={downloading}
          >
            {downloading ? (
              <ActivityIndicator size="small" color={colors.gold} />
            ) : (
              <>
                <Download stroke={colors.gold} width={20} height={20} />
                <Text style={[styles.actionButtonText, { color: colors.gold }]}>Télécharger</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Conseils d'utilisation</Text>
          <View style={[styles.tipCard, { backgroundColor: colors.card }]}>
            <Calendar stroke={colors.gold} width={20} height={20} style={styles.tipIcon} />
            <Text style={[styles.tipText, { color: colors.textSecondary }]}>
              Planifiez votre temps pour résoudre cette épreuve dans les conditions d'examen.
            </Text>
          </View>
          <View style={[styles.tipCard, { backgroundColor: colors.card }]}>
            <BookOpen stroke={colors.gold} width={20} height={20} style={styles.tipIcon} />
            <Text style={[styles.tipText, { color: colors.textSecondary }]}>
              Consultez les ressources associées dans la bibliothèque pour mieux vous préparer.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
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
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    marginBottom: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  backButton: {
    padding: 4,
  },
  backButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    padding: 10,
  },
  scrollContent: {
    padding: 20,
  },
  examHeader: {
    alignItems: "center",
    marginBottom: 24,
  },
  examIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  examTitle: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 12,
  },
  examMeta: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    color: "#FFFFFF",
    fontWeight: "500",
    fontSize: 14,
  },
  infoCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 14,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    marginLeft: 8,
  },
  tipCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  tipIcon: {
    marginRight: 12,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
})

export default ExamDetailScreen
