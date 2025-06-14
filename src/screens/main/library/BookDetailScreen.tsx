"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from "react-native"
import { useRoute, useNavigation, NavigationProp } from "@react-navigation/native"
import { useSupabase } from "../../../context/SupabaseContext"
import { useTheme } from "../../../context/ThemeContext"
import { useAuth } from "../../../context/AuthContext"
import { useScreenCapture } from "../../../context/ScreenCaptureContext"
import { ChevronLeft, Star, Download, Share, AlertTriangle, Eye } from "react-native-feather"
import * as FileSystem from "expo-file-system"
import * as Sharing from "expo-sharing"

type RootStackParamList = {
  BookViewer: { bookId: string; fileUrl: string | undefined }
  // ...add other routes if needed
}

const BookDetailScreen = () => {
  const route = useRoute()
  const navigation = useNavigation<NavigationProp<RootStackParamList>>()
  const { supabase } = useSupabase()
  const { colors } = useTheme()
  const { user } = useAuth()
  const { isScreenCaptured } = useScreenCapture()

  const [book, setBook] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [ratings, setRatings] = useState<any[]>([])
  const [userRating, setUserRating] = useState<number | null>(null)
  const [downloading, setDownloading] = useState(false)

  const { bookId } = route.params as { bookId: string }

  useEffect(() => {
    fetchBookDetails()
    fetchRatings()
  }, [])

  const fetchBookDetails = async () => {
    try {
      const { data, error } = await supabase.from("books").select("*").eq("id", bookId).single()

      if (error) throw error
      setBook(data)
    } catch (error) {
      console.error("Error fetching book details:", error)
      Alert.alert("Erreur", "Impossible de charger les détails du livre")
    } finally {
      setLoading(false)
    }
  }

  const fetchRatings = async () => {
    try {
      // Fetch all ratings for this book
      const { data: ratingsData, error: ratingsError } = await supabase
        .from("book_ratings")
        .select("*, profiles(first_name, last_name, avatar_url)")
        .eq("book_id", bookId)
        .order("created_at", { ascending: false })

      if (ratingsError) throw ratingsError
      setRatings(ratingsData || [])

      // Check if user has already rated this book
      if (user) {
        const userRatingData = ratingsData?.find((rating) => rating.user_id === user.id)
        if (userRatingData) {
          setUserRating(userRatingData.rating)
        }
      }
    } catch (error) {
      console.error("Error fetching ratings:", error)
    }
  }

  const handleRate = async (rating: number) => {
    if (!user) {
      Alert.alert("Connexion requise", "Vous devez être connecté pour noter un livre")
      return
    }

    try {
      if (userRating) {
        // Update existing rating
        const { error } = await supabase
          .from("book_ratings")
          .update({ rating })
          .eq("book_id", bookId)
          .eq("user_id", user.id)

        if (error) throw error
      } else {
        // Create new rating
        const { error } = await supabase.from("book_ratings").insert({
          book_id: bookId,
          user_id: user.id,
          rating,
        })

        if (error) throw error
      }

      setUserRating(rating)
      fetchRatings() // Refresh ratings
    } catch (error) {
      console.error("Error rating book:", error)
      Alert.alert("Erreur", "Impossible d'enregistrer votre note")
    }
  }

  const handleDownload = async () => {
    if (!book?.file_url) {
      Alert.alert("Erreur", "Aucun fichier disponible pour ce livre")
      return
    }

    if (!user) {
      Alert.alert("Connexion requise", "Vous devez être connecté pour télécharger ce livre")
      return
    }

    try {
      setDownloading(true)

      // Log download attempt
      await supabase.from("user_history").insert({
        user_id: user.id, // user.id est maintenant garanti d'être string
        activity_type: "download",
        resource_type: "book",
        resource_id: bookId,
      })

      // Download file
      const fileUri = `${FileSystem.documentDirectory}${book.title.replace(/\s+/g, "_")}.pdf`
      const downloadResumable = FileSystem.createDownloadResumable(book.file_url, fileUri)

      const downloadResult = await downloadResumable.downloadAsync()
      if (!downloadResult || !downloadResult.uri) {
        throw new Error("Le téléchargement a échoué.")
      }
      const { uri } = downloadResult

      // Check if sharing is available
      const isSharingAvailable = await Sharing.isAvailableAsync()
      if (isSharingAvailable) {
        await Sharing.shareAsync(uri)
      } else {
        Alert.alert("Succès", "Fichier téléchargé avec succès")
      }
    } catch (error) {
      console.error("Error downloading file:", error)
      Alert.alert("Erreur", "Impossible de télécharger le fichier")
    } finally {
      setDownloading(false)
    }
  }

  const handleView = () => {
    navigation.navigate("BookViewer", { bookId, fileUrl: book?.file_url })
  }

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.gold} />
      </View>
    )
  }

  if (!book) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>Livre non trouvé</Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[styles.backButton, { backgroundColor: colors.gold }]}
        >
          <Text style={styles.backButtonText}>Retour</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const averageRating =
    ratings.length > 0 ? ratings.reduce((sum, rating) => sum + rating.rating, 0) / ratings.length : 0

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
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft stroke={colors.text} width={24} height={24} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Book cover and basic info */}
        <View style={styles.bookHeader}>
          <Image
            source={book.cover_url ? { uri: book.cover_url } : require("../../../assets/icon.png")}
            style={styles.bookCover}
          />
          <View style={styles.bookInfo}>
            <Text style={[styles.bookTitle, { color: colors.text }]}>{book.title}</Text>
            <Text style={[styles.bookAuthor, { color: colors.textSecondary }]}>{book.author || "Auteur inconnu"}</Text>

            {/* Rating display */}
            <View style={styles.ratingContainer}>
              <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity key={star} onPress={() => handleRate(star)}>
                    <Star
                      fill={userRating && userRating >= star ? colors.gold : "none"}
                      stroke={colors.gold}
                      width={20}
                      height={20}
                    />
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={[styles.ratingText, { color: colors.textSecondary }]}>
                {averageRating.toFixed(1)} ({ratings.length} avis)
              </Text>
            </View>

            {/* Domain tags */}
            <View style={styles.tagsContainer}>
              <View style={[styles.tag, { backgroundColor: colors.gold }]}>
                <Text style={styles.tagText}>{book.domain}</Text>
              </View>
              {book.sub_domain && (
                <View style={[styles.tag, { backgroundColor: colors.goldLight }]}>
                  <Text style={[styles.tagText, { color: colors.text }]}>{book.sub_domain}</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Action buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.gold }]} onPress={handleView}>
            <Eye stroke="#FFFFFF" width={20} height={20} />
            <Text style={styles.actionButtonText}>Lire</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.card }]}
            onPress={handleDownload}
            disabled={downloading}
          >
            {downloading ? (
              <ActivityIndicator size="small" color={colors.gold} />
            ) : (
              <>
                <Download stroke={colors.gold} width={20} height={20} />
                <Text style={[styles.actionButtonText, { color: colors.gold }]}>Télécharger</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.card }]} onPress={() => {}}>
            <Share stroke={colors.gold} width={20} height={20} />
            <Text style={[styles.actionButtonText, { color: colors.gold }]}>Partager</Text>
          </TouchableOpacity>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Description</Text>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {book.description || "Aucune description disponible pour ce livre."}
          </Text>
        </View>

        {/* Reviews */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Avis ({ratings.length})</Text>

          {ratings.length === 0 ? (
            <Text style={[styles.noReviewsText, { color: colors.textSecondary }]}>
              Aucun avis pour le moment. Soyez le premier à donner votre avis !
            </Text>
          ) : (
            ratings.slice(0, 3).map((rating) => (
              <View key={rating.id} style={[styles.reviewCard, { backgroundColor: colors.card }]}>
                <View style={styles.reviewHeader}>
                  <Image
                    source={
                      rating.profiles?.avatar_url
                        ? { uri: rating.profiles.avatar_url }
                        : require("../../../assets/icon.png")
                    }
                    style={styles.reviewerAvatar}
                  />
                  <View>
                    <Text style={[styles.reviewerName, { color: colors.text }]}>
                      {rating.profiles?.first_name} {rating.profiles?.last_name}
                    </Text>
                    <View style={styles.reviewRating}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          fill={rating.rating >= star ? colors.gold : "none"}
                          stroke={colors.gold}
                          width={12}
                          height={12}
                        />
                      ))}
                    </View>
                  </View>
                </View>
                {rating.comment && <Text style={[styles.reviewComment, { color: colors.text }]}>{rating.comment}</Text>}
              </View>
            ))
          )}

          {ratings.length > 3 && (
            <TouchableOpacity style={styles.seeAllButton}>
              <Text style={[styles.seeAllText, { color: colors.gold }]}>Voir tous les avis</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    marginBottom: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  backButton: {
    padding: 4,
  },
  backButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    padding: 10,
  },
  scrollContent: {
    padding: 20,
  },
  bookHeader: {
    flexDirection: "row",
    marginBottom: 24,
  },
  bookCover: {
    width: 120,
    height: 180,
    borderRadius: 8,
    marginRight: 16,
  },
  bookInfo: {
    flex: 1,
    justifyContent: "center",
  },
  bookTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  bookAuthor: {
    fontSize: 16,
    marginBottom: 12,
  },
  ratingContainer: {
    marginBottom: 12,
  },
  starsContainer: {
    flexDirection: "row",
    marginBottom: 4,
  },
  ratingText: {
    fontSize: 14,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    color: "#FFFFFF",
    fontWeight: "500",
    fontSize: 12,
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    marginLeft: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  noReviewsText: {
    fontSize: 14,
    fontStyle: "italic",
  },
  reviewCard: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  reviewerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  reviewRating: {
    flexDirection: "row",
  },
  reviewComment: {
    fontSize: 14,
    lineHeight: 20,
  },
  seeAllButton: {
    alignItems: "center",
    paddingVertical: 8,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: "600",
  },
})

export default BookDetailScreen
