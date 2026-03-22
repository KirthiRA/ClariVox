import axios from 'axios'
import { supabase } from './supabase'

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001/api'
const HEALTH_URL  = BACKEND_URL.replace('/api', '/health')

const api = axios.create({
  baseURL: BACKEND_URL,
  timeout: 30000, // 30 second timeout for slow Render free tier
})

api.interceptors.request.use(async (config) => {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`
    }
  } catch {
    // No internet — skip auth header
  }
  return config
})

// Keep Render backend alive — ping every 4 minutes to prevent sleep
const keepAlive = () => {
  fetch(HEALTH_URL)
    .then(() => console.log('Backend alive ✅'))
    .catch(() => {}) // silent fail if offline
}

// Ping immediately on load then every 4 minutes
keepAlive()
setInterval(keepAlive, 4 * 60 * 1000)

export default api