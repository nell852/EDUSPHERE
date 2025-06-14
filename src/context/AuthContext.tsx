"use client"

import type React from "react"
import { createContext, useState, useEffect, useContext } from "react"
import { Alert } from "react-native"
import { useSupabase } from "./SupabaseContext"
import type { Session, User } from "@supabase/supabase-js"
import { generateMatricule } from "../utils/matriculeGenerator"
import { sendMatriculeEmail } from "../services/emailService"

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  loginWithSocial: (provider: "google" | "facebook" | "github" | "apple") => Promise<void>
  register: (email: string, password: string, userData: any) => Promise<void>
  logout: () => Promise<void>
  forgotPassword: (email: string) => Promise<void>
  resetPassword: (newPassword: string) => Promise<void>
  verifyMatricule: (matricule: string) => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { supabase } = useSupabase()
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for active session
    const checkSession = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession()

      if (error) {
        console.error("Error getting session:", error.message)
      }

      setSession(session)
      setUser(session?.user || null)
      setLoading(false)
    }

    checkSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      setSession(newSession)
      setUser(newSession?.user || null)
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const login = async (email: string, password: string) => {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      // Check if user has a matricule
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("matricule")
        .eq("id", data.user.id)
        .single()

      if (profileError) throw profileError

      if (!profileData.matricule) {
        // Generate and save matricule
        const matricule = generateMatricule()

        const { error: updateError } = await supabase.from("profiles").update({ matricule }).eq("id", data.user.id)

        if (updateError) throw updateError

        // Send matricule via email
        await sendMatriculeEmail(email, matricule)
      }
    } catch (error: any) {
      Alert.alert("Erreur de connexion", error.message)
    } finally {
      setLoading(false)
    }
  }

  const loginWithSocial = async (provider: "google" | "facebook" | "github" | "apple") => {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: "edusphere://auth/callback",
        },
      })

      if (error) throw error
    } catch (error: any) {
      Alert.alert("Erreur de connexion", error.message)
    } finally {
      setLoading(false)
    }
  }

  const register = async (email: string, password: string, userData: any) => {
    setLoading(true)
    try {
      // Register user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: userData.firstName,
            last_name: userData.lastName,
            birth_date: userData.birthDate,
            gender: userData.gender,
          },
        },
      })

      if (error) throw error

      if (data.user) {
        // Generate matricule
        const matricule = generateMatricule()

        // Create profile
        const { error: profileError } = await supabase.from("profiles").insert({
          id: data.user.id,
          first_name: userData.firstName,
          last_name: userData.lastName,
          email,
          birth_date: userData.birthDate,
          gender: userData.gender,
          avatar_url: userData.avatarUrl || null,
          matricule,
        })

        if (profileError) throw profileError

        // Send matricule via email
        await sendMatriculeEmail(email, matricule)
      }
    } catch (error: any) {
      Alert.alert("Erreur d'inscription", error.message)
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error: any) {
      Alert.alert("Erreur de déconnexion", error.message)
    } finally {
      setLoading(false)
    }
  }

  const forgotPassword = async (email: string) => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: "edusphere://auth/reset-password",
      })

      if (error) throw error

      Alert.alert(
        "Email envoyé",
        "Vérifiez votre boîte de réception pour les instructions de réinitialisation du mot de passe.",
      )
    } catch (error: any) {
      Alert.alert("Erreur", error.message)
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (newPassword: string) => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (error) throw error

      Alert.alert("Succès", "Votre mot de passe a été mis à jour.")
    } catch (error: any) {
      Alert.alert("Erreur", error.message)
    } finally {
      setLoading(false)
    }
  }

  const verifyMatricule = async (matricule: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id")
        .eq("matricule", matricule)
        .eq("id", user?.id)
        .single()

      if (error) throw error

      return !!data
    } catch (error) {
      return false
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        login,
        loginWithSocial,
        register,
        logout,
        forgotPassword,
        resetPassword,
        verifyMatricule,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
