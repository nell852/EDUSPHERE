"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, TextInput } from "react-native"
import { useRoute, useNavigation } from "@react-navigation/native"
import { useSupabase } from "../../../context/SupabaseContext"
import { useTheme } from "../../../context/ThemeContext"
import { useAuth } from "../../../context/AuthContext"
import { ChevronLeft, Users, Clock, Code, MessageSquare, Share } from "react-native-feather"

const WorkshopScreen = () => {
  const route = useRoute()
  const navigation = useNavigation()
  const { supabase } = useSupabase()
  const { colors } = useTheme()
  const { user } = useAuth()

  const [workshop, setWorkshop] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [participants, setParticipants] = useState<any[]>([])
  const [isParticipant, setIsParticipant] = useState(false)
  const [joining, setJoining] = useState(false)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [sendingMessage, setSendingMessage] = useState(false)

  const { workshopId } = route.params as { workshopId: string }

  useEffect(() => {
    fetchWorkshopDetails()
    fetchParticipants()
    fetchMessages()
    if (user) {
      checkParticipation()
    }
  }, [])

  const fetchWorkshopDetails = async () => {
    try {
      const { data, error } = await supabase
        .from("workshops")
        .select(`
          *,
          clubs (name, logo_url),
          profiles (first_name, last_name, avatar_url)
        `)
        .eq("id", workshopId)
        .single()

      if (error) throw error
      setWorkshop(data)
    } catch (error) {
      console.error("Error fetching workshop details:", error)
      Alert.alert("Erreur", "Impossible de charger les détails de l'atelier")
    } finally {
      setLoading(false)
    }
  }

  const fetchParticipants = async () => {
    try {
      const { data, error } = await supabase
        .from("workshop_participants")
        .select(`
          *,
          profiles (first_name, last_name, avatar_url)
        `)
        .eq("workshop_id", workshopId)
        .order("joined_at", { ascending: false })

      if (error) throw error
      setParticipants(data || [])
    } catch (error) {
      console.error("Error fetching participants:", error)
    }
  }

  const checkParticipation = async () => {
    try {
      const { data, error } = await supabase
        .from("workshop_participants")
        .select("*")
        .eq("workshop_id", workshopId)
        .eq("user_id", user?.id)
        .single()

      if (error && error.code !== "PGRST116") throw error
      setIsParticipant(!!data)
    } catch (error) {
      console.error("Error checking participation:", error)
    }
  }

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from("workshop_messages")
        .select(`
          *,
          profiles (first_name, last_name, avatar_url)
        `)
        .eq("workshop_id", workshopId)
        .order("created_at", { ascending: true })
        .limit(50)

      if (error) throw error
      setMessages(data || [])
    } catch (error) {
      console.error("Error fetching messages:", error)
    }
  }

  const handleJoinWorkshop = async () => {
    if (!user) {
      Alert.alert("Connexion requise", "Vous devez être connecté pour rejoindre un atelier")
      return
    }

    setJoining(true)
    try {
      const { error } = await supabase.from("workshop_participants").insert({
        workshop_id: workshopId,
        user_id: user.id,
      })

      if (error) throw error

      setIsParticipant(true)
      fetchParticipants()
      Alert.alert("Succès", "Vous avez rejoint l'atelier avec succès")
    } catch (error) {
      console.error("Error joining workshop:", error)
      Alert.alert("Erreur", "Impossible de rejoindre l'atelier")
    } finally {
      setJoining(false)
    }
  }

  const handleSendMessage = async () => {
    if (!user || !newMessage.trim()) return

    setSendingMessage(true)
    try {
      const { error } = await supabase.from("workshop_messages").insert({
        workshop_id: workshopId,
        user_id: user.id,
        message: newMessage.trim(),
      })

      if (error) throw error

      setNewMessage("")
      fetchMessages()
    } catch (error) {
      console.error("Error sending message:", error)
      Alert.alert("Erreur", "Impossible d'envoyer le message")
    } finally {
      setSendingMessage(false)
    }
  }

  const handleStartIDE = () => {
    navigation.navigate("IDE", { workshopId })
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

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.gold} />
      </View>
    )
  }

  if (!workshop) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>Atelier non trouvé</Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[styles.backButton, { backgroundColor: colors.gold }]}
        >
          <Text style={styles.backButtonText}>Retour</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const isUpcoming = new Date(workshop.start_date) > new Date()
  const isActive = new Date(workshop.start_date) <= new Date() && new Date(workshop.end_date) >= new Date()
  const isEnded = new Date(workshop.end_date) < new Date()

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft stroke={colors.text} width={24} height={24} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Atelier</Text>
        <TouchableOpacity style={styles.shareButton}>
          <Share stroke={colors.text} width={20} height={20} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.workshopHeader, { backgroundColor: colors.card }]}>
          <Text style={[styles.workshopTitle, { color: colors.text }]}>{workshop.name}</Text>
          <View style={styles.workshopMeta}>
            <View style={styles.metaItem}>
              <Clock stroke={colors.textSecondary} width={16} height={16} />
              <Text style={[styles.metaText, { color: colors.textSecondary }]}>{formatDate(workshop.start_date)}</Text>
            </View>
            <View style={styles.metaItem}>
              <Users stroke={colors.textSecondary} width={16} height={16} />
              <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                {participants.length} participant{participants.length > 1 ? "s" : ""}
              </Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(isUpcoming, isActive, isEnded) }]}>
            <Text style={styles.statusText}>{getStatusText(isUpcoming, isActive, isEnded)}</Text>
          </View>
        </View>

        {!isParticipant && !isEnded && (
          <TouchableOpacity
            style={[styles.joinButton, { backgroundColor: colors.gold }]}
            onPress={handleJoinWorkshop}
            disabled={joining}
          >
            {joining ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.joinButtonText}>Rejoindre l'atelier</Text>
            )}
          </TouchableOpacity>
        )}

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Description</Text>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {workshop.description || "Aucune description disponible pour cet atelier."}
          </Text>
        </View>

        {workshop.resources && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Ressources</Text>
            <Text style={[styles.resources, { color: colors.textSecondary }]}>{workshop.resources}</Text>
          </View>
        )}

        {isParticipant && isActive && (
          <View style={styles.section}>
            <TouchableOpacity style={[styles.ideButton, { backgroundColor: colors.gold }]} onPress={handleStartIDE}>
              <Code stroke="#FFFFFF" width={20} height={20} />
              <Text style={styles.ideButtonText}>Ouvrir l'IDE collaboratif</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Participants</Text>
          {participants.length > 0 ? (
            <View style={styles.participantsList}>
              {participants.slice(0, 6).map((participant) => (
                <View key={participant.user_id} style={[styles.participantCard, { backgroundColor: colors.card }]}>
                  <Text style={[styles.participantName, { color: colors.text }]}>
                    {participant.profiles?.first_name} {participant.profiles?.last_name}
                  </Text>
                </View>
              ))}
              {participants.length > 6 && (
                <View style={[styles.moreParticipants, { backgroundColor: colors.card }]}>
                  <Text style={[styles.moreText, { color: colors.textSecondary }]}>
                    +{participants.length - 6} autres
                  </Text>
                </View>
              )}
            </View>
          ) : (
            <View style={[styles.emptyCard, { backgroundColor: colors.card }]}>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Aucun participant pour le moment</Text>
            </View>
          )}
        </View>

        {isParticipant && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Discussion</Text>
            <View style={[styles.chatContainer, { backgroundColor: colors.card }]}>
              <ScrollView style={styles.messagesContainer} showsVerticalScrollIndicator={false}>
                {messages.length > 0 ? (
                  messages.map((message) => (
                    <View key={message.id} style={styles.messageItem}>
                      <Text style={[styles.messageSender, { color: colors.gold }]}>
                        {message.profiles?.first_name} {message.profiles?.last_name}
                      </Text>
                      <Text style={[styles.messageText, { color: colors.text }]}>{message.message}</Text>
                      <Text style={[styles.messageTime, { color: colors.textSecondary }]}>
                        {formatDate(message.created_at)}
                      </Text>
                    </View>
                  ))
                ) : (
                  <Text style={[styles.emptyMessages, { color: colors.textSecondary }]}>
                    Aucun message. Commencez la discussion !
                  </Text>
                )}
              </ScrollView>
              <View style={styles.messageInput}>
                <TextInput
                  style={[styles.textInput, { color: colors.text, backgroundColor: colors.background }]}
                  placeholder="Tapez votre message..."
                  placeholderTextColor={colors.textSecondary}
                  value={newMessage}
                  onChangeText={setNewMessage}
                  multiline
                />
                <TouchableOpacity
                  style={[styles.sendButton, { backgroundColor: colors.gold }]}
                  onPress={handleSendMessage}
                  disabled={sendingMessage || !newMessage.trim()}
                >
                  {sendingMessage ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <MessageSquare stroke="#FFFFFF" width={16} height={16} />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  )
}

const getStatusColor = (isUpcoming: boolean, isActive: boolean, isEnded: boolean) => {
  if (isActive) return "#10B981"
  if (isUpcoming) return "#F59E0B"
  if (isEnded) return "#6B7280"
  return "#6B7280"
}

const getStatusText = (isUpcoming: boolean, isActive: boolean, isEnded: boolean) => {
  if (isActive) return "En cours"
  if (isUpcoming) return "À venir"
  if (isEnded) return "Terminé"
  return "Inconnu"
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
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  backButton: {
    padding: 4,
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
  shareButton: {
    padding: 4,
  },
  scrollContent: {
    padding: 20,
  },
  workshopHeader: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
  },
  workshopTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
  },
  workshopMeta: {
    gap: 8,
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  metaText: {
    marginLeft: 6,
    fontSize: 14,
  },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  joinButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  joinButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
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
  resources: {
    fontSize: 16,
    lineHeight: 24,
  },
  ideButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
  },
  ideButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    marginLeft: 8,
  },
  participantsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  participantCard: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  participantName: {
    fontSize: 14,
    fontWeight: "500",
  },
  moreParticipants: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  moreText: {
    fontSize: 14,
    fontStyle: "italic",
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
  chatContainer: {
    borderRadius: 12,
    height: 300,
  },
  messagesContainer: {
    flex: 1,
    padding: 16,
  },
  messageItem: {
    marginBottom: 12,
  },
  messageSender: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 2,
  },
  messageText: {
    fontSize: 14,
    marginBottom: 2,
  },
  messageTime: {
    fontSize: 10,
  },
  emptyMessages: {
    textAlign: "center",
    fontSize: 14,
    fontStyle: "italic",
    marginTop: 20,
  },
  messageInput: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
  },
  textInput: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    maxHeight: 100,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
})

export default WorkshopScreen
