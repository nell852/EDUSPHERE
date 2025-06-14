"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, RefreshControl } from "react-native"
import { useNavigation } from "@react-navigation/native"
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useSupabase } from "../../../context/SupabaseContext"
import { useTheme } from "../../../context/ThemeContext"
import { useAuth } from "../../../context/AuthContext"
import { Plus, Users, Search } from "react-native-feather"
type RootStackParamList = {
  ClubDetail: { clubId: string }
  Search: undefined
  CreateClub: undefined
  // add other routes if needed
}

const CommunityScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const { supabase } = useSupabase()
  const { colors } = useTheme()
  const { user } = useAuth()

  const [clubs, setClubs] = useState<any[]>([])
  const [userClubs, setUserClubs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchClubs()
  }, [])

  const fetchClubs = async () => {
    setRefreshing(true)
    try {
      // Fetch all public clubs
      const { data: publicClubs, error: publicError } = await supabase
        .from("clubs")
        .select("*, profiles(first_name, last_name)")
        .eq("is_private", false)
        .order("created_at", { ascending: false })

      if (publicError) throw publicError

      // Fetch user's clubs if logged in
      if (user) {
        const { data: memberClubs, error: memberError } = await supabase
          .from("club_members")
          .select("clubs(*, profiles(first_name, last_name))")
          .eq("user_id", user.id)

        if (memberError) throw memberError

        const userClubsData = memberClubs.map((item) => item.clubs).filter((club) => club !== null) as any[]

        setUserClubs(userClubsData)
      }

      setClubs(publicClubs || [])
    } catch (error) {
      console.error("Error fetching clubs:", error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const renderClubItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[styles.clubCard, { backgroundColor: colors.card }]}
      onPress={() => navigation.navigate("ClubDetail", { clubId: item.id })}
    >
      <Image
        source={item.logo_url ? { uri: item.logo_url } : require("../../../assets/icon.png")}
        style={styles.clubLogo}
      />
      <View style={styles.clubInfo}>
        <Text style={[styles.clubName, { color: colors.text }]}>{item.name}</Text>
        <Text style={[styles.clubDomain, { color: colors.gold }]}>{item.domain}</Text>
        <Text style={[styles.clubCreator, { color: colors.textSecondary }]} numberOfLines={1}>
          Créé par {item.profiles?.first_name} {item.profiles?.last_name}
        </Text>
      </View>
    </TouchableOpacity>
  )

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Communauté</Text>
        <TouchableOpacity
          style={[styles.searchButton, { backgroundColor: colors.card }]}
          onPress={() => navigation.navigate("Search")}
        >
          <Search stroke={colors.text} width={20} height={20} />
        </TouchableOpacity>
      </View>

      <View style={styles.createClubContainer}>
        <TouchableOpacity
          style={[styles.createClubButton, { backgroundColor: colors.gold }]}
          onPress={() => navigation.navigate("CreateClub")}
        >
          <Plus stroke="#FFFFFF" width={20} height={20} />
          <Text style={styles.createClubText}>Créer un club</Text>
        </TouchableOpacity>
      </View>

      {userClubs.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Mes clubs</Text>
          <FlatList
            data={userClubs}
            renderItem={renderClubItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          />
        </View>
      )}

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Clubs populaires</Text>
        <FlatList
          data={clubs}
          renderItem={renderClubItem}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchClubs} />}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Users stroke={colors.textSecondary} width={40} height={40} />
              <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
                Aucun club disponible pour le moment
              </Text>
              <Text style={[styles.emptyStateSubtext, { color: colors.textSecondary }]}>
                Créez le premier club et commencez à collaborer !
              </Text>
            </View>
          }
        />
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  createClubContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  createClubButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
  },
  createClubText: {
    color: "#FFFFFF",
    fontWeight: "600",
    marginLeft: 8,
  },
  section: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  horizontalList: {
    paddingLeft: 20,
    paddingRight: 10,
  },
  clubCard: {
    width: 280,
    borderRadius: 12,
    padding: 16,
    marginRight: 10,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  clubLogo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  clubInfo: {
    flex: 1,
  },
  clubName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  clubDomain: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
  },
  clubCreator: {
    fontSize: 12,
  },
  emptyState: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 16,
    textAlign: "center",
  },
  emptyStateSubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
  },
})

export default CommunityScreen
