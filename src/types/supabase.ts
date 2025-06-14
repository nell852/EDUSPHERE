export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      academic_levels: {
        Row: {
          code: string
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          code: string
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          code?: string
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      book_ratings: {
        Row: {
          book_id: string
          comment: string | null
          created_at: string | null
          emoji: string | null
          id: string
          rating: number
          user_id: string
        }
        Insert: {
          book_id: string
          comment?: string | null
          created_at?: string | null
          emoji?: string | null
          id?: string
          rating: number
          user_id: string
        }
        Update: {
          book_id?: string
          comment?: string | null
          created_at?: string | null
          emoji?: string | null
          id?: string
          rating?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "book_ratings_book_id_fkey"
            columns: ["book_id"]
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "book_ratings_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      books: {
        Row: {
          author: string | null
          cover_url: string | null
          created_at: string | null
          description: string | null
          domain: string
          file_url: string
          id: string
          is_new: boolean | null
          is_popular: boolean | null
          sub_domain: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          author?: string | null
          cover_url?: string | null
          created_at?: string | null
          description?: string | null
          domain: string
          file_url: string
          id?: string
          is_new?: boolean | null
          is_popular?: boolean | null
          sub_domain?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          author?: string | null
          cover_url?: string | null
          created_at?: string | null
          description?: string | null
          domain?: string
          file_url?: string
          id?: string
          is_new?: boolean | null
          is_popular?: boolean | null
          sub_domain?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      challenge_submissions: {
        Row: {
          challenge_id: string
          evaluated_at: string | null
          feedback: string | null
          id: string
          project_id: string | null
          score: number | null
          submission_url: string | null
          submitted_at: string | null
          user_id: string
        }
        Insert: {
          challenge_id: string
          evaluated_at?: string | null
          feedback?: string | null
          id?: string
          project_id?: string | null
          score?: number | null
          submission_url?: string | null
          submitted_at?: string | null
          user_id: string
        }
        Update: {
          challenge_id?: string
          evaluated_at?: string | null
          feedback?: string | null
          id?: string
          project_id?: string | null
          score?: number | null
          submission_url?: string | null
          submitted_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenge_submissions_challenge_id_fkey"
            columns: ["challenge_id"]
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "challenge_submissions_project_id_fkey"
            columns: ["project_id"]
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "challenge_submissions_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      challenges: {
        Row: {
          club_id: string
          created_at: string | null
          created_by: string | null
          description: string
          end_date: string | null
          id: string
          start_date: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          club_id: string
          created_at?: string | null
          created_by?: string | null
          description: string
          end_date?: string | null
          id?: string
          start_date?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          club_id?: string
          created_at?: string | null
          created_by?: string | null
          description?: string
          end_date?: string | null
          id?: string
          start_date?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "challenges_club_id_fkey"
            columns: ["club_id"]
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "challenges_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      club_members: {
        Row: {
          club_id: string
          id: string
          joined_at: string | null
          role: string | null
          user_id: string
        }
        Insert: {
          club_id: string
          id?: string
          joined_at?: string | null
          role?: string | null
          user_id: string
        }
        Update: {
          club_id?: string
          id?: string
          joined_at?: string | null
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "club_members_club_id_fkey"
            columns: ["club_id"]
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "club_members_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      clubs: {
        Row: {
          created_at: string | null
          creator_id: string | null
          description: string | null
          domain: string
          id: string
          is_private: boolean | null
          logo_url: string | null
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          creator_id?: string | null
          description?: string | null
          domain: string
          id?: string
          is_private?: boolean | null
          logo_url?: string | null
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          creator_id?: string | null
          description?: string | null
          domain?: string
          id?: string
          is_private?: boolean | null
          logo_url?: string | null
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clubs_creator_id_fkey"
            columns: ["creator_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          post_id: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          post_id: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          post_id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      connections: {
        Row: {
          addressee_id: string
          created_at: string | null
          id: string
          requester_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          addressee_id: string
          created_at?: string | null
          id?: string
          requester_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          addressee_id?: string
          created_at?: string | null
          id?: string
          requester_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "connections_addressee_id_fkey"
            columns: ["addressee_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "connections_requester_id_fkey"
            columns: ["requester_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cv_generations: {
        Row: {
          created_at: string | null
          id: string
          pdf_url: string | null
          target_industry: string | null
          template: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          pdf_url?: string | null
          target_industry?: string | null
          template: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          pdf_url?: string | null
          target_industry?: string | null
          template?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cv_generations_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      exams: {
        Row: {
          academic_level_id: string | null
          created_at: string | null
          description: string | null
          file_url: string
          id: string
          is_new: boolean | null
          school_id: string | null
          subject: string
          title: string
          updated_at: string | null
          year: number | null
        }
        Insert: {
          academic_level_id?: string | null
          created_at?: string | null
          description?: string | null
          file_url: string
          id?: string
          is_new?: boolean | null
          school_id?: string | null
          subject: string
          title: string
          updated_at?: string | null
          year?: number | null
        }
        Update: {
          academic_level_id?: string | null
          created_at?: string | null
          description?: string | null
          file_url?: string
          id?: string
          is_new?: boolean | null
          school_id?: string | null
          subject?: string
          title?: string
          updated_at?: string | null
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "exams_academic_level_id_fkey"
            columns: ["academic_level_id"]
            referencedRelation: "academic_levels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exams_school_id_fkey"
            columns: ["school_id"]
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          club_id: string | null
          content: string
          created_at: string | null
          id: string
          is_read: boolean | null
          media_type: string | null
          media_url: string | null
          recipient_id: string | null
          sender_id: string | null
          workshop_id: string | null
        }
        Insert: {
          club_id?: string | null
          content: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          media_type?: string | null
          media_url?: string | null
          recipient_id?: string | null
          sender_id?: string | null
          workshop_id?: string | null
        }
        Update: {
          club_id?: string | null
          content?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          media_type?: string | null
          media_url?: string | null
          recipient_id?: string | null
          sender_id?: string | null
          workshop_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_club_id_fkey"
            columns: ["club_id"]
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_recipient_id_fkey"
            columns: ["recipient_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_workshop_id_fkey"
            columns: ["workshop_id"]
            referencedRelation: "workshops"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_url: string | null
          content: string
          created_at: string | null
          id: string
          is_read: boolean | null
          source_id: string | null
          source_type: string | null
          type: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          content: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          source_id?: string | null
          source_type?: string | null
          type: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          content?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          source_id?: string | null
          source_type?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          club_id: string
          content: string
          created_at: string | null
          id: string
          media_type: string | null
          media_url: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          club_id: string
          content: string
          created_at?: string | null
          id?: string
          media_type?: string | null
          media_url?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          club_id?: string
          content?: string
          created_at?: string | null
          id?: string
          media_type?: string | null
          media_url?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_club_id_fkey"
            columns: ["club_id"]
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          birth_date: string | null
          created_at: string | null
          email: string
          first_name: string
          gender: string | null
          id: string
          last_name: string
          matricule: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          birth_date?: string | null
          created_at?: string | null
          email: string
          first_name: string
          gender?: string | null
          id: string
          last_name: string
          matricule?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          birth_date?: string | null
          created_at?: string | null
          email?: string
          first_name?: string
          gender?: string | null
          id?: string
          last_name?: string
          matricule?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      project_collaborators: {
        Row: {
          created_at: string | null
          id: string
          project_id: string
          role: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          project_id: string
          role?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          project_id?: string
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_collaborators_project_id_fkey"
            columns: ["project_id"]
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_collaborators_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      project_files: {
        Row: {
          created_at: string | null
          file_path: string
          file_type: string
          id: string
          name: string
          project_id: string
          size: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          file_path: string
          file_type: string
          id?: string
          name: string
          project_id: string
          size?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          file_path?: string
          file_type?: string
          id?: string
          name?: string
          project_id?: string
          size?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_files_project_id_fkey"
            columns: ["project_id"]
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_public: boolean | null
          name: string
          updated_at: string | null
          user_id: string
          workshop_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          name: string
          updated_at?: string | null
          user_id: string
          workshop_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          name?: string
          updated_at?: string | null
          user_id?: string
          workshop_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_workshop_id_fkey"
            columns: ["workshop_id"]
            referencedRelation: "workshops"
            referencedColumns: ["id"]
          },
        ]
      }
      schools: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          logo_url: string | null
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          logo_url?: string | null
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          logo_url?: string | null
          name?: string
        }
        Relationships: []
      }
      security_logs: {
        Row: {
          created_at: string | null
          details: Json | null
          event_type: string
          id: string
          ip_address: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          details?: Json | null
          event_type: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          details?: Json | null
          event_type?: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "security_logs_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_history: {
        Row: {
          activity_type: string
          created_at: string | null
          id: string
          resource_id: string
          resource_type: string
          user_id: string
        }
        Insert: {
          activity_type: string
          created_at?: string | null
          id?: string
          resource_id: string
          resource_type: string
          user_id: string
        }
        Update: {
          activity_type?: string
          created_at?: string | null
          id?: string
          resource_id?: string
          resource_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_history_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_languages: {
        Row: {
          created_at: string | null
          id: string
          language_name: string
          proficiency_level: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          language_name: string
          proficiency_level?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          language_name?: string
          proficiency_level?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_languages_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_schools: {
        Row: {
          academic_level_id: string | null
          created_at: string | null
          end_date: string | null
          id: string
          is_current: boolean | null
          school_id: string
          start_date: string | null
          user_id: string
        }
        Insert: {
          academic_level_id?: string | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          is_current?: boolean | null
          school_id: string
          start_date?: string | null
          user_id: string
        }
        Update: {
          academic_level_id?: string | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          is_current?: boolean | null
          school_id?: string
          start_date?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_schools_academic_level_id_fkey"
            columns: ["academic_level_id"]
            referencedRelation: "academic_levels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_schools_school_id_fkey"
            columns: ["school_id"]
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_schools_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      workshop_members: {
        Row: {
          id: string
          joined_at: string | null
          role: string | null
          user_id: string
          workshop_id: string
        }
        Insert: {
          id?: string
          joined_at?: string | null
          role?: string | null
          user_id: string
          workshop_id: string
        }
        Update: {
          id?: string
          joined_at?: string | null
          role?: string | null
          user_id?: string
          workshop_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workshop_members_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workshop_members_workshop_id_fkey"
            columns: ["workshop_id"]
            referencedRelation: "workshops"
            referencedColumns: ["id"]
          },
        ]
      }
      workshop_sessions: {
        Row: {
          container_id: string | null
          created_at: string | null
          ended_at: string | null
          environment_url: string | null
          id: string
          started_at: string | null
          status: string | null
          updated_at: string | null
          workshop_id: string
        }
        Insert: {
          container_id?: string | null
          created_at?: string | null
          ended_at?: string | null
          environment_url?: string | null
          id?: string
          started_at?: string | null
          status?: string | null
          updated_at?: string | null
          workshop_id: string
        }
        Update: {
          container_id?: string | null
          created_at?: string | null
          ended_at?: string | null
          environment_url?: string | null
          id?: string
          started_at?: string | null
          status?: string | null
          updated_at?: string | null
          workshop_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workshop_sessions_workshop_id_fkey"
            columns: ["workshop_id"]
            referencedRelation: "workshops"
            referencedColumns: ["id"]
          },
        ]
      }
      workshops: {
        Row: {
          club_id: string
          created_at: string | null
          creator_id: string | null
          description: string | null
          environment_type: string | null
          id: string
          is_private: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          club_id: string
          created_at?: string | null
          creator_id?: string | null
          description?: string | null
          environment_type?: string | null
          id?: string
          is_private?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          club_id?: string
          created_at?: string | null
          creator_id?: string | null
          description?: string | null
          environment_type?: string | null
          id?: string
          is_private?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workshops_club_id_fkey"
            columns: ["club_id"]
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workshops_creator_id_fkey"
            columns: ["creator_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      handle_new_user: {
        Args: Record<PropertyKey, never>
        Returns: Record<string, unknown>
      }
      notify_club_join: {
        Args: Record<PropertyKey, never>
        Returns: Record<string, unknown>
      }
      notify_connection_request: {
        Args: Record<PropertyKey, never>
        Returns: Record<string, unknown>
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
