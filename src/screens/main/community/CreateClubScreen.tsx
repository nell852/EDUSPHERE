"use client"

import { useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import * as ImagePicker from "expo-image-picker"

const CreateClubScreen = ({ navigation }: any) => {
  const [clubName, setClubName] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [isPrivate, setIsPrivate] = useState(false)
  const [clubImage, setClubImage] = useState<string | null>(null)
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const categories = [
    { id: "tech", name: "Technologie", icon: "💻", color: "#007AFF" },
    { id: "science", name: "Sciences", icon: "🔬", color: "#34C759" },
    { id: "art", name: "Arts", icon: "🎨", color: "#FF9500" },
    { id: "language", name: "Langues", icon: "🗣️", color: "#AF52DE" },
    { id: "business", name: "Business", icon: "💼", color: "#FF3B30" },
    { id: "health", name: "Santé", icon: "🏥", color: "#32D74B" },
    { id: "sports", name: "Sports", icon: "⚽", color: "#FF9F0A" },
    { id: "music", name: "Musique", icon: "🎵", color: "#5856D6" },
  ]

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()

    if (status !== "granted") {
      Alert.alert("Permission requise", "Nous avons besoin de votre permission pour accéder à vos photos.")
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    })

    if (!result.canceled) {
      setClubImage(result.assets[0].uri)
    }
  }

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim()) && tags.length < 5) {
      setTags([...tags, newTag.trim()])
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const createClub = async () => {
    if (!clubName.trim()) {
      Alert.alert("Erreur", "Veuillez entrer un nom pour le club.")
      return
    }

    if (!description.trim()) {
      Alert.alert("Erreur", "Veuillez entrer une description pour le club.")
      return
    }

    if (!category) {
      Alert.alert("Erreur", "Veuillez sélectionner une catégorie.")
      return
    }

    setIsLoading(true)

    try {
      // Simulation de création de club
      const clubData = {
        name: clubName.trim(),
        description: description.trim(),
        category,
        isPrivate,
        image: clubImage,
        tags,
        createdAt: new Date().toISOString(),
        memberCount: 1,
      }

      // Ici, vous ajouteriez la logique pour sauvegarder dans Supabase
      // const { data, error } = await supabase
      //   .from('clubs')
      //   .insert([clubData])

      Alert.alert("Succès", "Votre club a été créé avec succès !", [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ])
    } catch (error) {
      Alert.alert("Erreur", "Une erreur est survenue lors de la création du club.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Créer un Club</Text>
          <TouchableOpacity
            onPress={createClub}
            style={[styles.createButton, (!clubName || !description || !category) && styles.disabledButton]}
            disabled={!clubName || !description || !category || isLoading}
          >
            <Text
              style={[styles.createButtonText, (!clubName || !description || !category) && styles.disabledButtonText]}
            >
              {isLoading ? "Création..." : "Créer"}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Image du club */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Image du club</Text>
            <TouchableOpacity onPress={pickImage} style={styles.imageContainer}>
              {clubImage ? (
                <Image source={{ uri: clubImage }} style={styles.clubImage} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Ionicons name="camera" size={40} color="#999" />
                  <Text style={styles.imagePlaceholderText}>Ajouter une image</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Nom du club */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Nom du club *</Text>
            <TextInput
              style={styles.input}
              value={clubName}
              onChangeText={setClubName}
              placeholder="Entrez le nom de votre club"
              maxLength={50}
            />
            <Text style={styles.characterCount}>{clubName.length}/50</Text>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Décrivez votre club, ses objectifs et activités..."
              multiline
              numberOfLines={4}
              maxLength={500}
            />
            <Text style={styles.characterCount}>{description.length}/500</Text>
          </View>

          {/* Catégorie */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Catégorie *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryButton,
                    { borderColor: cat.color },
                    category === cat.id && { backgroundColor: cat.color },
                  ]}
                  onPress={() => setCategory(cat.id)}
                >
                  <Text style={styles.categoryIcon}>{cat.icon}</Text>
                  <Text style={[styles.categoryText, category === cat.id && styles.selectedCategoryText]}>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Tags */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tags (optionnel)</Text>
            <View style={styles.tagInputContainer}>
              <TextInput
                style={styles.tagInput}
                value={newTag}
                onChangeText={setNewTag}
                placeholder="Ajouter un tag"
                onSubmitEditing={addTag}
                maxLength={20}
              />
              <TouchableOpacity onPress={addTag} style={styles.addTagButton}>
                <Ionicons name="add" size={20} color="#007AFF" />
              </TouchableOpacity>
            </View>
            <View style={styles.tagsContainer}>
              {tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                  <TouchableOpacity onPress={() => removeTag(tag)} style={styles.removeTagButton}>
                    <Ionicons name="close" size={16} color="#666" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
            <Text style={styles.tagLimit}>Maximum 5 tags</Text>
          </View>

          {/* Paramètres de confidentialité */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Confidentialité</Text>
            <TouchableOpacity style={styles.privacyOption} onPress={() => setIsPrivate(!isPrivate)}>
              <View style={styles.privacyOptionContent}>
                <Ionicons
                  name={isPrivate ? "lock-closed" : "globe"}
                  size={20}
                  color={isPrivate ? "#FF9500" : "#34C759"}
                />
                <View style={styles.privacyOptionText}>
                  <Text style={styles.privacyOptionTitle}>{isPrivate ? "Club privé" : "Club public"}</Text>
                  <Text style={styles.privacyOptionDescription}>
                    {isPrivate ? "Seuls les membres invités peuvent rejoindre" : "Tout le monde peut rejoindre ce club"}
                  </Text>
                </View>
              </View>
              <View style={[styles.toggle, isPrivate && styles.toggleActive]}>
                <View style={[styles.toggleThumb, isPrivate && styles.toggleThumbActive]} />
              </View>
            </TouchableOpacity>
          </View>

          {/* Règles du club */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Règles du club</Text>
            <View style={styles.rulesContainer}>
              <Text style={styles.ruleText}>• Respectez tous les membres</Text>
              <Text style={styles.ruleText}>• Partagez des contenus pertinents</Text>
              <Text style={styles.ruleText}>• Pas de spam ou de contenu inapproprié</Text>
              <Text style={styles.ruleText}>• Encouragez la collaboration</Text>
            </View>
          </View>
        </ScrollView>
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
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  createButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  disabledButton: {
    backgroundColor: "#E0E0E0",
  },
  createButtonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
  },
  disabledButtonText: {
    color: "#999",
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: "#FFF",
    marginVertical: 8,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  imageContainer: {
    alignItems: "center",
  },
  clubImage: {
    width: "100%",
    height: 200,
    borderRadius: 12,
  },
  imagePlaceholder: {
    width: "100%",
    height: 200,
    backgroundColor: "#F0F0F0",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E0E0E0",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
  },
  imagePlaceholderText: {
    marginTop: 8,
    fontSize: 14,
    color: "#999",
  },
  input: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#FFF",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  characterCount: {
    textAlign: "right",
    fontSize: 12,
    color: "#999",
    marginTop: 4,
  },
  categoriesContainer: {
    flexDirection: "row",
  },
  categoryButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 2,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: "#FFF",
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  categoryText: {
    fontSize: 14,
    color: "#333",
  },
  selectedCategoryText: {
    color: "#FFF",
    fontWeight: "600",
  },
  tagInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  tagInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    marginRight: 8,
  },
  addTagButton: {
    padding: 8,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 8,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E3F2FD",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 12,
    color: "#1976D2",
    marginRight: 4,
  },
  removeTagButton: {
    padding: 2,
  },
  tagLimit: {
    fontSize: 12,
    color: "#999",
  },
  privacyOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  privacyOptionContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  privacyOptionText: {
    marginLeft: 12,
    flex: 1,
  },
  privacyOptionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  privacyOptionDescription: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#E0E0E0",
    justifyContent: "center",
    paddingHorizontal: 2,
  },
  toggleActive: {
    backgroundColor: "#007AFF",
  },
  toggleThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#FFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleThumbActive: {
    transform: [{ translateX: 20 }],
  },
  rulesContainer: {
    backgroundColor: "#F8F9FA",
    padding: 16,
    borderRadius: 8,
  },
  ruleText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
    lineHeight: 20,
  },
})

export default CreateClubScreen
