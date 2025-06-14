"use client"

import { useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  FlatList,
  Image,
  Alert,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"

interface Participant {
  id: string
  name: string
  avatar: string
  isOnline: boolean
}

interface ChatMessage {
  id: string
  userId: string
  userName: string
  message: string
  timestamp: Date
}

const IDEScreen = ({ route, navigation }: any) => {
  const { workshopId, workshopTitle } = route.params || {}

  const [code, setCode] = useState("// Bienvenue dans l'IDE collaboratif\n// Commencez à coder ici...\n\n")
  const [language, setLanguage] = useState("javascript")
  const [participants, setParticipants] = useState<Participant[]>([
    { id: "1", name: "Alice Martin", avatar: "https://i.pravatar.cc/150?img=1", isOnline: true },
    { id: "2", name: "Bob Dupont", avatar: "https://i.pravatar.cc/150?img=2", isOnline: true },
    { id: "3", name: "Claire Moreau", avatar: "https://i.pravatar.cc/150?img=3", isOnline: false },
  ])
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      userId: "1",
      userName: "Alice Martin",
      message: "Salut tout le monde ! Prêts à coder ?",
      timestamp: new Date(Date.now() - 300000),
    },
    {
      id: "2",
      userId: "2",
      userName: "Bob Dupont",
      message: "Oui ! On commence par quoi ?",
      timestamp: new Date(Date.now() - 240000),
    },
  ])
  const [newMessage, setNewMessage] = useState("")
  const [showChat, setShowChat] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [output, setOutput] = useState("")

  const languages = [
    { id: "javascript", name: "JavaScript", icon: "🟨" },
    { id: "python", name: "Python", icon: "🐍" },
    { id: "java", name: "Java", icon: "☕" },
    { id: "cpp", name: "C++", icon: "⚡" },
    { id: "html", name: "HTML", icon: "🌐" },
    { id: "css", name: "CSS", icon: "🎨" },
  ]

  const runCode = async () => {
    setIsRunning(true)
    setOutput("Exécution du code...")

    // Simulation d'exécution de code
    setTimeout(() => {
      if (language === "javascript") {
        setOutput("> Hello World!\n> Code exécuté avec succès")
      } else if (language === "python") {
        setOutput("Hello World!\nCode exécuté avec succès")
      } else {
        setOutput("Code compilé et exécuté avec succès")
      }
      setIsRunning(false)
    }, 2000)
  }

  const sendMessage = () => {
    if (newMessage.trim()) {
      const message: ChatMessage = {
        id: Date.now().toString(),
        userId: "current_user",
        userName: "Vous",
        message: newMessage.trim(),
        timestamp: new Date(),
      }
      setChatMessages([...chatMessages, message])
      setNewMessage("")
    }
  }

  const saveCode = async () => {
    try {
      // Simulation de sauvegarde
      Alert.alert("Succès", "Code sauvegardé avec succès!")
    } catch (error) {
      Alert.alert("Erreur", "Impossible de sauvegarder le code")
    }
  }

  const shareCode = () => {
    Alert.alert("Partager le code", "Voulez-vous partager ce code avec d'autres utilisateurs ?", [
      { text: "Annuler", style: "cancel" },
      { text: "Partager", onPress: () => Alert.alert("Succès", "Code partagé!") },
    ])
  }

  const renderParticipant = ({ item }: { item: Participant }) => (
    <View style={styles.participantItem}>
      <Image source={{ uri: item.avatar }} style={styles.participantAvatar} />
      <View style={styles.participantInfo}>
        <Text style={styles.participantName}>{item.name}</Text>
        <View style={[styles.statusIndicator, { backgroundColor: item.isOnline ? "#4CAF50" : "#9E9E9E" }]} />
      </View>
    </View>
  )

  const renderChatMessage = ({ item }: { item: ChatMessage }) => (
    <View style={[styles.chatMessage, item.userId === "current_user" && styles.ownMessage]}>
      <Text style={styles.chatUserName}>{item.userName}</Text>
      <Text style={styles.chatMessageText}>{item.message}</Text>
      <Text style={styles.chatTimestamp}>
        {item.timestamp.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
      </Text>
    </View>
  )

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>IDE Collaboratif</Text>
          <Text style={styles.headerSubtitle}>{workshopTitle || "Atelier de programmation"}</Text>
        </View>
        <TouchableOpacity onPress={() => setShowChat(!showChat)} style={styles.chatToggle}>
          <Ionicons name="chatbubbles" size={24} color="#007AFF" />
          <View style={styles.chatBadge}>
            <Text style={styles.chatBadgeText}>{chatMessages.length}</Text>
          </View>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView style={styles.content} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <View style={styles.mainContent}>
          {/* Toolbar */}
          <View style={styles.toolbar}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.languageSelector}>
              {languages.map((lang) => (
                <TouchableOpacity
                  key={lang.id}
                  style={[styles.languageButton, language === lang.id && styles.activeLanguage]}
                  onPress={() => setLanguage(lang.id)}
                >
                  <Text style={styles.languageIcon}>{lang.icon}</Text>
                  <Text style={[styles.languageText, language === lang.id && styles.activeLanguageText]}>
                    {lang.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.toolbarActions}>
              <TouchableOpacity onPress={runCode} style={styles.runButton} disabled={isRunning}>
                {isRunning ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Ionicons name="play" size={16} color="#FFF" />
                )}
                <Text style={styles.runButtonText}>Exécuter</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={saveCode} style={styles.actionButton}>
                <Ionicons name="save" size={16} color="#007AFF" />
              </TouchableOpacity>

              <TouchableOpacity onPress={shareCode} style={styles.actionButton}>
                <Ionicons name="share" size={16} color="#007AFF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Code Editor */}
          <View style={styles.editorContainer}>
            <ScrollView style={styles.lineNumbers}>
              {code.split("\n").map((_, index) => (
                <Text key={index} style={styles.lineNumber}>
                  {index + 1}
                </Text>
              ))}
            </ScrollView>

            <TextInput
  style={[
    styles.codeEditor,
    { fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace" }
  ]}
  value={code}
  onChangeText={setCode}
  multiline
  placeholder="Tapez votre code ici..."
  placeholderTextColor="#999"
  textAlignVertical="top"
/>
          </View>

          {/* Output */}
          {output ? (
            <View style={styles.outputContainer}>
              <Text style={styles.outputTitle}>Sortie :</Text>
              <ScrollView style={styles.outputScroll}>
                <Text style={styles.outputText}>{output}</Text>
              </ScrollView>
            </View>
          ) : null}

          {/* Participants */}
          <View style={styles.participantsContainer}>
            <Text style={styles.participantsTitle}>Participants ({participants.length})</Text>
            <FlatList
              data={participants}
              renderItem={renderParticipant}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
            />
          </View>
        </View>

        {/* Chat Panel */}
        {showChat && (
          <View style={styles.chatPanel}>
            <View style={styles.chatHeader}>
              <Text style={styles.chatTitle}>Chat</Text>
              <TouchableOpacity onPress={() => setShowChat(false)}>
                <Ionicons name="close" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={chatMessages}
              renderItem={renderChatMessage}
              keyExtractor={(item) => item.id}
              style={styles.chatMessages}
            />

            <View style={styles.chatInput}>
              <TextInput
                style={styles.messageInput}
                value={newMessage}
                onChangeText={setNewMessage}
                placeholder="Tapez votre message..."
                multiline
              />
              <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
                <Ionicons name="send" size={20} color="#007AFF" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  backButton: {
    padding: 8,
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#666",
  },
  chatToggle: {
    position: "relative",
    padding: 8,
  },
  chatBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "#FF3B30",
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  chatBadgeText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    flexDirection: "row",
  },
  mainContent: {
    flex: 1,
  },
  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  languageSelector: {
    flex: 1,
  },
  languageButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    borderRadius: 16,
    backgroundColor: "#F0F0F0",
  },
  activeLanguage: {
    backgroundColor: "#007AFF",
  },
  languageIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  languageText: {
    fontSize: 12,
    color: "#666",
  },
  activeLanguageText: {
    color: "#FFF",
  },
  toolbarActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  runButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4CAF50",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  runButtonText: {
    color: "#FFF",
    fontSize: 12,
    marginLeft: 4,
  },
  actionButton: {
    padding: 8,
    marginLeft: 4,
  },
  editorContainer: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#FFF",
    margin: 16,
    borderRadius: 8,
    overflow: "hidden",
  },
  lineNumbers: {
    backgroundColor: "#F8F8F8",
    paddingHorizontal: 8,
    paddingVertical: 12,
    borderRightWidth: 1,
    borderRightColor: "#E0E0E0",
  },
  lineNumber: {
    fontSize: 12,
    color: "#999",
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    lineHeight: 18,
  },
  codeEditor: {
    flex: 1,
    padding: 12,
    fontSize: 14,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    lineHeight: 18,
  },
  outputContainer: {
    backgroundColor: "#1E1E1E",
    margin: 16,
    borderRadius: 8,
    maxHeight: 150,
  },
  outputTitle: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "bold",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  outputScroll: {
    maxHeight: 100,
  },
  outputText: {
    color: "#00FF00",
    fontSize: 12,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    padding: 12,
  },
  participantsContainer: {
    backgroundColor: "#FFF",
    margin: 16,
    padding: 16,
    borderRadius: 8,
  },
  participantsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#333",
  },
  participantItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  participantAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  participantInfo: {
    marginLeft: 8,
    position: "relative",
  },
  participantName: {
    fontSize: 12,
    color: "#333",
  },
  statusIndicator: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  chatPanel: {
    width: 300,
    backgroundColor: "#FFF",
    borderLeftWidth: 1,
    borderLeftColor: "#E0E0E0",
  },
  chatHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  chatTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  chatMessages: {
    flex: 1,
    padding: 16,
  },
  chatMessage: {
    marginBottom: 12,
    padding: 8,
    backgroundColor: "#F0F0F0",
    borderRadius: 8,
    alignSelf: "flex-start",
    maxWidth: "80%",
  },
  ownMessage: {
    backgroundColor: "#007AFF",
    alignSelf: "flex-end",
  },
  chatUserName: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#666",
    marginBottom: 2,
  },
  chatMessageText: {
    fontSize: 14,
    color: "#333",
  },
  chatTimestamp: {
    fontSize: 10,
    color: "#999",
    marginTop: 4,
  },
  chatInput: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  messageInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    maxHeight: 80,
  },
  sendButton: {
    marginLeft: 8,
    padding: 8,
  },
})

export default IDEScreen
