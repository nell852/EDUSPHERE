"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator } from "react-native"
import { useNavigation, NavigationProp } from "@react-navigation/native"
import { useSupabase } from "../../../context/SupabaseContext"
import { useTheme } from "../../../context/ThemeContext"
import { useAuth } from "../../../context/AuthContext"
import {
  Edit2,
  Settings,
  Bell,
  FileText,
  Users,
  Book,
  LogOut,
  Moon,
  Sun,
  Shield,
  Database,
  Clock,
} from "react-native-feather"

// Définir les types pour les données de navigation
type RootStackParamList = {
  Notifications: undefined;
  PrivacySettings: undefined;
  EditProfile: undefined;
  MyJourney: undefined;
  CVGenerator: undefined;
  Colleagues: undefined;
  StorageManagement: undefined;
  History: undefined;
};

const ProfileScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { supabase } = useSupabase();
  const { colors, isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    books: 0,
    exams: 0,
    clubs: 0,
    colleagues: 0,
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchUserStats();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*, user_schools(*, schools(*), academic_levels(*))")
        .eq("id", user?.id ?? "")
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      // Books viewed
      const { count: booksCount, error: booksError } = await supabase
        .from("user_history")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user?.id ?? "")
        .eq("resource_type", "book");

      if (booksError) throw booksError;

      // Exams viewed
      const { count: examsCount, error: examsError } = await supabase
        .from("user_history")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user?.id ?? "")
        .eq("resource_type", "exam");

      if (examsError) throw examsError;

      // Clubs joined
      const { count: clubsCount, error: clubsError } = await supabase
        .from("club_members")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user?.id ?? "");

      if (clubsError) throw clubsError;

      // Colleagues/connections
      const { count: colleaguesCount, error: colleaguesError } = await supabase
        .from("connections")
        .select("*", { count: "exact", head: true })
        .or(`requester_id.eq.${user?.id},addressee_id.eq.${user?.id}`)
        .eq("status", "accepted");

      if (colleaguesError) throw colleaguesError;

      setStats({
        books: booksCount || 0,
        exams: examsCount || 0,
        clubs: clubsCount || 0,
        colleagues: colleaguesCount || 0,
      });
    } catch (error) {
      console.error("Error fetching user stats:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.gold} />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Profil</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: colors.card }]}
            onPress={() => navigation.navigate("Notifications")}
          >
            <Bell stroke={colors.text} width={20} height={20} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: colors.card }]}
            onPress={() => navigation.navigate("PrivacySettings")}
          >
            <Settings stroke={colors.text} width={20} height={20} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.profileSection}>
        <View style={styles.profileHeader}>
          <Image
            source={
              profile?.avatar_url ? { uri: profile.avatar_url } : require("../../../assets/icon.png")
            }
            style={styles.profileImage}
          />
          <TouchableOpacity
            style={[styles.editButton, { backgroundColor: colors.gold }]}
            onPress={() => navigation.navigate("EditProfile")}
          >
            <Edit2 stroke="#FFFFFF" width={16} height={16} />
          </TouchableOpacity>
        </View>

        <Text style={[styles.profileName, { color: colors.text }]}>
          {profile?.first_name} {profile?.last_name}
        </Text>
        <Text style={[styles.profileEmail, { color: colors.textSecondary }]}>{profile?.email}</Text>

        {profile?.user_schools && profile.user_schools.length > 0 && (
          <View style={[styles.schoolBadge, { backgroundColor: colors.card }]}>
            <Text style={[styles.schoolName, { color: colors.text }]}>
              {profile.user_schools[0].schools?.name || "École non spécifiée"}
            </Text>
            <Text style={[styles.academicLevel, { color: colors.gold }]}>
              {profile.user_schools[0].academic_levels?.name || ""}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <Book stroke={colors.gold} width={20} height={20} />
          <Text style={[styles.statValue, { color: colors.text }]}>{stats.books}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Livres</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <FileText stroke={colors.gold} width={20} height={20} />
          <Text style={[styles.statValue, { color: colors.text }]}>{stats.exams}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Épreuves</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <Users stroke={colors.gold} width={20} height={20} />
          <Text style={[styles.statValue, { color: colors.text }]}>{stats.clubs}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Clubs</Text>
        </View>
      </View>

      <View style={styles.menuSection}>
        <Text style={[styles.menuTitle, { color: colors.text }]}>Mon parcours</Text>

        <TouchableOpacity
          style={[styles.menuItem, { backgroundColor: colors.card }]}
          onPress={() => navigation.navigate("MyJourney")}
        >
          <View style={[styles.menuIconContainer, { backgroundColor: colors.goldLight }]}>
            <FileText stroke={colors.gold} width={20} height={20} />
          </View>
          <View style={styles.menuTextContainer}>
            <Text style={[styles.menuItemText, { color: colors.text }]}>Mon parcours académique</Text>
            <Text style={[styles.menuItemDescription, { color: colors.textSecondary }]}>
              Consultez votre progression et vos réalisations
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuItem, { backgroundColor: colors.card }]}
          onPress={() => navigation.navigate("CVGenerator")}
        >
          <View style={[styles.menuIconContainer, { backgroundColor: colors.goldLight }]}>
            <FileText stroke={colors.gold} width={20} height={20} />
          </View>
          <View style={styles.menuTextContainer}>
            <Text style={[styles.menuItemText, { color: colors.text }]}>Générateur de CV</Text>
            <Text style={[styles.menuItemDescription, { color: colors.textSecondary }]}>
              Créez un CV professionnel à partir de votre profil
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.menuSection}>
        <Text style={[styles.menuTitle, { color: colors.text }]}>Réseau</Text>

        <TouchableOpacity
          style={[styles.menuItem, { backgroundColor: colors.card }]}
          onPress={() => navigation.navigate("Colleagues")}
        >
          <View style={[styles.menuIconContainer, { backgroundColor: colors.goldLight }]}>
            <Users stroke={colors.gold} width={20} height={20} />
          </View>
          <View style={styles.menuTextContainer}>
            <Text style={[styles.menuItemText, { color: colors.text }]}>Mes collègues</Text>
            <Text style={[styles.menuItemDescription, { color: colors.textSecondary }]}>
              Gérez vos connexions et trouvez de nouveaux collègues
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.menuSection}>
        <Text style={[styles.menuTitle, { color: colors.text }]}>Paramètres</Text>

        <TouchableOpacity
          style={[styles.menuItem, { backgroundColor: colors.card }]}
          onPress={() => navigation.navigate("PrivacySettings")}
        >
          <View style={[styles.menuIconContainer, { backgroundColor: colors.goldLight }]}>
            <Shield stroke={colors.gold} width={20} height={20} />
          </View>
          <View style={styles.menuTextContainer}>
            <Text style={[styles.menuItemText, { color: colors.text }]}>Confidentialité et sécurité</Text>
            <Text style={[styles.menuItemDescription, { color: colors.textSecondary }]}>
              Gérez vos paramètres de confidentialité
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuItem, { backgroundColor: colors.card }]}
          onPress={() => navigation.navigate("StorageManagement")}
        >
          <View style={[styles.menuIconContainer, { backgroundColor: colors.goldLight }]}>
            <Database stroke={colors.gold} width={20} height={20} />
          </View>
          <View style={styles.menuTextContainer}>
            <Text style={[styles.menuItemText, { color: colors.text }]}>Gestion du stockage</Text>
            <Text style={[styles.menuItemDescription, { color: colors.textSecondary }]}>
              Gérez vos fichiers téléchargés et l'espace de stockage
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuItem, { backgroundColor: colors.card }]}
          onPress={() => navigation.navigate("History")}
        >
          <View style={[styles.menuIconContainer, { backgroundColor: colors.goldLight }]}>
            <Clock stroke={colors.gold} width={20} height={20} />
          </View>
          <View style={styles.menuTextContainer}>
            <Text style={[styles.menuItemText, { color: colors.text }]}>Historique</Text>
            <Text style={[styles.menuItemDescription, { color: colors.textSecondary }]}>
              Consultez votre historique d'activité
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.menuItem, { backgroundColor: colors.card }]} onPress={toggleTheme}>
          <View style={[styles.menuIconContainer, { backgroundColor: colors.goldLight }]}>
            {isDark ? (
              <Sun stroke={colors.gold} width={20} height={20} />
            ) : (
              <Moon stroke={colors.gold} width={20} height={20} />
            )}
          </View>
          <View style={styles.menuTextContainer}>
            <Text style={[styles.menuItemText, { color: colors.text }]}>{isDark ? "Mode clair" : "Mode sombre"}</Text>
            <Text style={[styles.menuItemDescription, { color: colors.textSecondary }]}>
              Changer l'apparence de l'application
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.menuItem, { backgroundColor: colors.card }]} onPress={handleLogout}>
          <View style={[styles.menuIconContainer, { backgroundColor: colors.error + "20" }]}>
            <LogOut stroke={colors.error} width={20} height={20} />
          </View>
          <View style={styles.menuTextContainer}>
            <Text style={[styles.menuItemText, { color: colors.error }]}>Déconnexion</Text>
            <Text style={[styles.menuItemDescription, { color: colors.textSecondary }]}>
              Se déconnecter de l'application
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: colors.textSecondary }]}>EduSphere v1.0.0</Text>
        <Text style={[styles.footerText, { color: colors.textSecondary }]}>© 2023 Collège de Paris</Text>
      </View>
    </ScrollView>
  );
};

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
  profileSection: {
    alignItems: "center",
    paddingVertical: 20,
  },
  profileHeader: {
    position: "relative",
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  editButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  profileName: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    marginBottom: 12,
  },
  schoolBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    alignItems: "center",
  },
  schoolName: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2,
  },
  academicLevel: {
    fontSize: 12,
    fontWeight: "500",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginVertical: 20,
  },
  statCard: {
    width: "30%",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 8,
  },
  statLabel: {
    fontSize: 12,
  },
  menuSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  menuItemDescription: {
    fontSize: 12,
  },
  footer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  footerText: {
    fontSize: 12,
    marginBottom: 4,
  },
});

export default ProfileScreen;
