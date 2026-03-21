import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../utils/supabase'
import api from '../utils/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)  // from SQLite (includes role)
  const [loading, setLoading] = useState(true)

  const syncUser = async (supabaseUser) => {
    if (!supabaseUser) return
    try {
      const res = await api.post('/users/sync', null, {
        params: {
          user_id: supabaseUser.id,
          email: supabaseUser.email,
          name: supabaseUser.user_metadata?.full_name || '',
        }
      })
      setProfile(res.data)
    } catch (e) {
      console.error('User sync failed', e)
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) syncUser(session.user)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) syncUser(session.user)
      else setProfile(null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = (email, password) => supabase.auth.signInWithPassword({ email, password })
  const signUp = (email, password) => supabase.auth.signUp({ email, password })
  const signOut = () => { supabase.auth.signOut(); setProfile(null) }
  const signInWithGoogle = () => supabase.auth.signInWithOAuth({ provider: 'google' })

  const isAdmin = profile?.role === 'admin'

  return (
    <AuthContext.Provider value={{ user, profile, loading, isAdmin, signIn, signUp, signOut, signInWithGoogle }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
