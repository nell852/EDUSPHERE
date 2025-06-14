"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator } from "react-native"
import { useNavigation } from "@react-navigation/native"
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useSupabase } from "../../../context/SupabaseContext"
import { useTheme } from "../../../context/ThemeContext"
import { Search, ChevronRight } from "react-native-feather"
type RootStackParamList = {
  ExamBank: { schoolId: string; schoolName: string }
  // ...add other screens if needed
}

const SchoolSelectionScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const { supabase } = useSupabase()
  const { colors } = useTheme()

  const [schools, setSchools] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    fetchSchools()
  }, [])

  const fetchSchools = async () => {
    try {
      const { data, error } = await supabase.from("schools").select("*").order("name")

      if (error) throw error
      setSchools(data || [])
    } catch (error) {
      console.error("Error fetching schools:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredSchools = searchQuery
    ? schools.filter((school) => school.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : schools

  const renderSchoolItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[styles.schoolCard, { backgroundColor: colors.card }]}
      onPress={() => navigation.navigate("ExamBank", { schoolId: item.id, schoolName: item.name })}
    >
      <Image
        source={item.logo_url ? { uri: item.logo_url } : require("../../../assets/icon.png")}
        style={styles.schoolLogo}
      />
      <View style={styles.schoolInfo}>
        <Text style={[styles.schoolName, { color: colors.text }]}>{item.name}</Text>
        {item.description && (
          <Text style={[styles.schoolDescription, { color: colors.textSecondary }]} numberOfLines={2}>
            {item.description}
          </Text>
        )}
      </View>
      <ChevronRight stroke={colors.textSecondary} width={20} height={20} />
    </TouchableOpacity>
  )

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Sélectionnez une école</Text>
      </View>

      <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
        <Search stroke={colors.textSecondary} width={20} height={20} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Rechercher une école..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.gold} />
        </View>
      ) : (
        <FlatList
          data={filteredSchools}
          renderItem={renderSchoolItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.schoolsList}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
                {searchQuery ? "Aucune école ne correspond à votre recherche" : "Aucune école disponible"}
              </Text>
            </View>
          }
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginVertical: 16,
    paddingHorizontal: 16,
    height: 48,
    borderRadius: 24,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  schoolsList: {
    padding: 20,
  },
  schoolCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  schoolLogo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 16,
  },
  schoolInfo: {
    flex: 1,
  },
  schoolName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  schoolDescription: {
    fontSize: 14,
  },
  emptyState: {
    padding: 20,
    alignItems: "center",
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: "center",
  },
})

import { TextInput as RNTextInput } from "react-native"

// Add TextInput component
const TextInput = ({ style, ...props }: { style?: any; [key: string]: any }) => {
  return (
    <RNTextInput
      style={style}
      {...props}
    />
  )
}

export default SchoolSelectionScreen
