import React, { useState } from 'react'
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  Switch,
  Image
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons'
import { useTheme } from '../../../context/ThemeContext'
import { useSupabase } from '../../../context/SupabaseContext'
import { useAuth } from '../../../context/AuthContext'
import CustomHeader from '../../../components/CustomHeader'
import CustomButton from '../../../components/CustomButton'
import * as ImagePicker from 'expo-image-picker'
import * as FileSystem from 'expo-file-system'
import * as Sharing from 'expo-sharing'

const CV_TEMPLATES = [
  { id: 'modern', name: 'Moderne', color: '#3498db' },
  { id: 'classic', name: 'Classique', color: '#2c3e50' },
  { id: 'creative', name: 'Créatif', color: '#e74c3c' },
  { id: 'minimal', name: 'Minimaliste', color: '#7f8c8d' },
]

const CVGeneratorScreen = () => {
  const navigation = useNavigation()
  const themeContext = useTheme()
  const theme = themeContext.theme ?? themeContext // fallback if theme is the context itself
  const { supabase } = useSupabase()
  const { user } = useAuth()
  
  const [selectedTemplate, setSelectedTemplate] = useState('modern')
  const [formData, setFormData] = useState({
    fullName: user?.user_metadata?.full_name || '',
    title: '',
    email: user?.email || '',
    phone: '',
    location: '',
    summary: '',
    includeProjects: true,
    includeEducation: true,
    includeSkills: true,
    profileImage: null,
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedCVUrl, setGeneratedCVUrl] = useState<string | null>(null)

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    })

    if (!result.canceled) {
      setFormData(prev => ({
        ...prev,
        profileImage: result.assets[0].uri
      }))
    }
  }

  const generateCV = async () => {
    try {
      setIsGenerating(true)
      
      // In a real app, this would call an API to generate the CV
      // For this demo, we'll simulate a delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Simulate a generated CV URL
      setGeneratedCVUrl('https://example.com/generated-cv.pdf')
      
      // In a real implementation, you would:
      // 1. Send the form data to your backend
      // 2. Generate the CV using a library like pdfkit
      // 3. Store the generated PDF in Supabase Storage
      // 4. Return the URL to the generated PDF
      
    } catch (error) {
      console.error('Error generating CV:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const shareCV = async () => {
    if (!generatedCVUrl) return
    
    try {
      // In a real app, you would download the PDF first
      const fileUri = FileSystem.documentDirectory + 'my-cv.pdf'
      
      // For demo purposes, we'll just check if sharing is available
      const isAvailable = await Sharing.isAvailableAsync()
      
      if (isAvailable) {
        alert('Dans une application réelle, le CV serait partagé ici.')
        // await Sharing.shareAsync(fileUri)
      } else {
        alert("Le partage n'est pas disponible sur cet appareil")
      }
    } catch (error) {
      console.error('Error sharing CV:', error)
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <CustomHeader 
        title="Générateur de CV" 
        showBackButton 
        onBackPress={() => navigation.goBack()} 
      />
      
      <ScrollView style={styles.scrollView}>
        {generatedCVUrl ? (
          <View style={[styles.previewContainer, { backgroundColor: theme.cardBackground }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Votre CV est prêt !</Text>
            
            <Image 
              source={require('../../../assets/icon.png')} 
              style={styles.cvPreview}
              resizeMode="contain"
            />
            
            <View style={styles.actionButtons}>
              <CustomButton 
                title="Télécharger PDF" 
                onPress={() => alert('Téléchargement du PDF...')}
                icon={<Ionicons name="download-outline" size={20} color="white" />}
                style={{ flex: 1, marginRight: 8 }}
              />
              <CustomButton 
                title="Partager" 
                onPress={shareCV}
                icon={<Ionicons name="share-outline" size={20} color="white" />}
                style={{ flex: 1, marginLeft: 8 }}
                type="secondary"
              />
            </View>
            
            <CustomButton 
              title="Créer un nouveau CV" 
              onPress={() => setGeneratedCVUrl(null)}
              type="outline"
              style={{ marginTop: 16 }}
            />
          </View>
        ) : (
          <>
            {/* Template Selection */}
            <View style={[styles.section, { backgroundColor: theme.cardBackground }]}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Choisir un modèle</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.templatesContainer}>
                {CV_TEMPLATES.map(template => (
                  <TouchableOpacity
                    key={template.id}
                    style={[
                      styles.templateItem,
                      { borderColor: selectedTemplate === template.id ? theme.primary : 'transparent' }
                    ]}
                    onPress={() => setSelectedTemplate(template.id)}
                  >
                    <View style={[styles.templatePreview, { backgroundColor: template.color }]}>
                      <Text style={styles.templatePreviewText}>CV</Text>
                    </View>
                    <Text style={[styles.templateName, { color: theme.text }]}>{template.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            
            {/* Personal Information */}
            <View style={[styles.section, { backgroundColor: theme.cardBackground }]}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Informations personnelles</Text>
              
              <TouchableOpacity style={styles.profileImageContainer} onPress={pickImage}>
                {formData.profileImage ? (
                  <Image source={{ uri: formData.profileImage }} style={styles.profileImage} />
                ) : (
                  <View style={[styles.profileImagePlaceholder, { backgroundColor: theme.border }]}>
                    <Ionicons name="camera" size={24} color={theme.textSecondary} />
                  </View>
                )}
                <Text style={[styles.addPhotoText, { color: theme.primary }]}>
                  {formData.profileImage ? 'Changer la photo' : 'Ajouter une photo'}
                </Text>
              </TouchableOpacity>
              
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.text }]}>Nom complet</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.text }]}
                  value={formData.fullName}
                  onChangeText={(text) => handleInputChange('fullName', text)}
                  placeholder="Votre nom complet"
                  placeholderTextColor={theme.textSecondary}
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.text }]}>Titre professionnel</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.text }]}
                  value={formData.title}
                  onChangeText={(text) => handleInputChange('title', text)}
                  placeholder="ex: Développeur Full Stack"
                  placeholderTextColor={theme.textSecondary}
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.text }]}>Email</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.text }]}
                  value={formData.email}
                  onChangeText={(text) => handleInputChange('email', text)}
                  placeholder="votre@email.com"
                  placeholderTextColor={theme.textSecondary}
                  keyboardType="email-address"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.text }]}>Téléphone</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.text }]}
                  value={formData.phone}
                  onChangeText={(text) => handleInputChange('phone', text)}
                  placeholder="Votre numéro de téléphone"
                  placeholderTextColor={theme.textSecondary}
                  keyboardType="phone-pad"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.text }]}>Localisation</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.text }]}
                  value={formData.location}
                  onChangeText={(text) => handleInputChange('location', text)}
                  placeholder="Ville, Pays"
                  placeholderTextColor={theme.textSecondary}
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.text }]}>Résumé professionnel</Text>
                <TextInput
                  style={[styles.textArea, { backgroundColor: theme.inputBackground, color: theme.text }]}
                  value={formData.summary}
                  onChangeText={(text) => handleInputChange('summary', text)}
                  placeholder="Bref résumé de votre profil professionnel..."
                  placeholderTextColor={theme.textSecondary}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
            </View>
            
            {/* Content Options */}
            <View style={[styles.section, { backgroundColor: theme.cardBackground }]}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Options de contenu</Text>
              
              <View style={styles.switchOption}>
                <Text style={[styles.switchLabel, { color: theme.text }]}>Inclure les projets</Text>
                <Switch
                  value={formData.includeProjects}
                  onValueChange={(value) => handleInputChange('includeProjects', value)}
                  trackColor={{ false: theme.border, true: theme.primary }}
                  thumbColor={formData.includeProjects ? theme.accent : '#f4f3f4'}
                />
              </View>
              
              <View style={styles.switchOption}>
                <Text style={[styles.switchLabel, { color: theme.text }]}>Inclure l'éducation</Text>
                <Switch
                  value={formData.includeEducation}
                  onValueChange={(value) => handleInputChange('includeEducation', value)}
                  trackColor={{ false: theme.border, true: theme.primary }}
                  thumbColor={formData.includeEducation ? theme.accent : '#f4f3f4'}
                />
              </View>
              
              <View style={styles.switchOption}>
                <Text style={[styles.switchLabel, { color: theme.text }]}>Inclure les compétences</Text>
                <Switch
                  value={formData.includeSkills}
                  onValueChange={(value) => handleInputChange('includeSkills', value)}
                  trackColor={{ false: theme.border, true: theme.primary }}
                  thumbColor={formData.includeSkills ? theme.accent : '#f4f3f4'}
                />
              </View>
            </View>
            
            {/* Generate Button */}
            <CustomButton 
              title={isGenerating ? "Génération en cours..." : "Générer mon CV"} 
              onPress={generateCV}
              disabled={isGenerating || !formData.fullName || !formData.email}
              style={styles.generateButton}
              loading={isGenerating}
            />
          </>
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  section: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  templatesContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  templateItem: {
    marginRight: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 8,
    padding: 8,
  },
  templatePreview: {
    width: 80,
    height: 120,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  templatePreviewText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 20,
  },
  templateName: {
    marginTop: 8,
    fontWeight: '500',
  },
  profileImageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addPhotoText: {
    marginTop: 8,
    fontWeight: '500',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  textArea: {
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 100,
  },
  switchOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  switchLabel: {
    fontSize: 16,
  },
  generateButton: {
    marginVertical: 24,
  },
  previewContainer: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cvPreview: {
    width: '100%',
    height: 400,
    marginVertical: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    width: '100%',
  },
})

export default CVGeneratorScreen
