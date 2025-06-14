"use client"

import type React from "react"
import { createContext, useContext, useState } from "react"
import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import AsyncStorage from "@react-native-async-storage/async-storage"
import "react-native-url-polyfill/auto"
import type { Database } from "../types/supabase"

// Initialize Supabase client
const supabaseUrl = "https://lbvkiiaisqxtzcbzatxd.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxidmtpaWFpc3F4dHpjYnphdHhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4Mjc1NDAsImV4cCI6MjA2NTQwMzU0MH0.f6JVI0630JIroKrSs7uN0lUkViNYOe7jsQ-RHTYUAcE"


interface SupabaseContextType {
  supabase: SupabaseClient<Database>
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined)

export const SupabaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [supabase] = useState(() =>
    createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    }),
  )

  return <SupabaseContext.Provider value={{ supabase }}>{children}</SupabaseContext.Provider>
}

export const useSupabase = () => {
  const context = useContext(SupabaseContext)
  if (context === undefined) {
    throw new Error("useSupabase must be used within a SupabaseProvider")
  }
  return context
}
