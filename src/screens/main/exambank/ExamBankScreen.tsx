"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from "react-native"
import { useRoute, useNavigation } from "@react-navigation/native"
import type { StackNavigationProp } from "@react-navigation/stack"
import { useSupabase } from "../../../context/SupabaseContext"
import { useTheme } from "../../../context/ThemeContext"
import { ChevronLeft, Filter, FileText } from "react-native-feather"
type RootStackParamList = {
  ExamDetail: { examId: string }
  // ...add other routes if needed
}

const ExamBankScreen = () => {
  const route = useRoute()
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>()
  const { supabase } = useSupabase()
  const { colors } = useTheme()

  const { schoolId, schoolName } = route.params as { schoolId: string; schoolName: string }

  const [exams, setExams] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [academicLevels, setAcademicLevels] = useState<any[]>([])
  const [subjects, setSubjects] = useState<string[]>([])
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null)
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null)

  useEffect(() => {
    fetchExams()
    fetchAcademicLevels()
  }, [])

  const fetchExams = async () => {
    try {
      const { data, error } = await supabase
        .from("exams")
        .select("*, academic_levels(*)")
        .eq("school_id", schoolId)
        .order("created_at", { ascending: false })

      if (error) throw error

      setExams(data || [])

      // Extract unique subjects
      const uniqueSubjects = Array.from(new Set((data || []).map((exam) => exam.subject)))
      setSubjects(uniqueSubjects as string[])
    } catch (error) {
      console.error("Error fetching exams:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAcademicLevels = async () => {
    try {
      const { data, error } = await supabase.from("academic_levels").select("*").order("name")

      if (error) throw error
      setAcademicLevels(data || [])
    } catch (error) {
      console.error("Error fetching academic levels:", error)
    }
  }

  const filteredExams = exams.filter((exam) => {
    if (selectedLevel && exam.academic_level_id !== selectedLevel) {
      return false
    }
    if (selectedSubject && exam.subject !== selectedSubject) {
      return false
    }
    return true
  })

  const renderExamItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[styles.examCard, { backgroundColor: colors.card }]}
      onPress={() => navigation.navigate("ExamDetail", { examId: item.id })}
    >
      <View style={[styles.examIconContainer, { backgroundColor: colors.goldLight }]}>
        <FileText stroke={colors.gold} width={24} height={24} />
      </View>
      <View style={styles.examInfo}>
        <Text style={[styles.examTitle, { color: colors.text }]}>{item.title}</Text>
        <Text style={[styles.examSubject, { color: colors.gold }]}>{item.subject}</Text>
        <View style={styles.examMeta}>
          <Text style={[styles.examLevel, { color: colors.textSecondary }]}>
            {item.academic_levels?.name || "Niveau inconnu"}
          </Text>
          {item.year && <Text style={[styles.examYear, { color: colors.textSecondary }]}> • {item.year}</Text>}
        </View>
      </View>
    </TouchableOpacity>
  )

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft stroke={colors.text} width={24} height={24} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
          {schoolName}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.filtersContainer}>
        <View style={styles.filterHeader}>
          <Filter stroke={colors.text} width={16} height={16} />
          <Text style={[styles.filterTitle, { color: colors.text }]}>Filtres</Text>
        </View>

        <Text style={[styles.filterLabel, { color: colors.textSecondary }]}>Niveau académique</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterChips}>
          <TouchableOpacity
            style={[
              styles.filterChip,
              {
                backgroundColor: selectedLevel === null ? colors.gold : colors.card,
              },
            ]}
            onPress={() => setSelectedLevel(null)}
          >
            <Text
              style={[
                styles.filterChipText,
                {
                  color: selectedLevel === null ? "#FFFFFF" : colors.text,
                },
              ]}
            >
              Tous
            </Text>
          </TouchableOpacity>
          {academicLevels.map((level) => (
            <TouchableOpacity
              key={level.id}
              style={[
                styles.filterChip,
                {
                  backgroundColor: selectedLevel === level.id ? colors.gold : colors.card,
                },
              ]}
              onPress={() => setSelectedLevel(selectedLevel === level.id ? null : level.id)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  {
                    color: selectedLevel === level.id ? "#FFFFFF" : colors.text,
                  },
                ]}
              >
                {level.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={[styles.filterLabel, { color: colors.textSecondary }]}>Matière</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterChips}>
          <TouchableOpacity
            style={[
              styles.filterChip,
              {
                backgroundColor: selectedSubject === null ? colors.gold : colors.card,
              },
            ]}
            onPress={() => setSelectedSubject(null)}
          >
            <Text
              style={[
                styles.filterChipText,
                {
                  color: selectedSubject === null ? "#FFFFFF" : colors.text,
                },
              ]}
            >
              Toutes
            </Text>
          </TouchableOpacity>
          {subjects.map((subject) => (
            <TouchableOpacity
              key={subject}
              style={[
                styles.filterChip,
                {
                  backgroundColor: selectedSubject === subject ? colors.gold : colors.card,
                },
              ]}
              onPress={() => setSelectedSubject(selectedSubject === subject ? null : subject)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  {
                    color: selectedSubject === subject ? "#FFFFFF" : colors.text,
                  },
                ]}
              >
                {subject}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.gold} />
        </View>
      ) : (
        <FlatList
          data={filteredExams}
          renderItem={renderExamItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.examsList}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
                {selectedLevel || selectedSubject
                  ? "Aucune épreuve ne correspond à vos filtres"
                  : "Aucune épreuve disponible pour cette école"}
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
    fontSize: 20,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
  },
  filtersContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  filterHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  filterLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  filterChips: {
    paddingBottom: 16,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: "500",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  examsList: {
    padding: 20,
  },
  examCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  examIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  examInfo: {
    flex: 1,
  },
  examTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  examSubject: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
  },
  examMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  examLevel: {
    fontSize: 12,
  },
  examYear: {
    fontSize: 12,
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

// Add ScrollView component
import type { ReactNode } from "react"

const ScrollView = ({
  children,
  ...props
}: { children: React.ReactNode } & any) => {
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

export default ExamBankScreen
