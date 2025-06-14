"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { useSupabase } from "../../../context/SupabaseContext"
import { useTheme } from "../../../context/ThemeContext"
import { useAuth } from "../../../context/AuthContext"
import { ChevronLeft, Database, File, Trash2, Download, FileText, Book } from "react-native-feather"

const StorageManagementScreen = () => {
  const navigation = useNavigation()
  const { supabase } = useSupabase()
  const { colors } = useTheme()
  const { user } = useAuth()

  const [loading, setLoading] = useState(true)
  const [storageUsed, setStorageUsed] = useState(0) // in MB
  const [storageLimit, setStorageLimit] = useState(1000) // 1GB in MB
  const [downloadedFiles, setDownloadedFiles] = useState([])

  useEffect(() => {
    if (user) {
      fetchStorageInfo()
    }
  }, [user])

  const fetchStorageInfo = async () => {
    try {
      // In a real app, you would fetch this data from the database
      // For now, we'll use mock data
      
      // Mock downloaded files
      const mockFiles = [
        {
          id: '1',
          name: 'Introduction à Python.pdf',
          size: 2.4, // MB
          type: 'book',
          date: '2023-05-15T10:30:00Z'
        },
        {
          id: '2',
          name: 'Examen Java 2022.pdf',
          size: 1.8, // MB
          type: 'exam',
          date: '2023-05-10T14:20:00Z'
        },
        {
          id: '3',
          name: 'Algorithmes et structures de données.pdf',
          size: 5.2, // MB
          type: 'book',
          date: '2023-05-05T09:15:00Z'
        },
        {
          id: '4',
          name: 'Projet Web - Documentation.pdf',
          size: 3.7, // MB
          type: 'project',
          date: '2023-04-28T16:45:00Z'
        },
        {
          id: '5',
          name: 'Examen Réseaux 2023.pdf',
          size: 2.1, // MB
          type: 'exam',
          date: '2023-04-20T11:30:00Z'
        }
      ]
      
      setDownloadedFiles(mockFiles)
      
      // Calculate total storage used
      const totalSize = mockFiles.reduce((sum, file) => sum + file.size, 0)
      setStorageUsed(totalSize)
      
      setLoading(false)
    } catch (error) {
      console.error("Error fetching storage info:", error)
      setLoading(false)
    }
  }

  const handleDeleteFile = (fileId) => {
    Alert.alert(
      "Supprimer le fichier",
      "Êtes-vous sûr de vouloir supprimer ce fichier ?",
      [
        { text: "Annuler", style: "cancel" },
        { 
          text: "Supprimer", 
          style: "destructive", 
          onPress: () => {
            // Remove file from state
            const updatedFiles = downloadedFiles.filter(file => file.id !== fileId)
            setDownloadedFiles(updatedFiles)
            
            // Recalculate storage used
            const totalSize = updatedFiles.reduce((sum, file) => sum + file.size, 0)
            setStorageUsed(totalSize)
            
            // In a real app, you would also delete the file from storage
          } 
        }
      ]
    )
  }

  const handleClearAllFiles = () => {
    Alert.alert(
      "Supprimer tous les fichiers",
      "Êtes-vous sûr de vouloir supprimer tous les fichiers téléchargés ? Cette action est irréversible.",
      [
        { text: "Annuler", style: "cancel" },
        { 
          text: "Supprimer tout", 
          style: "destructive", 
          onPress: () => {
            setDownloadedFiles([])
            setStorageUsed(0)
            
            // In a real app, you would also delete all files from storage
          } 
        }
      ]
    )
  }

  const getFileIcon = (fileType) => {
    switch (fileType) {
      case 'book':
        return <Book stroke={colors.gold} width={24} height={24} />
      case 'exam':
        return <FileText stroke={colors.gold} width={24} height={24} />
      default:
        return <File stroke={colors.gold} width={24} height={24} />
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR')
  }

  const renderFileItem = ({ item }) => (
    <View style={[styles.fileCard, { backgroundColor: colors.card }]}>
      <View style={styles.fileIconContainer}>
        {getFileIcon(item.type)}
      </View>
      <View style={styles.fileInfo}>
        <Text style={[styles.fileName, { color: colors.text }]} numberOfLines={1}>{item.name}</Text>
        <View style={styles.fileDetails}>
          <Text style={[styles.fileSize, { color: colors.textSecondary }]}>{item.size} MB</Text>
          <Text style={[styles.fileDate, { color: colors.textSecondary }]}>{formatDate(item.date)}</Text>
        </View>
      </View>
      <TouchableOpacity 
        style={[styles.deleteButton, { backgroundColor: colors.error + '20' }]}
        onPress={() => handleDeleteFile(item.id)}
      >
        <Trash2 stroke={colors.error} width={20} height={20} />
      </TouchableOpacity>
    </View>
  )

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft stroke={colors.text} width={24} height={24} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Gestion du stockage</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <View style={[styles.storageCard, { backgroundColor: colors.card }]}>
          <View style={styles.storageHeader}>
            <Database stroke={colors.gold} width={24} height={24} />
            <Text style={[styles.storageTitle, { color: colors.text }]}>Espace de stockage</Text>
          </View>
          
          <View style={styles.storageInfo}>
            <Text style={[styles.storageText, { color: colors.text }]}>
              {storageUsed.toFixed(1)} MB utilisés sur {storageLimit} MB
            </Text>
          </View>
          
          <View style={[styles.progressBarContainer, { backgroundColor: colors.border }]}>
            <View 
              style={[
                styles.progressBar, 
                { 
                  backgroundColor: colors.gold,
                  width: `${(storageUsed / storageLimit) * 100}%`
                }
              ]} 
            />
          </View>
        </View>

        <View style={styles.filesHeader}>
          <Text style={[styles.filesTitle, { color: colors.text }]}>Fichiers téléchargés</Text>
          {downloadedFiles.length > 0 && (
            <TouchableOpacity onPress={handleClearAllFiles}>
              <Text style={[styles.clearAllText, { color: colors.error }]}>Tout supprimer</Text>
            </TouchableOpacity>
          )}
        </View>

        {downloadedFiles.length > 0 ? (
          <FlatList
            data={downloadedFiles}
            renderItem={renderFileItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.filesList}
          />
        ) : (
          <View style={styles.emptyState}>
            <Download stroke={colors.textSecondary} width={40} height={40} />
            <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
              Aucun fichier téléchargé
            </Text>
            <Text style={[styles.emptyStateSubtext, { color: colors.textSecondary }]}>
              Les fichiers que vous téléchargez apparaîtront ici
            </Text>
          </View>
        )}
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
  },
  content: {
    flex: 1,
    padding: 20,
  },
  storageCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  storageHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  storageTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 8,
  },
  storageInfo: {
    marginBottom: 12,
  },
  storageText: {
    fontSize: 16,
  },
  progressBarContainer: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
  },
  filesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  filesTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  clearAllText: {
    fontSize: 14,
    fontWeight: "500",
  },
  filesList: {
    paddingBottom: 20,
  },
  fileCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  fileIconContainer: {
    marginRight: 12,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  fileDetails: {
    flexDirection: "row",
  },
  fileSize: {
    fontSize: 12,
    marginRight: 12,
  },
  fileDate: {
    fontSize: 12,
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyStateText: {
    fontSize: 18,
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

export default StorageManagementScreen
