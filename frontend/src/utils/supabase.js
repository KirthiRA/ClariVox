import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Silent fetch — suppresses all network errors from console
const silentFetch = async (url, options = {}) => {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)
    const response = await fetch(url, { ...options, signal: controller.signal })
    clearTimeout(timeout)
    return response
  } catch {
    // Return a fake 503 response instead of throwing — stops console spam
    return new Response(
      JSON.stringify({ error: 'network_unavailable', message: 'No internet connection' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,   // ← turn OFF auto refresh — stops the retry spam
    persistSession: true,
    detectSessionInUrl: true,
    storageKey: 'clarivox-auth',
  },
  global: {
    fetch: silentFetch
  }
})