import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons'
import { useTheme } from '../../../context/ThemeContext'
import { useSupabase } from '../../../context/SupabaseContext'
import CustomHeader from '../../../components/CustomHeader'
import LoadingIndicator from '../../../components/LoadingIndicator'
import CustomButton from '../../../components/CustomButton'
import { formatDate } from '../../../utils/dateUtils'

type RouteParams = {
  projectId: string;
}

const ProjectDetailScreen = () => {
  const navigation = useNavigation()
  const route = useRoute()
  const { projectId } = route.params as RouteParams
  const { theme } = useTheme()
  const { supabase } = useSupabase()
  const [project, setProject] = useState<any>(null)
  const [members, setMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProjectDetails()
  }, [projectId])

  const fetchProjectDetails = async () => {
    try {
      setLoading(true)
      
      // Fetch project details
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single()
      
      if (projectError) throw projectError
      
      // Fetch project members
      const { data: membersData, error: membersError } = await supabase
        .from('project_members')
        .select(`
          user_id,
          role,
          users (
            id,
            first_name,
            last_name,
            avatar_url
          )
        `)
        .eq('project_id', projectId)
      
      if (membersError) throw membersError
      
      setProject(projectData)
      setMembers(membersData)
    } catch (error) {
      console.error('Error fetching project details:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <LoadingIndicator />
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <CustomHeader 
        title="Détails du projet" 
        showBackButton 
        onBackPress={() => navigation.goBack()} 
      />
      
      <ScrollView style={styles.scrollView}>
        {/* Project Header */}
        <View style={[styles.projectHeader, { backgroundColor: theme.cardBackground }]}>
          <Text style={[styles.projectTitle, { color: theme.text }]}>{project?.title}</Text>
          <View style={styles.projectMeta}>
            <Text style={[styles.projectDate, { color: theme.textSecondary }]}>
              Créé le {formatDate(project?.created_at)}
            </Text>
            <View style={[styles.statusBadge, { backgroundColor: project?.status === 'active' ? '#4CAF50' : '#FFC107' }]}>
              <Text style={styles.statusText}>{project?.status === 'active' ? 'Actif' : 'En attente'}</Text>
            </View>
          </View>
        </View>
        
        {/* Project Description */}
        <View style={[styles.section, { backgroundColor: theme.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Description</Text>
          <Text style={[styles.description, { color: theme.textSecondary }]}>
            {project?.description || "Aucune description disponible."}
          </Text>
        </View>
        
        {/* Project Stats */}
        <View style={[styles.statsContainer, { backgroundColor: theme.cardBackground }]}>
          <View style={styles.statItem}>
            <Ionicons name="time-outline" size={24} color={theme.primary} />
            <Text style={[styles.statValue, { color: theme.text }]}>
              {project?.estimated_hours || 0} heures
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Durée estimée</Text>
          </View>
          
          <View style={styles.statItem}>
            <MaterialIcons name="assignment-turned-in" size={24} color={theme.primary} />
            <Text style={[styles.statValue, { color: theme.text }]}>
              {project?.completion_percentage || 0}%
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Complété</Text>
          </View>
          
          <View style={styles.statItem}>
            <FontAwesome5 name="tasks" size={22} color={theme.primary} />
            <Text style={[styles.statValue, { color: theme.text }]}>
              {project?.tasks_count || 0}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Tâches</Text>
          </View>
        </View>
        
        {/* Team Members */}
        <View style={[styles.section, { backgroundColor: theme.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Équipe</Text>
          
          {members.length > 0 ? (
            members.map((member, index) => (
              <View key={index} style={styles.memberItem}>
                <Image 
                  source={{ uri: member.users?.avatar_url || 'https://via.placeholder.com/40' }} 
                  style={styles.memberAvatar} 
                />
                <View style={styles.memberInfo}>
                  <Text style={[styles.memberName, { color: theme.text }]}>
                    {member.users?.first_name} {member.users?.last_name}
                  </Text>
                  <Text style={[styles.memberRole, { color: theme.textSecondary }]}>
                    {member.role || 'Membre'}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              Aucun membre dans ce projet.
            </Text>
          )}
        </View>
        
        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <CustomButton 
            title="Modifier le projet" 
            onPress={() => {}} 
            style={{ flex: 1, marginRight: 8 }}
          />
          <CustomButton 
            title="Ajouter un membre" 
            onPress={() => {}} 
            style={{ flex: 1, marginLeft: 8 }}
            type="secondary"
          />
        </View>
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
  projectHeader: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  projectTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  projectMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  projectDate: {
    fontSize: 14,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  statusText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 12,
  },
  section: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  memberInfo: {
    marginLeft: 12,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '500',
  },
  memberRole: {
    fontSize: 14,
    marginTop: 2,
  },
  emptyText: {
    textAlign: 'center',
    fontStyle: 'italic',
    marginVertical: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    marginBottom: 24,
  },
})

export default ProjectDetailScreen
