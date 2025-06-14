"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, ScrollView } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { Ionicons, MaterialIcons } from "@expo/vector-icons"
import { useTheme } from "../../../context/ThemeContext"
import { useSupabase } from "../../../context/SupabaseContext"
import { useAuth } from "../../../context/AuthContext"
import CustomHeader from "../../../components/CustomHeader"
import { formatDate } from "../../../utils/dateUtils"

type HistoryItem = {
  id: string
  type: "course" | "exam" | "project" | "workshop"
  title: string
  timestamp: string
  details: string
  score?: number
  duration?: number
}

const HistoryScreen = () => {
  const navigation = useNavigation()
  const { theme } = useTheme()
  const { supabase } = useSupabase()
  const { user } = useAuth()

  const [history, setHistory] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState<string | null>(null)

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    try {
      setLoading(true)

      // In a real app, this would fetch from Supabase
      // For this demo, we'll use mock data
      const mockHistory: HistoryItem[] = [
        {
          id: "1",
          type: "course",
          title: "Introduction à React Native",
          timestamp: "2023-06-15T10:30:00Z",
          details: "Cours terminé avec succès",
          duration: 120,
        },
        {
          id: "2",
          type: "exam",
          title: "Examen de mi-semestre: Développement Mobile",
          timestamp: "2023-06-10T14:00:00Z",
          details: "Examen complété",
          score: 85,
        },
        {
          id: "3",
          type: "project",
          title: "Projet de groupe: Application de fitness",
          timestamp: "2023-06-05T09:15:00Z",
          details: "Contribution au projet",
        },
        {
          id: "4",
          type: "workshop",
          title: "Atelier sur les API RESTful",
          timestamp: "2023-05-28T13:45:00Z",
          details: "Participation active",
          duration: 90,
        },
        {
          id: "5",
          type: "course",
          title: "Bases de données NoSQL",
          timestamp: "2023-05-20T11:00:00Z",
          details: "Cours terminé avec succès",
          duration: 150,
        },
        {
          id: "6",
          type: "exam",
          title: "Quiz: JavaScript Avancé",
          timestamp: "2023-05-15T10:00:00Z",
          details: "Quiz complété",
          score: 92,
        },
      ]

      setHistory(mockHistory)
    } catch (error) {
      console.error("Error fetching history:", error)
    } finally {
      setLoading(false)
    }
  }

  const getFilteredHistory = () => {
    if (!activeFilter) return history
    return history.filter((item) => item.type === activeFilter)
  }

  const renderHistoryItem = ({ item }: { item: HistoryItem }) => {
    const getIconName = () => {
      switch (item.type) {
        case "course":
          return "book-outline"
        case "exam":
          return "document-text-outline"
        case "project":
          return "briefcase-outline"
        case "workshop":
          return "people-outline"
        default:
          return "time-outline"
      }
    }

    const getIconColor = () => {
      switch (item.type) {
        case "course":
          return "#4CAF50"
        case "exam":
          return "#F44336"
        case "project":
          return "#2196F3"
        case "workshop":
          return "#FF9800"
        default:
          return theme.primary
      }
    }

    return (
      <TouchableOpacity
        style={[styles.historyItem, { backgroundColor: theme.cardBackground }]}
        onPress={() => {
          // Navigate to detail screen based on type
          if (item.type === "project") {
            navigation.navigate("ProjectDetail", { projectId: item.id })
          } else {
            // For other types, show details in an alert for now
            alert(`Détails de "${item.title}": ${item.details}`)
          }
        }}
      >
        <View style={[styles.iconContainer, { backgroundColor: `${getIconColor()}20` }]}>
          <Ionicons name={getIconName()} size={24} color={getIconColor()} />
        </View>

        <View style={styles.contentContainer}>
          <Text style={[styles.itemTitle, { color: theme.text }]} numberOfLines={1}>
            {item.title}
          </Text>

          <Text style={[styles.itemDetails, { color: theme.textSecondary }]}>{item.details}</Text>

          <View style={styles.itemMeta}>
            <Text style={[styles.itemDate, { color: theme.textSecondary }]}>{formatDate(item.timestamp)}</Text>

            {item.score !== undefined && (
              <View style={styles.scoreContainer}>
                <MaterialIcons name="score" size={16} color={theme.textSecondary} />
                <Text style={[styles.scoreText, { color: theme.textSecondary }]}>{item.score}%</Text>
              </View>
            )}

            {item.duration !== undefined && (
              <View style={styles.durationContainer}>
                <Ionicons name="time-outline" size={16} color={theme.textSecondary} />
                <Text style={[styles.durationText, { color: theme.textSecondary }]}>
                  {Math.floor(item.duration / 60)}h{item.duration % 60 > 0 ? ` ${item.duration % 60}m` : ""}
                </Text>
              </View>
            )}
          </View>
        </View>

        <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
      </TouchableOpacity>
    )
  }

  const renderFilterChip = (type: string, label: string, iconName: string) => {
    const isActive = activeFilter === type

    return (
      <TouchableOpacity
        style={[
          styles.filterChip,
          {
            backgroundColor: isActive ? theme.primary : theme.cardBackground,
            borderColor: isActive ? theme.primary : theme.border,
          },
        ]}
        onPress={() => setActiveFilter(isActive ? null : type)}
      >
        <Ionicons
          name={iconName}
          size={16}
          color={isActive ? "white" : theme.textSecondary}
          style={styles.filterIcon}
        />
        <Text style={[styles.filterLabel, { color: isActive ? "white" : theme.text }]}>{label}</Text>
      </TouchableOpacity>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <CustomHeader title="Historique d'activités" showBackButton onBackPress={() => navigation.goBack()} />

      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScrollView}>
          {renderFilterChip("course", "Cours", "book-outline")}
          {renderFilterChip("exam", "Examens", "document-text-outline")}
          {renderFilterChip("project", "Projets", "briefcase-outline")}
          {renderFilterChip("workshop", "Ateliers", "people-outline")}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Chargement de l'historique...</Text>
        </View>
      ) : (
        <FlatList
          data={getFilteredHistory()}
          renderItem={renderHistoryItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="time-outline" size={64} color={theme.textSecondary} />
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>Aucune activité trouvée</Text>
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
  filtersContainer: {
    paddingVertical: 12,
  },
  filtersScrollView: {
    paddingHorizontal: 16,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  filterIcon: {
    marginRight: 4,
  },
  filterLabel: {
    fontWeight: "500",
  },
  listContainer: {
    padding: 16,
  },
  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  contentContainer: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  itemDetails: {
    fontSize: 14,
    marginBottom: 8,
  },
  itemMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  itemDate: {
    fontSize: 12,
    marginRight: 12,
  },
  scoreContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
  },
  scoreText: {
    fontSize: 12,
    marginLeft: 4,
  },
  durationContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  durationText: {
    fontSize: 12,
    marginLeft: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
  },
})

export default HistoryScreen
