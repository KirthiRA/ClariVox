import { createContext, useContext, useState, useEffect, useRef } from 'react'
import { supabase } from '../utils/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const mounted = useRef(true)

  const setProfileFromUser = (u) => {
    if (!u) return setProfile(null)
    setProfile({
      name: u.user_metadata?.name || u.email?.split('@')[0] || 'User',
      role: u.user_metadata?.role || 'user'
    })
  }

  useEffect(() => {
    mounted.current = true

    // Load session from localStorage (works offline)
    const loadSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!mounted.current) return
        setUser(session?.user ?? null)
        setProfileFromUser(session?.user ?? null)
      } catch {
        // ignore — keep user as null
      } finally {
        if (mounted.current) setLoading(false)
      }
    }

    loadSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted.current) return
      setUser(session?.user ?? null)
      setProfileFromUser(session?.user ?? null)
      setLoading(false)
    })

    return () => {
      mounted.current = false
      subscription?.unsubscribe()
    }
  }, [])

  const signIn = async (email, password) => {
    try {
      const result = await supabase.auth.signInWithPassword({ email, password })
      if (result.error?.message === 'network_unavailable') {
        return { error: { message: 'No internet connection. Please check your WiFi and try again.' } }
      }
      return result
    } catch {
      return { error: { message: 'No internet connection. Please check your WiFi and try again.' } }
    }
  }

  const signUp = async (email, password) => {
    try {
      const result = await supabase.auth.signUp({ email, password })
      if (result.error?.message === 'network_unavailable') {
        return { error: { message: 'No internet connection. Please check your WiFi and try again.' } }
      }
      return result
    } catch {
      return { error: { message: 'No internet connection. Please check your WiFi and try again.' } }
    }
  }
  
  const updateProfile = (newName) => {
  setProfile(prev => ({ ...prev, name: newName }))
}

  const signOut = async () => {
    try { await supabase.auth.signOut() } catch {}
    setUser(null)
    setProfile(null)
  }

  return (
  <AuthContext.Provider value={{ user, profile, loading, signIn, signUp, signOut, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)