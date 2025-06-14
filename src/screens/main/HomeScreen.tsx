"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, RefreshControl, FlatList } from "react-native"
import { useNavigation, NavigationProp } from "@react-navigation/native"
import { useAuth } from "../../context/AuthContext"
import { useTheme } from "../../context/ThemeContext"
import { useSupabase } from "../../context/SupabaseContext"
import { Search, Bell, BookOpen, FileText, Users } from "react-native-feather"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

// Définir les types pour les données
type RootStackParamList = {
  LibraryTab: { screen: string; params: { bookId: string } };
  ExamBankTab: { screen: string; params: { examId: string } };
  ProfileTab: { screen: string };
  Search: undefined;
  CommunityTab: undefined;
  Notifications: undefined;
  BookDetail: { bookId: string };
  ExamDetail: { examId: string };
};

type Book = {
  id: string;
  title: string;
  author?: string;
  domain: string;
  is_new?: boolean;
  cover_url?: string;
  created_at?: string;
  description?: string;
  file_url: string;
  sub_domain?: string;
  updated_at?: string;
  is_popular?: boolean;
};

type Exam = {
  id: string;
  title: string;
  schools?: { name: string };
  academic_levels?: { name: string };
  subject: string;
  academic_level_id?: string;
  created_at?: string;
  description?: string;
  file_url: string;
  is_new?: boolean;
  school_id?: string;
};

type Event = {
  id: string;
  title: string;
  date: Date;
  location?: string;
  type: "workshop" | "conference" | "deadline";
};

type Notification = {
  id: string;
  user_id: string;
  is_read: boolean;
  created_at: string;
  action_url?: string;
  content: string;
  source_id?: string;
  source_type?: string;
  type: string;
};

type Profile = {
  id: string;
  first_name: string;
  user_schools: Array<{
    schools: any;
    academic_levels: any;
  }>;
};

type ApiBook = {
  author: string | null;
  cover_url: string | null;
  created_at: string | null;
  description: string | null;
  domain: string;
  file_url: string;
  id: string;
  is_new: boolean | null;
  is_popular: boolean | null;
  sub_domain: string | null;
  title: string;
  updated_at: string | null;
};

type ApiExam = {
  academic_level_id: string | null;
  created_at: string | null;
  description: string | null;
  file_url: string;
  id: string;
  is_new: boolean | null;
  school_id: string | null;
  subject: string;
  title: string;
  schools: {
    created_at: string | null;
    description: string | null;
    id: string;
    logo_url: string | null;
    name: string;
  } | null;
  academic_levels: {
    name: string;
  } | null;
};

type ApiNotification = {
  action_url: string | null;
  content: string;
  created_at: string | null;
  id: string;
  is_read: boolean | null;
  source_id: string | null;
  source_type: string | null;
  type: string;
  user_id: string;
};

const HomeScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { user } = useAuth();
  const { colors } = useTheme();
  const { supabase } = useSupabase();

  const [refreshing, setRefreshing] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [recentBooks, setRecentBooks] = useState<Book[]>([]);
  const [recentExams, setRecentExams] = useState<Exam[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const mapApiBookToBook = (apiBook: ApiBook): Book => ({
    id: apiBook.id,
    title: apiBook.title,
    author: apiBook.author ?? undefined,
    domain: apiBook.domain,
    is_new: apiBook.is_new ?? undefined,
    cover_url: apiBook.cover_url ?? undefined,
    created_at: apiBook.created_at ?? undefined,
    description: apiBook.description ?? undefined,
    file_url: apiBook.file_url,
    sub_domain: apiBook.sub_domain ?? undefined,
    updated_at: apiBook.updated_at ?? undefined,
    is_popular: apiBook.is_popular ?? undefined,
  });

  const mapApiExamToExam = (apiExam: ApiExam): Exam => ({
    id: apiExam.id,
    title: apiExam.title,
    schools: apiExam.schools ? { name: apiExam.schools.name } : undefined,
    academic_levels: apiExam.academic_levels ? { name: apiExam.academic_levels.name } : undefined,
    subject: apiExam.subject,
    academic_level_id: apiExam.academic_level_id ?? undefined,
    created_at: apiExam.created_at ?? undefined,
    description: apiExam.description ?? undefined,
    file_url: apiExam.file_url,
    is_new: apiExam.is_new ?? undefined,
    school_id: apiExam.school_id ?? undefined,
  });

  const mapApiNotificationToNotification = (apiNotification: ApiNotification): Notification => ({
    id: apiNotification.id,
    user_id: apiNotification.user_id,
    is_read: apiNotification.is_read ?? false,
    created_at: apiNotification.created_at ?? '',
    action_url: apiNotification.action_url ?? undefined,
    content: apiNotification.content,
    source_id: apiNotification.source_id ?? undefined,
    source_type: apiNotification.source_type ?? undefined,
    type: apiNotification.type,
  });

  const fetchData = async () => {
    setRefreshing(true);
    try {
      // Fetch user profile
      if (user) {
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*, user_schools(*, schools(*), academic_levels(*))")
          .eq("id", user.id)
          .single();

        if (profileError) throw profileError;
        setProfile(profileData);
      }

      // Fetch recent books
      const { data: booksData, error: booksError } = await supabase
        .from("books")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);

      if (booksError) throw booksError;
      setRecentBooks(booksData.map(mapApiBookToBook));

      // Fetch recent exams
      const { data: examsData, error: examsError } = await supabase
        .from("exams")
        .select("*, schools(*), academic_levels(*)")
        .order("created_at", { ascending: false })
        .limit(5);

      if (examsError) throw examsError;
      setRecentExams(examsData.map(mapApiExamToExam));

      // Fetch notifications
      if (user) {
        const { data: notificationsData, error: notificationsError } = await supabase
          .from("notifications")
          .select("*")
          .eq("user_id", user.id)
          .eq("is_read", false)
          .order("created_at", { ascending: false })
          .limit(5);

        if (notificationsError) throw notificationsError;
        setNotifications(notificationsData.map(mapApiNotificationToNotification));
      }

      // Mock upcoming events (would come from a real API)
      setUpcomingEvents([
        {
          id: "1",
          title: "Atelier JavaScript Avancé",
          date: new Date(Date.now() + 86400000 * 2), // 2 days from now
          location: "Salle 302",
          type: "workshop",
        },
        {
          id: "2",
          title: "Conférence Cybersécurité",
          date: new Date(Date.now() + 86400000 * 5), // 5 days from now
          location: "Amphithéâtre A",
          type: "conference",
        },
        {
          id: "3",
          title: "Deadline Projet Tutoré",
          date: new Date(Date.now() + 86400000 * 10), // 10 days from now
          type: "deadline",
        },
      ]);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    fetchData();
  };

  const renderBookItem = ({ item }: { item: Book }) => (
    <TouchableOpacity
      style={[styles.bookCard, { backgroundColor: colors.card }]}
      onPress={() => navigation.navigate("LibraryTab", { screen: "BookDetail", params: { bookId: item.id } })}
    >
      <Image
        source={item.cover_url ? { uri: item.cover_url } : require("../../assets/icon.png")}
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
  );

  const renderExamItem = ({ item }: { item: Exam }) => (
    <TouchableOpacity
      style={[styles.examCard, { backgroundColor: colors.card }]}
      onPress={() => navigation.navigate("ExamBankTab", { screen: "ExamDetail", params: { examId: item.id } })}
    >
      <View style={styles.examIconContainer}>
        <FileText stroke={colors.gold} width={24} height={24} />
      </View>
      <View style={styles.examInfo}>
        <Text style={[styles.examTitle, { color: colors.text }]} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={[styles.examSchool, { color: colors.textSecondary }]} numberOfLines={1}>
          {item.schools?.name || "École inconnue"} • {item.academic_levels?.name || "Niveau inconnu"}
        </Text>
        <Text style={[styles.examSubject, { color: colors.gold }]}>{item.subject}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderEventItem = ({ item }: { item: Event }) => (
    <View style={[styles.eventCard, { backgroundColor: colors.card }]}>
      <View style={styles.eventDateContainer}>
        <Text style={[styles.eventDay, { color: colors.text }]}>{format(item.date, "dd")}</Text>
        <Text style={[styles.eventMonth, { color: colors.textSecondary }]}>
          {format(item.date, "MMM", { locale: fr })}
        </Text>
      </View>
      <View style={styles.eventInfo}>
        <Text style={[styles.eventTitle, { color: colors.text }]}>{item.title}</Text>
        {item.location && <Text style={[styles.eventLocation, { color: colors.textSecondary }]}>{item.location}</Text>}
        <View
          style={[
            styles.eventType,
            {
              backgroundColor:
                item.type === "workshop" ? colors.info : item.type === "conference" ? colors.success : colors.warning,
            },
          ]}
        >
          <Text style={styles.eventTypeText}>
            {item.type === "workshop" ? "Atelier" : item.type === "conference" ? "Conférence" : "Date limite"}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: colors.text }]}>Bonjour, {profile?.first_name || "Étudiant"}</Text>
          <Text style={[styles.date, { color: colors.textSecondary }]}>
            {format(new Date(), "EEEE d MMMM yyyy", { locale: fr })}
          </Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: colors.card }]}
            onPress={() => navigation.navigate("Search")}
          >
            <Search stroke={colors.text} width={20} height={20} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: colors.card }]}
            onPress={() => navigation.navigate("ProfileTab", { screen: "Notifications" })}
          >
            <Bell stroke={colors.text} width={20} height={20} />
            {notifications.length > 0 && (
              <View style={[styles.notificationBadge, { backgroundColor: colors.notification }]}>
                <Text style={styles.notificationCount}>{notifications.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Quick Access */}
      <View style={styles.quickAccessContainer}>
        <TouchableOpacity
          style={[styles.quickAccessButton, { backgroundColor: colors.card }]}
          onPress={() => navigation.navigate("LibraryTab" as never)}
        >
          <View style={[styles.quickAccessIcon, { backgroundColor: colors.goldLight }]}>
            <BookOpen stroke={colors.gold} width={24} height={24} />
          </View>
          <Text style={[styles.quickAccessText, { color: colors.text }]}>Bibliothèque</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.quickAccessButton, { backgroundColor: colors.card }]}
          onPress={() => navigation.navigate("ExamBankTab" as never)}
        >
          <View style={[styles.quickAccessIcon, { backgroundColor: colors.goldLight }]}>
            <FileText stroke={colors.gold} width={24} height={24} />
          </View>
          <Text style={[styles.quickAccessText, { color: colors.text }]}>Épreuves</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.quickAccessButton, { backgroundColor: colors.card }]}
          onPress={() => navigation.navigate("CommunityTab" as never)}
        >
          <View style={[styles.quickAccessIcon, { backgroundColor: colors.goldLight }]}>
            <Users stroke={colors.gold} width={24} height={24} />
          </View>
          <Text style={[styles.quickAccessText, { color: colors.text }]}>Communauté</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Books */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Livres récents</Text>
          <TouchableOpacity onPress={() => navigation.navigate("LibraryTab" as never)}>
            <Text style={[styles.seeAllText, { color: colors.gold }]}>Voir tout</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={recentBooks}
          renderItem={renderBookItem}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.booksList}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
                Aucun livre disponible pour le moment
              </Text>
            </View>
          }
        />
      </View>

      {/* Recent Exams */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Épreuves récentes</Text>
          <TouchableOpacity onPress={() => navigation.navigate("ExamBankTab" as never)}>
            <Text style={[styles.seeAllText, { color: colors.gold }]}>Voir tout</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={recentExams}
          renderItem={renderExamItem}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.examsList}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
                Aucune épreuve disponible pour le moment
              </Text>
            </View>
          }
        />
      </View>

      {/* Upcoming Events */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Événements à venir</Text>
        </View>

        {upcomingEvents.map((event) => (
          <TouchableOpacity key={event.id} onPress={() => {}}>
            {renderEventItem({ item: event })}
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

// Les styles restent inchangés
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
  greeting: {
    fontSize: 24,
    fontWeight: "bold",
  },
  date: {
    fontSize: 14,
    marginTop: 4,
  },
  headerActions: {
    flexDirection: "row",
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
  },
  notificationBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
  },
  notificationCount: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "bold",
  },
  quickAccessContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: 20,
  },
  quickAccessButton: {
    width: "30%",
    height: 100,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    padding: 12,
  },
  quickAccessIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  quickAccessText: {
    fontSize: 12,
    fontWeight: "500",
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: "500",
  },
  booksList: {
    paddingRight: 20,
  },
  bookCard: {
    width: 160,
    borderRadius: 12,
    overflow: "hidden",
    marginRight: 16,
  },
  bookCover: {
    width: "100%",
    height: 120,
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
  examsList: {
    paddingRight: 20,
  },
  examCard: {
    width: 200,
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  examIconContainer: {
    marginRight: 12,
  },
  examInfo: {
    flex: 1,
  },
  examTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  examSchool: {
    fontSize: 12,
    marginBottom: 4,
  },
  examSubject: {
    fontSize: 12,
    fontWeight: "500",
  },
  eventCard: {
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  eventDateContainer: {
    alignItems: "center",
    marginRight: 16,
  },
  eventDay: {
    fontSize: 24,
    fontWeight: "bold",
  },
  eventMonth: {
    fontSize: 12,
    textTransform: "uppercase",
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  eventLocation: {
    fontSize: 14,
    marginBottom: 8,
  },
  eventType: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  eventTypeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "500",
  },
  emptyState: {
    width: 300,
    height: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyStateText: {
    fontSize: 14,
    textAlign: "center",
  },
});

export default HomeScreen;
