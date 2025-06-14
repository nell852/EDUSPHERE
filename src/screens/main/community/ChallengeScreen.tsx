"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, TextInput } from "react-native"
import { useRoute, useNavigation } from "@react-navigation/native"
import { useSupabase } from "../../../context/SupabaseContext"
import { useTheme } from "../../../context/ThemeContext"
import { useAuth } from "../../../context/AuthContext"
import { ChevronLeft, Award, Clock, Users, Code, Send } from "react-native-feather"

const ChallengeScreen = () => {
  const route = useRoute()
  const navigation = useNavigation()
  const { supabase } = useSupabase()
  const { colors } = useTheme()
  const { user } = useAuth()

  const [challenge, setChallenge] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submissions, setSubmissions] = useState<any[]>([])
  const [userSubmission, setUserSubmission] = useState<any>(null)
  const [submissionCode, setSubmissionCode] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [participants, setParticipants] = useState<any[]>([])

  const { challengeId } = route.params as { challengeId: string }

  useEffect(() => {
    fetchChallengeDetails()
    fetchSubmissions()
    fetchParticipants()
    if (user) {
      fetchUserSubmission()
    }
  }, [])

  const fetchChallengeDetails = async () => {
    try {
      const { data, error } = await supabase
        .from("challenges")
        .select(`
          *,
          clubs (name, logo_url),
          profiles (first_name, last_name, avatar_url)
        `)
        .eq("id", challengeId)
        .single()

      if (error) throw error
      setChallenge(data)
    } catch (error) {
      console.error("Error fetching challenge details:", error)
      Alert.alert("Erreur", "Impossible de charger les détails du défi")
    } finally {
      setLoading(false)
    }
  }

  const fetchSubmissions = async () => {
    try {
      const { data, error } = await supabase
        .from("challenge_submissions")
        .select(`
          *,
          profiles (first_name, last_name, avatar_url)
        `)
        .eq("challenge_id", challengeId)
        .order("score", { ascending: false })
        .limit(10)

      if (error) throw error
      setSubmissions(data || [])
    } catch (error) {
      console.error("Error fetching submissions:", error)
    }
  }

  const fetchUserSubmission = async () => {
    try {
      if (!user?.id) return
      const { data, error } = await supabase
        .from("challenge_submissions")
        .select("*")
        .eq("challenge_id", challengeId)
        .eq("user_id", user.id)
        .single()

      if (error && error.code !== "PGRST116") throw error
      setUserSubmission(data)
      if (data) {
        setSubmissionCode(data.code || "")
      }
    } catch (error) {
      console.error("Error fetching user submission:", error)
    }
  }

  const fetchParticipants = async () => {
    try {
      const { data, error } = await supabase
        .from("challenge_submissions")
        .select(`
          user_id,
          profiles (first_name, last_name, avatar_url)
        `)
        .eq("challenge_id", challengeId)

      if (error) throw error

      // Remove duplicates
      const uniqueParticipants =
        data?.filter(
          (participant, index, self) => index === self.findIndex((p) => p.user_id === participant.user_id),
        ) || []

      setParticipants(uniqueParticipants)
    } catch (error) {
      console.error("Error fetching participants:", error)
    }
  }

  const handleSubmitSolution = async () => {
    if (!user) {
      Alert.alert("Connexion requise", "Vous devez être connecté pour soumettre une solution")
      return
    }

    if (!submissionCode.trim()) {
      Alert.alert("Code requis", "Veuillez saisir votre code avant de soumettre")
      return
    }

    setSubmitting(true)
    let error: any = null // Declare the error variable
    try {
      const submissionData = {
        challenge_id: challengeId,
        user_id: user.id,
        code: submissionCode,
        score: Math.floor(Math.random() * 100) + 1, // Score simulé
        status: "submitted",
      }

      if (userSubmission) {
        // Update existing submission
        const { error: updateError } = await supabase
          .from("challenge_submissions")
          .update(submissionData)
          .eq("id", userSubmission.id)
        error = updateError // Assign the error variable
      } else {
        // Create new submission
        const { error: insertError } = await supabase.from("challenge_submissions").insert(submissionData)
        error = insertError // Assign the error variable
      }

      if (error) throw error

      Alert.alert("Succès", "Votre solution a été soumise avec succès !")
      fetchSubmissions()
      fetchUserSubmission()
      fetchParticipants()
    } catch (error) {
      console.error("Error submitting solution:", error)
      Alert.alert("Erreur", "Impossible de soumettre votre solution")
    } finally {
      setSubmitting(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "#10B981"
      case "medium":
        return "#F59E0B"
      case "hard":
        return "#EF4444"
      default:
        return colors.textSecondary
    }
  }

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "Facile"
      case "medium":
        return "Moyen"
      case "hard":
        return "Difficile"
      default:
        return difficulty
    }
  }

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.gold} />
      </View>
    )
  }

  if (!challenge) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>Défi non trouvé</Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[styles.backButton, { backgroundColor: colors.gold }]}
        >
          <Text style={styles.backButtonText}>Retour</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const isExpired = new Date(challenge.end_date) < new Date()

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft stroke={colors.text} width={24} height={24} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Défi</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.challengeHeader, { backgroundColor: colors.card }]}>
          <View style={styles.challengeInfo}>
            <Text style={[styles.challengeTitle, { color: colors.text }]}>{challenge.title}</Text>
            <View style={styles.challengeMeta}>
              <View style={[styles.difficultyTag, { backgroundColor: getDifficultyColor(challenge.difficulty) }]}>
                <Text style={styles.difficultyText}>{getDifficultyLabel(challenge.difficulty)}</Text>
              </View>
              <View style={styles.metaItem}>
                <Clock stroke={colors.textSecondary} width={16} height={16} />
                <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                  {isExpired ? "Expiré" : `Expire le ${formatDate(challenge.end_date)}`}
                </Text>
              </View>
              <View style={styles.metaItem}>
                <Users stroke={colors.textSecondary} width={16} height={16} />
                <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                  {participants.length} participant{participants.length > 1 ? "s" : ""}
                </Text>
              </View>
            </View>
          </View>
          <View style={[styles.challengeIcon, { backgroundColor: colors.goldLight }]}>
            <Award stroke={colors.gold} width={32} height={32} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Description</Text>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {challenge.description || "Aucune description disponible pour ce défi."}
          </Text>
        </View>

        {challenge.requirements && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Exigences</Text>
            <Text style={[styles.requirements, { color: colors.textSecondary }]}>{challenge.requirements}</Text>
          </View>
        )}

        {!isExpired && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Votre solution</Text>
            <View style={[styles.codeEditor, { backgroundColor: colors.card }]}>
              <View style={styles.editorHeader}>
                <Code stroke={colors.textSecondary} width={16} height={16} />
                <Text style={[styles.editorTitle, { color: colors.textSecondary }]}>Éditeur de code</Text>
              </View>
              <TextInput
                style={[styles.codeInput, { color: colors.text }]}
                multiline
                placeholder="Écrivez votre solution ici..."
                placeholderTextColor={colors.textSecondary}
                value={submissionCode}
                onChangeText={setSubmissionCode}
                textAlignVertical="top"
              />
            </View>
            <TouchableOpacity
              style={[styles.submitButton, { backgroundColor: colors.gold, opacity: submitting ? 0.7 : 1 }]}
              onPress={handleSubmitSolution}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Send stroke="#FFFFFF" width={16} height={16} />
                  <Text style={styles.submitButtonText}>{userSubmission ? "Mettre à jour" : "Soumettre"}</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Classement</Text>
          {submissions.length > 0 ? (
            submissions.map((submission, index) => (
              <View key={submission.id} style={[styles.submissionCard, { backgroundColor: colors.card }]}>
                <View style={styles.rankContainer}>
                  {index < 3 ? (
                    <View style={[styles.medalContainer, { backgroundColor: getMedalColor(index) }]}>
                      <Award stroke="#FFFFFF" width={16} height={16} />
                    </View>
                  ) : (
                    <Text style={[styles.rankNumber, { color: colors.textSecondary }]}>#{index + 1}</Text>
                  )}
                </View>
                <View style={styles.submissionInfo}>
                  <Text style={[styles.submissionUser, { color: colors.text }]}>
                    {submission.profiles?.first_name} {submission.profiles?.last_name}
                  </Text>
                  <Text style={[styles.submissionScore, { color: colors.gold }]}>Score: {submission.score}/100</Text>
                </View>
                <Text style={[styles.submissionDate, { color: colors.textSecondary }]}>
                  {formatDate(submission.created_at)}
                </Text>
              </View>
            ))
          ) : (
            <View style={[styles.emptyCard, { backgroundColor: colors.card }]}>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                Aucune soumission pour le moment. Soyez le premier !
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  )
}

const getMedalColor = (index: number) => {
  switch (index) {
    case 0:
      return "#FFD700" // Gold
    case 1:
      return "#C0C0C0" // Silver
    case 2:
      return "#CD7F32" // Bronze
    default:
      return "#6B7280"
  }
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
    paddingBottom: 16,
  },
  backButton: {
    padding: 4,
    marginRight: 16,
  },
  backButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    padding: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  scrollContent: {
    padding: 20,
  },
  challengeHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
  },
  challengeInfo: {
    flex: 1,
  },
  challengeTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
  },
  challengeMeta: {
    gap: 8,
  },
  difficultyTag: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  difficultyText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  metaText: {
    marginLeft: 6,
    fontSize: 14,
  },
  challengeIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 16,
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
  requirements: {
    fontSize: 16,
    lineHeight: 24,
  },
  codeEditor: {
    borderRadius: 12,
    marginBottom: 16,
  },
  editorHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  editorTitle: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "500",
  },
  codeInput: {
    padding: 16,
    fontSize: 14,
    fontFamily: "monospace",
    minHeight: 200,
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    marginLeft: 8,
  },
  submissionCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  rankContainer: {
    width: 40,
    alignItems: "center",
  },
  medalContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  rankNumber: {
    fontSize: 16,
    fontWeight: "bold",
  },
  submissionInfo: {
    flex: 1,
    marginLeft: 16,
  },
  submissionUser: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  submissionScore: {
    fontSize: 14,
    fontWeight: "500",
  },
  submissionDate: {
    fontSize: 12,
  },
  emptyCard: {
    padding: 32,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
  },
})

export default ChallengeScreen
function setSubmissionCode(arg0: any) {
    throw new Error("Function not implemented.")
}

