"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert } from "react-native"
import { useRoute, useNavigation } from "@react-navigation/native"
import { useSupabase } from "../../../context/SupabaseContext"
import { useTheme } from "../../../context/ThemeContext"
import { useAuth } from "../../../context/AuthContext"
import { ChevronLeft, Users, MessageSquare, Code, Award } from "react-native-feather"

const ClubDetailScreen = () => {
  const route = useRoute()
  const navigation = useNavigation()
  const { supabase } = useSupabase()
  const { colors } = useTheme()
  const { user } = useAuth()

  const [club, setClub] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [memberCount, setMemberCount] = useState(0)
  const [isMember, setIsMember] = useState(false)
  const [isJoining, setIsJoining] = useState(false)
  const [workshops, setWorkshops] = useState<any[]>([])
  const [challenges, setChallenges] = useState<any[]>([])

  const { clubId } = route.params as { clubId: string }

  useEffect(() => {
    fetchClubDetails()
    if (user) {
      checkMembership()
    }
    fetchWorkshops()
    fetchChallenges()
  }, [])

  const fetchClubDetails = async () => {
    try {
      const { data, error } = await supabase
        .from("clubs")
        .select("*, profiles(first_name, last_name, avatar_url)")
        .eq("id", clubId)
        .single()

      if (error) throw error
      setClub(data)

      // Get member count
      const { count, error: countError } = await supabase
        .from("club_members")
        .select("*", { count: "exact", head: true })
        .eq("club_id", clubId)

      if (countError) throw countError
      setMemberCount(count || 0)
    } catch (error) {
      console.error("Error fetching club details:", error)
      Alert.alert("Erreur", "Impossible de charger les détails du club")
    } finally {
      setLoading(false)
    }
  }

  const checkMembership = async () => {
    try {
      if (!user?.id) return

      const { data, error } = await supabase
        .from("club_members")
        .select("*")
        .eq("club_id", clubId)
        .eq("user_id", user.id)
        .single()

      if (error && error.code !== "PGRST116") {
        // PGRST116 is "no rows returned" error, which is expected if not a member
        throw error
      }

      setIsMember(!!data)
    } catch (error) {
      console.error("Error checking membership:", error)
    }
  }

  const fetchWorkshops = async () => {
    try {
      const { data, error } = await supabase
        .from("workshops")
        .select("*")
        .eq("club_id", clubId)
        .order("created_at", { ascending: false })
        .limit(3)

      if (error) throw error
      setWorkshops(data || [])
    } catch (error) {
      console.error("Error fetching workshops:", error)
    }
  }

  const fetchChallenges = async () => {
    try {
      const { data, error } = await supabase
        .from("challenges")
        .select("*")
        .eq("club_id", clubId)
        .order("created_at", { ascending: false })
        .limit(3)

      if (error) throw error
      setChallenges(data || [])
    } catch (error) {
      console.error("Error fetching challenges:", error)
    }
  }

  const handleJoinClub = async () => {
    if (!user) {
      Alert.alert("Connexion requise", "Vous devez être connecté pour rejoindre un club")
      return
    }

    setIsJoining(true)
    try {
      const { error } = await supabase.from("club_members").insert({
        club_id: clubId,
        user_id: user.id,
        role: "member",
      })

      if (error) throw error

      setIsMember(true)
      setMemberCount((prev) => prev + 1)
      Alert.alert("Succès", "Vous avez rejoint le club avec succès")
    } catch (error) {
      console.error("Error joining club:", error)
      Alert.alert("Erreur", "Impossible de rejoindre le club")
    } finally {
      setIsJoining(false)
    }
  }

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.gold} />
      </View>
    )
  }

  if (!club) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>Club non trouvé</Text>
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
        <View style={styles.clubHeader}>
          <Image
            source={club.logo_url ? { uri: club.logo_url } : require("../../../assets/icon.png")}
            style={styles.clubLogo}
          />
          <Text style={[styles.clubName, { color: colors.text }]}>{club.name}</Text>
          <View style={[styles.domainTag, { backgroundColor: colors.gold }]}>
            <Text style={styles.domainTagText}>{club.domain}</Text>
          </View>
          <View style={styles.clubStats}>
            <View style={styles.statItem}>
              <Users stroke={colors.textSecondary} width={16} height={16} />
              <Text style={[styles.statText, { color: colors.textSecondary }]}>{memberCount} membres</Text>
            </View>
            <View style={styles.statItem}>
              <Code stroke={colors.textSecondary} width={16} height={16} />
              <Text style={[styles.statText, { color: colors.textSecondary }]}>{workshops.length} ateliers</Text>
            </View>
            <View style={styles.statItem}>
              <Award stroke={colors.textSecondary} width={16} height={16} />
              <Text style={[styles.statText, { color: colors.textSecondary }]}>{challenges.length} défis</Text>
            </View>
          </View>
        </View>

        {!isMember && (
          <TouchableOpacity
            style={[styles.joinButton, { backgroundColor: colors.gold }]}
            onPress={handleJoinClub}
            disabled={isJoining}
          >
            {isJoining ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.joinButtonText}>Rejoindre le club</Text>
            )}
          </TouchableOpacity>
        )}

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>À propos</Text>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {club.description || "Aucune description disponible pour ce club."}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Créateur</Text>
          <View style={[styles.creatorCard, { backgroundColor: colors.card }]}>
            <Image
              source={
                club.profiles?.avatar_url
                  ? { uri: club.profiles.avatar_url }
                  : require("../../../assets/icon.png")
              }
              style={styles.creatorAvatar}
            />
            <View style={styles.creatorInfo}>
              <Text style={[styles.creatorName, { color: colors.text }]}>
                {club.profiles?.first_name} {club.profiles?.last_name}
              </Text>
              <Text style={[styles.creatorRole, { color: colors.gold }]}>Créateur du club</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Ateliers</Text>
            {isMember && workshops.length > 0 && (
              <TouchableOpacity onPress={() => {}}>
                <Text style={[styles.seeAllText, { color: colors.gold }]}>Voir tout</Text>
              </TouchableOpacity>
            )}
          </View>

          {workshops.length > 0 ? (
            workshops.map((workshop) => (
              <TouchableOpacity
                key={workshop.id}
                style={[styles.workshopCard, { backgroundColor: colors.card }]}
                onPress={() => (navigation as any).navigate("Workshop", { workshopId: workshop.id })}
                disabled={!isMember}
              >
                <View style={[styles.workshopIconContainer, { backgroundColor: colors.goldLight }]}>
                  <Code stroke={colors.gold} width={24} height={24} />
                </View>
                <View style={styles.workshopInfo}>
                  <Text style={[styles.workshopName, { color: colors.text }]}>{workshop.name}</Text>
                  <Text style={[styles.workshopDescription, { color: colors.textSecondary }]} numberOfLines={2}>
                    {workshop.description || "Aucune description disponible"}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={[styles.emptyCard, { backgroundColor: colors.card }]}>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                {isMember
                  ? "Aucun atelier disponible. Créez le premier !"
                  : "Rejoignez le club pour accéder aux ateliers"}
              </Text>
            </View>
          )}

          {isMember && (
            <TouchableOpacity style={[styles.createButton, { backgroundColor: colors.card }]} onPress={() => {}}>
              <Plus stroke={colors.gold} width={20} height={20} />
              <Text style={[styles.createButtonText, { color: colors.gold }]}>Créer un atelier</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Défis</Text>
            {isMember && challenges.length > 0 && (
              <TouchableOpacity onPress={() => {}}>
                <Text style={[styles.seeAllText, { color: colors.gold }]}>Voir tout</Text>
              </TouchableOpacity>
            )}
          </View>

          {challenges.length > 0 ? (
            challenges.map((challenge) => (
              <TouchableOpacity
                key={challenge.id}
                style={[styles.challengeCard, { backgroundColor: colors.card }]}
                onPress={() => (navigation as any).navigate("Challenge", { challengeId: challenge.id })}
                disabled={!isMember}
              >
                <View style={[styles.challengeIconContainer, { backgroundColor: colors.goldLight }]}>
                  <Award stroke={colors.gold} width={24} height={24} />
                </View>
                <View style={styles.challengeInfo}>
                  <Text style={[styles.challengeName, { color: colors.text }]}>{challenge.title}</Text>
                  <Text style={[styles.challengeDescription, { color: colors.textSecondary }]} numberOfLines={2}>
                    {challenge.description || "Aucune description disponible"}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={[styles.emptyCard, { backgroundColor: colors.card }]}>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                {isMember ? "Aucun défi disponible. Créez le premier !" : "Rejoignez le club pour accéder aux défis"}
              </Text>
            </View>
          )}
        </View>

        {isMember && (
          <View style={styles.section}>
            <TouchableOpacity
              style={[styles.discussionButton, { backgroundColor: colors.card }]}
              onPress={() => (navigation as any).navigate("Members", { clubId })}
            >
              <Users stroke={colors.gold} width={20} height={20} />
              <Text style={[styles.discussionButtonText, { color: colors.gold }]}>Voir les membres</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.discussionButton, { backgroundColor: colors.card }]} onPress={() => {}}>
              <MessageSquare stroke={colors.gold} width={20} height={20} />
              <Text style={[styles.discussionButtonText, { color: colors.gold }]}>Discussions</Text>
            </TouchableOpacity>
          </View>
        )}
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
  clubHeader: {
    alignItems: "center",
    marginBottom: 24,
  },
  clubLogo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  clubName: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  domainTag: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 16,
  },
  domainTagText: {
    color: "#FFFFFF",
    fontWeight: "500",
  },
  clubStats: {
    flexDirection: "row",
    justifyContent: "center",
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 8,
  },
  statText: {
    marginLeft: 4,
    fontSize: 14,
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
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: "500",
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  creatorCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
  },
  creatorAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 16,
  },
  creatorInfo: {
    flex: 1,
  },
  creatorName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  creatorRole: {
    fontSize: 14,
    fontWeight: "500",
  },
  workshop: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  workshopCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  workshopIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  workshopInfo: {
    flex: 1,
  },
  workshopName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  workshopDescription: {
    fontSize: 14,
  },
  challengeCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  challengeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  challengeInfo: {
    flex: 1,
  },
  challengeName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  challengeDescription: {
    fontSize: 14,
  },
  emptyCard: {
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    height: 100,
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  createButtonText: {
    fontWeight: "600",
    marginLeft: 8,
  },
  discussionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  discussionButtonText: {
    fontWeight: "600",
    marginLeft: 8,
  },
})

// Add Plus component
type PlusProps = {
  stroke: string
  width: number
  height: number
}

const Plus = ({ stroke, width, height }: PlusProps) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      stroke={stroke}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  )
}

export default ClubDetailScreen
