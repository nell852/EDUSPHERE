"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, TextInput, RefreshControl } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { useSupabase } from "../../../context/SupabaseContext"
import { useTheme } from "../../../context/ThemeContext"
import { useScreenCapture } from "../../../context/ScreenCaptureContext"
import { Search, Filter, AlertTriangle } from "react-native-feather"

const LibraryScreen = () => {
  const navigation = useNavigation<any>()
  const { supabase } = useSupabase()
  const { colors } = useTheme()
  const { isProtectionEnabled, enableProtection, isScreenCaptured } = useScreenCapture()

  const [books, setBooks] = useState<any[]>([])
  const [filteredBooks, setFilteredBooks] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [domains, setDomains] = useState<string[]>([])

  useEffect(() => {
    // Enable screen capture protection for library content
    enableProtection()
    fetchBooks()
  }, [])

  useEffect(() => {
    // Filter books based on search query and selected domain
    let result = books

    if (searchQuery) {
      result = result.filter(
        (book) =>
          book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (book.author && book.author.toLowerCase().includes(searchQuery.toLowerCase())),
      )
    }

    if (selectedDomain) {
      result = result.filter((book) => book.domain === selectedDomain)
    }

    setFilteredBooks(result)
  }, [searchQuery, selectedDomain, books])

  const fetchBooks = async () => {
    setRefreshing(true)
    try {
      const { data, error } = await supabase.from("books").select("*").order("created_at", { ascending: false })

      if (error) throw error

      setBooks(data || [])

      // Extract unique domains
      const uniqueDomains = Array.from(new Set((data || []).map((book) => book.domain)))
      setDomains(uniqueDomains as string[])
    } catch (error) {
      console.error("Error fetching books:", error)
    } finally {
      setRefreshing(false)
    }
  }

  const onRefresh = () => {
    fetchBooks()
  }

  const renderBookItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[styles.bookCard, { backgroundColor: colors.card }]}
      onPress={() => navigation.navigate("BookDetail", { bookId: item.id })}
    >
      <Image
        source={item.cover_url ? { uri: item.cover_url } : require("../../../assets/icon.png")}
        style={styles.bookCover}
      />
      <View style={styles.bookInfo}>
        <Text style={[styles.bookTitle, { color: colors.text }]} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={[styles.bookAuthor, { color: colors.textSecondary }]} numberOfLines={1}>
          {item.author || "Auteur inconnu"}
        </Text>
        <View style={styles.bookMeta}>
          <Text style={[styles.bookDomain, { backgroundColor: colors.gold, color: "#FFFFFF" }]}>{item.domain}</Text>
          {item.is_new && (
            <Text style={[styles.bookNew, { backgroundColor: colors.info, color: "#FFFFFF" }]}>Nouveau</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  )

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
        <Text style={[styles.title, { color: colors.text }]}>Bibliothèque</Text>
      </View>

      {/* Search bar */}
      <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
        <Search stroke={colors.textSecondary} width={20} height={20} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Rechercher un livre..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Domain filters */}
      <View style={styles.filtersContainer}>
        <View style={styles.filterHeader}>
          <Filter stroke={colors.text} width={16} height={16} />
          <Text style={[styles.filterTitle, { color: colors.text }]}>Filtrer par domaine</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.domainFilters}
          children={
            <>
              <TouchableOpacity
                style={[
                  styles.domainChip,
                  {
                    backgroundColor: selectedDomain === null ? colors.gold : colors.card,
                  },
                ]}
                onPress={() => setSelectedDomain(null)}
              >
                <Text
                  style={[
                    styles.domainChipText,
                    {
                      color: selectedDomain === null ? "#FFFFFF" : colors.text,
                    },
                  ]}
                >
                  Tous
                </Text>
              </TouchableOpacity>
              {domains.map((domain) => (
                <TouchableOpacity
                  key={domain}
                  style={[
                    styles.domainChip,
                    {
                      backgroundColor: selectedDomain === domain ? colors.gold : colors.card,
                    },
                  ]}
                  onPress={() => setSelectedDomain(domain === selectedDomain ? null : domain)}
                >
                  <Text
                    style={[
                      styles.domainChipText,
                      {
                        color: selectedDomain === domain ? "#FFFFFF" : colors.text,
                      },
                    ]}
                  >
                    {domain}
                  </Text>
                </TouchableOpacity>
              ))}
            </>
          }
        />
      </View>

      {/* Books list */}
      <FlatList
        data={filteredBooks}
        renderItem={renderBookItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.booksList}
        columnWrapperStyle={styles.booksRow}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
              {searchQuery || selectedDomain
                ? "Aucun livre ne correspond à votre recherche"
                : "Aucun livre disponible pour le moment"}
            </Text>
          </View>
        }
      />
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
  filtersContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  filterHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  filterTitle: {
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 6,
  },
  domainFilters: {
    paddingRight: 20,
  },
  domainChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
  },
  domainChipText: {
    fontSize: 14,
    fontWeight: "500",
  },
  booksList: {
    padding: 10,
  },
  booksRow: {
    justifyContent: "space-between",
    paddingHorizontal: 10,
  },
  bookCard: {
    width: "48%",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
  },
  bookCover: {
    width: "100%",
    height: 180,
    resizeMode: "cover",
  },
  bookInfo: {
    padding: 12,
  },
  bookTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  bookAuthor: {
    fontSize: 12,
    marginBottom: 8,
  },
  bookMeta: {
    flexDirection: "row",
  },
  bookDomain: {
    fontSize: 10,
    fontWeight: "bold",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: "hidden",
    marginRight: 4,
  },
  bookNew: {
    fontSize: 10,
    fontWeight: "bold",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: "hidden",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    height: 300,
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: "center",
  },
})

// Add ScrollView component for domain filters
const ScrollView = ({ children, ...props }: { children: React.ReactNode; [key: string]: any }) => {
  return (
    <FlatList
      horizontal
      showsHorizontalScrollIndicator={false}
      data={[{ key: "content" }]}
      renderItem={() => <View>{children}</View>}
      {...props}
    />
  )
}

export default LibraryScreen
