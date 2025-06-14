"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Switch, ActivityIndicator } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../../../context/ThemeContext"
import { useSupabase } from "../../../context/SupabaseContext"
import { useAuth } from "../../../context/AuthContext"
import CustomHeader from "../../../components/CustomHeader"
import { formatTimeAgo } from "../../../utils/dateUtils"

type Notification = {
  id: string
  type: "message" | "assignment" | "announcement" | "grade" | "reminder"
  title: string
  body: string
  timestamp: string
  read: boolean
  actionable: boolean
  actionText?: string
  actionRoute?: string
  actionParams?: any
}

type NotificationSetting = {
  id: string
  type: string
  title: string
  enabled: boolean
  description: string
}

const NotificationsScreen = () => {
  const navigation = useNavigation()
  const { theme } = useTheme()
  const { supabase } = useSupabase()
  const { user } = useAuth()

  const [notifications, setNotifications] = useState<Notification[]>([])
  const [settings, setSettings] = useState<NotificationSetting[]>([])
  const [loading, setLoading] = useState(true)
  const [showSettings, setShowSettings] = useState(false)

  useEffect(() => {
    fetchNotifications()
    fetchSettings()
  }, [])

  const fetchNotifications = async () => {
    try {
      setLoading(true)

      // In a real app, this would fetch from Supabase
      // For this demo, we'll use mock data
      const mockNotifications: Notification[] = [
        {
          id: "1",
          type: "message",
          title: "Nouveau message",
          body: "Vous avez reçu un message de Prof. Martin concernant votre projet.",
          timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
          read: false,
          actionable: true,
          actionText: "Voir le message",
          actionRoute: "Chat",
          actionParams: { contactId: "123" },
        },
        {
          id: "2",
          type: "assignment",
          title: "Devoir à rendre",
          body: "Rappel: Le rapport de projet est à rendre avant demain 23h59.",
          timestamp: new Date(Date.now() - 3 * 3600000).toISOString(),
          read: true,
          actionable: true,
          actionText: "Voir le devoir",
          actionRoute: "ProjectDetail",
          actionParams: { projectId: "456" },
        },
        {
          id: "3",
          type: "announcement",
          title: "Annonce importante",
          body: "Les cours de demain sont annulés en raison d'une journée pédagogique.",
          timestamp: new Date(Date.now() - 1 * 86400000).toISOString(),
          read: false,
          actionable: false,
        },
        {
          id: "4",
          type: "grade",
          title: "Note publiée",
          body: "Votre note pour l'examen de Développement Mobile a été publiée.",
          timestamp: new Date(Date.now() - 2 * 86400000).toISOString(),
          read: true,
          actionable: true,
          actionText: "Voir la note",
          actionRoute: "ExamDetail",
          actionParams: { examId: "789" },
        },
        {
          id: "5",
          type: "reminder",
          title: "Rappel d'événement",
          body: "L'atelier sur les API commence dans 1 heure.",
          timestamp: new Date(Date.now() - 3 * 86400000).toISOString(),
          read: true,
          actionable: true,
          actionText: "Voir l'atelier",
          actionRoute: "WorkshopDetail",
          actionParams: { workshopId: "101" },
        },
      ]

      setNotifications(mockNotifications)
    } catch (error) {
      console.error("Error fetching notifications:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSettings = async () => {
    // In a real app, this would fetch from Supabase
    // For this demo, we'll use mock data
    const mockSettings: NotificationSetting[] = [
      {
        id: "1",
        type: "messages",
        title: "Messages",
        enabled: true,
        description: "Notifications pour les nouveaux messages",
      },
      {
        id: "2",
        type: "assignments",
        title: "Devoirs",
        enabled: true,
        description: "Rappels pour les devoirs à rendre",
      },
      {
        id: "3",
        type: "announcements",
        title: "Annonces",
        enabled: true,
        description: "Notifications pour les annonces importantes",
      },
      {
        id: "4",
        type: "grades",
        title: "Notes",
        enabled: true,
        description: "Alertes quand de nouvelles notes sont publiées",
      },
      {
        id: "5",
        type: "reminders",
        title: "Rappels",
        enabled: false,
        description: "Rappels pour les événements à venir",
      },
      {
        id: "6",
        type: "email",
        title: "Emails",
        enabled: false,
        description: "Recevoir également les notifications par email",
      },
    ]

    setSettings(mockSettings)
  }

  const markAsRead = async (id: string) => {
    // In a real app, this would update in Supabase
    setNotifications((prev) =>
      prev.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
    )
  }

  const handleNotificationPress = (notification: Notification) => {
    markAsRead(notification.id)

    if (notification.actionable && notification.actionRoute) {
      navigation.navigate(notification.actionRoute, notification.actionParams || {})
    }
  }

  const toggleSetting = (id: string) => {
    setSettings((prev) =>
      prev.map((setting) => (setting.id === id ? { ...setting, enabled: !setting.enabled } : setting)),
    )

    // In a real app, this would update in Supabase
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })))

    // In a real app, this would update in Supabase
  }

  const getIconName = (type: string) => {
    switch (type) {
      case "message":
        return "chatbubble-outline"
      case "assignment":
        return "document-text-outline"
      case "announcement":
        return "megaphone-outline"
      case "grade":
        return "school-outline"
      case "reminder":
        return "alarm-outline"
      default:
        return "notifications-outline"
    }
  }

  const getIconColor = (type: string) => {
    switch (type) {
      case "message":
        return "#2196F3"
      case "assignment":
        return "#FF9800"
      case "announcement":
        return "#F44336"
      case "grade":
        return "#4CAF50"
      case "reminder":
        return "#9C27B0"
      default:
        return theme.primary
    }
  }

  const renderNotificationItem = ({ item }: { item: Notification }) => {
    return (
      <TouchableOpacity
        style={[
          styles.notificationItem,
          {
            backgroundColor: item.read ? theme.cardBackground : `${theme.primary}10`,
            borderLeftColor: item.read ? theme.border : getIconColor(item.type),
          },
        ]}
        onPress={() => handleNotificationPress(item)}
      >
        <View style={[styles.iconContainer, { backgroundColor: `${getIconColor(item.type)}20` }]}>
          <Ionicons name={getIconName(item.type)} size={24} color={getIconColor(item.type)} />
        </View>

        <View style={styles.contentContainer}>
          <Text style={[styles.notificationTitle, { color: theme.text }]}>{item.title}</Text>

          <Text style={[styles.notificationBody, { color: theme.textSecondary }]} numberOfLines={2}>
            {item.body}
          </Text>

          <View style={styles.notificationMeta}>
            <Text style={[styles.timestamp, { color: theme.textSecondary }]}>{formatTimeAgo(item.timestamp)}</Text>

            {item.actionable && (
              <Text style={[styles.actionText, { color: theme.primary }]}>{item.actionText || "Voir détails"}</Text>
            )}
          </View>
        </View>

        {!item.read && <View style={[styles.unreadIndicator, { backgroundColor: theme.primary }]} />}
      </TouchableOpacity>
    )
  }

  const renderSettingItem = ({ item }: { item: NotificationSetting }) => {
    return (
      <View style={[styles.settingItem, { backgroundColor: theme.cardBackground }]}>
        <View style={styles.settingContent}>
          <Text style={[styles.settingTitle, { color: theme.text }]}>{item.title}</Text>
          <Text style={[styles.settingDescription, { color: theme.textSecondary }]}>{item.description}</Text>
        </View>

        <Switch
          value={item.enabled}
          onValueChange={() => toggleSetting(item.id)}
          trackColor={{ false: theme.border, true: theme.primary }}
          thumbColor={item.enabled ? theme.accent : "#f4f3f4"}
        />
      </View>
    )
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <CustomHeader
        title="Notifications"
        showBackButton
        onBackPress={() => navigation.goBack()}
        rightComponent={
          <TouchableOpacity style={styles.headerButton} onPress={() => setShowSettings(!showSettings)}>
            <Ionicons name={showSettings ? "notifications-outline" : "settings-outline"} size={24} color={theme.text} />
          </TouchableOpacity>
        }
      />

      {showSettings ? (
        <View style={styles.settingsContainer}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Paramètres de notification</Text>

          <FlatList
            data={settings}
            renderItem={renderSettingItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.settingsList}
          />
        </View>
      ) : (
        <>
          <View style={styles.notificationHeader}>
            <Text style={[styles.notificationCount, { color: theme.text }]}>
              {unreadCount > 0
                ? `${unreadCount} notification${unreadCount > 1 ? "s" : ""} non lue${unreadCount > 1 ? "s" : ""}`
                : "Aucune notification non lue"}
            </Text>

            {unreadCount > 0 && (
              <TouchableOpacity onPress={markAllAsRead}>
                <Text style={[styles.markAllRead, { color: theme.primary }]}>Tout marquer comme lu</Text>
              </TouchableOpacity>
            )}
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.primary} />
              <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Chargement des notifications...</Text>
            </View>
          ) : (
            <FlatList
              data={notifications}
              renderItem={renderNotificationItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.notificationsList}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Ionicons name="notifications-off-outline" size={64} color={theme.textSecondary} />
                  <Text style={[styles.emptyText, { color: theme.textSecondary }]}>Aucune notification</Text>
                </View>
              }
            />
          )}
        </>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerButton: {
    padding: 8,
  },
  notificationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  notificationCount: {
    fontSize: 14,
    fontWeight: "500",
  },
  markAllRead: {
    fontSize: 14,
    fontWeight: "500",
  },
  notificationsList: {
    padding: 16,
  },
  notificationItem: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
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
  notificationTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  notificationBody: {
    fontSize: 14,
    marginBottom: 8,
  },
  notificationMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  timestamp: {
    fontSize: 12,
  },
  actionText: {
    fontSize: 12,
    fontWeight: "500",
  },
  unreadIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginLeft: 8,
    alignSelf: "center",
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
  settingsContainer: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  settingsList: {
    paddingBottom: 16,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  settingContent: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
  },
})

export default NotificationsScreen
