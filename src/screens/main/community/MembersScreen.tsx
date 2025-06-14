"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  TextInput,
} from "react-native"
import { useRoute, useNavigation } from "@react-navigation/native"
import type { StackNavigationProp } from '@react-navigation/stack'
import { useSupabase } from "../../../context/SupabaseContext"
import { useTheme } from "../../../context/ThemeContext"
import { useAuth } from "../../../context/AuthContext"
import { ChevronLeft, Search, Frown, Shield, User, MessageSquare, UserPlus } from "react-native-feather"
type RootStackParamList = {
  Chat: { recipientId: string }
  Profile: { userId: string }
  // ...add other screens if needed
}

const MembersScreen = () => {
  const route = useRoute()
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>()
  const { supabase } = useSupabase()
  const { colors } = useTheme()
  const { user } = useAuth()

  const [members, setMembers] = useState<any[]>([])
  const [filteredMembers, setFilteredMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [club, setClub] = useState<any>(null)
  const [userRole, setUserRole] = useState<string>("")

  const { clubId } = route.params as { clubId: string }

  useEffect(() => {
    fetchClubInfo()
    fetchMembers()
    if (user) {
      fetchUserRole()
    }
  }, [])

  useEffect(() => {
    filterMembers()
  }, [searchQuery, members])

  const fetchClubInfo = async () => {
    try {
      const { data, error } = await supabase.from("clubs").select("name, logo_url").eq("id", clubId).single()

      if (error) throw error
      setClub(data)
    } catch (error) {
      console.error("Error fetching club info:", error)
    }
  }

  const fetchUserRole = async () => {
    try {
      const { data, error } = await supabase
        .from("club_members")
        .select("role")
        .eq("club_id", clubId)
        .eq("user_id", user?.id ?? "")
        .single()

      if (error && error.code !== "PGRST116") throw error
      setUserRole(data?.role || "")
    } catch (error) {
      console.error("Error fetching user role:", error)
    }
  }

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from("club_members")
        .select(`
          *,
          profiles (
            id,
            first_name,
            last_name,
            avatar_url,
            bio,
            skills
          )
        `)
        .eq("club_id", clubId)
        .order("joined_at", { ascending: false })

      if (error) throw error
      setMembers(data || [])
    } catch (error) {
      console.error("Error fetching members:", error)
      Alert.alert("Erreur", "Impossible de charger les membres")
    } finally {
      setLoading(false)
    }
  }

  const filterMembers = () => {
    if (!searchQuery.trim()) {
      setFilteredMembers(members)
      return
    }

    const filtered = members.filter((member) => {
      const fullName = `${member.profiles?.first_name || ""} ${member.profiles?.last_name || ""}`.toLowerCase()
      return fullName.includes(searchQuery.toLowerCase())
    })

    setFilteredMembers(filtered)
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Frown stroke={colors.gold} width={16} height={16} />
      case "moderator":
        return <Shield stroke={colors.primary} width={16} height={16} />
      default:
        return <User stroke={colors.textSecondary} width={16} height={16} />
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return colors.gold
      case "moderator":
        return colors.primary
      default:
        return colors.textSecondary
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "admin":
        return "Administrateur"
      case "moderator":
        return "Modérateur"
      default:
        return "Membre"
    }
  }

  const handlePromoteMember = async (memberId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from("club_members")
        .update({ role: newRole })
        .eq("club_id", clubId)
        .eq("user_id", memberId)

      if (error) throw error

      // Refresh members list
      fetchMembers()
      Alert.alert("Succès", `Membre promu avec succès`)
    } catch (error) {
      console.error("Error promoting member:", error)
      Alert.alert("Erreur", "Impossible de promouvoir le membre")
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    Alert.alert("Confirmer la suppression", "Êtes-vous sûr de vouloir retirer ce membre du club ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Supprimer",
        style: "destructive",
        onPress: async () => {
          try {
            const { error } = await supabase.from("club_members").delete().eq("club_id", clubId).eq("user_id", memberId)

            if (error) throw error

            fetchMembers()
            Alert.alert("Succès", "Membre retiré du club")
          } catch (error) {
            console.error("Error removing member:", error)
            Alert.alert("Erreur", "Impossible de retirer le membre")
          }
        },
      },
    ])
  }

  const handleStartChat = (memberId: string) => {
    navigation.navigate("Chat", { recipientId: memberId })
  }

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.gold} />
      </View>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft stroke={colors.text} width={24} height={24} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Membres</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            {club?.name} • {members.length} membre{members.length > 1 ? "s" : ""}
          </Text>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, { backgroundColor: colors.card }]}>
          <Search stroke={colors.textSecondary} width={20} height={20} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Rechercher un membre..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {filteredMembers.length > 0 ? (
          filteredMembers.map((member) => (
            <View key={member.user_id} style={[styles.memberCard, { backgroundColor: colors.card }]}>
              <TouchableOpacity
                style={styles.memberInfo}
                onPress={() => navigation.navigate("Profile", { userId: member.user_id })}
              >
                <Image
                  source={
                    member.profiles?.avatar_url
                      ? { uri: member.profiles.avatar_url }
                      : require("../../../assets/icon.png")
                  }
                  style={styles.memberAvatar}
                />
                <View style={styles.memberDetails}>
                  <View style={styles.memberHeader}>
                    <Text style={[styles.memberName, { color: colors.text }]}>
                      {member.profiles?.first_name} {member.profiles?.last_name}
                    </Text>
                    <View style={styles.roleContainer}>
                      {getRoleIcon(member.role)}
                      <Text style={[styles.roleText, { color: getRoleColor(member.role) }]}>
                        {getRoleLabel(member.role)}
                      </Text>
                    </View>
                  </View>
                  {member.profiles?.bio && (
                    <Text style={[styles.memberBio, { color: colors.textSecondary }]} numberOfLines={2}>
                      {member.profiles.bio}
                    </Text>
                  )}
                  {member.profiles?.skills && member.profiles.skills.length > 0 && (
                    <View style={styles.skillsContainer}>
                      {member.profiles.skills.slice(0, 3).map((skill: string, index: number) => (
                        <View key={index} style={[styles.skillTag, { backgroundColor: colors.goldLight }]}>
                          <Text style={[styles.skillText, { color: colors.gold }]}>{skill}</Text>
                        </View>
                      ))}
                      {member.profiles.skills.length > 3 && (
                        <Text style={[styles.moreSkills, { color: colors.textSecondary }]}>
                          +{member.profiles.skills.length - 3}
                        </Text>
                      )}
                    </View>
                  )}
                </View>
              </TouchableOpacity>

              <View style={styles.memberActions}>
                {member.user_id !== user?.id && (
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: colors.goldLight }]}
                    onPress={() => handleStartChat(member.user_id)}
                  >
                    <MessageSquare stroke={colors.gold} width={16} height={16} />
                  </TouchableOpacity>
                )}

                {(userRole === "admin" || userRole === "moderator") && member.user_id !== user?.id && (
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: colors.card }]}
                    onPress={() => {
                      Alert.alert("Actions sur le membre", "Que souhaitez-vous faire ?", [
                        { text: "Annuler", style: "cancel" },
                        {
                          text: member.role === "member" ? "Promouvoir modérateur" : "Rétrograder membre",
                          onPress: () =>
                            handlePromoteMember(member.user_id, member.role === "member" ? "moderator" : "member"),
                        },
                        {
                          text: "Retirer du club",
                          style: "destructive",
                          onPress: () => handleRemoveMember(member.user_id),
                        },
                      ])
                    }}
                  >
                    <UserPlus stroke={colors.textSecondary} width={16} height={16} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))
        ) : (
          <View style={[styles.emptyContainer, { backgroundColor: colors.card }]}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              {searchQuery ? "Aucun membre trouvé" : "Aucun membre dans ce club"}
            </Text>
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
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
  },
  scrollContent: {
    padding: 20,
  },
  memberCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  memberInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  memberAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 16,
  },
  memberDetails: {
    flex: 1,
  },
  memberHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  memberName: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  roleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  roleText: {
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 4,
  },
  memberBio: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  skillsContainer: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  skillTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  skillText: {
    fontSize: 12,
    fontWeight: "500",
  },
  moreSkills: {
    fontSize: 12,
    fontStyle: "italic",
  },
  memberActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    marginLeft: 8,
  },
  emptyContainer: {
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

export default MembersScreen
