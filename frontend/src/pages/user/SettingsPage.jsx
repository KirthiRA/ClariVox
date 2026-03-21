import { useState, useEffect } from 'react'
import UserLayout from '../../components/user/UserLayout'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import {
  Bell, Globe, Moon, Sun, Shield, Download, Trash2,
  Check, Lock, Smartphone, Clock, Zap, Star
} from 'lucide-react'

function Toggle({ on, setOn }) {
  return (
    <div onClick={() => setOn(p => !p)} style={{
      width: 44, height: 24, borderRadius: 24, cursor: 'pointer',
      transition: 'background 0.3s',
      background: on ? 'linear-gradient(90deg,#5b8dee,#a78bfa)' : '#1e2a4a',
      position: 'relative', flexShrink: 0
    }}>
      <div style={{ position: 'absolute', top: 3, left: on ? 23 : 3, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left 0.3s', boxShadow: '0 1px 4px rgba(0,0,0,0.3)' }}/>
    </div>
  )
}

const LANGUAGES = ['English', 'Tamil', 'Hindi', 'French', 'German', 'Spanish', 'Japanese', 'Chinese']

// ── Upgrade Modal with Razorpay ───────────────────────────────────────────────
function UpgradeModal({ onClose, userEmail, userName }) {
  const { isDark } = useTheme()
  const [loading, setLoading]   = useState(false)
  const [selected, setSelected] = useState('yearly')

  const plans = [
    { id: 'monthly', label: 'Monthly', price: 499,  period: '/month', desc: 'Billed ₹499/month',          popular: false },
    { id: 'yearly',  label: 'Yearly',  price: 399,  period: '/month', desc: 'Billed ₹4,788/year · Save 20%', popular: true  },
  ]

  const modalBg  = isDark ? '#0f1117' : '#ffffff'
  const textMain = isDark ? '#e2e8f0' : '#0f172a'
  const textSub  = isDark ? '#6a7a9a' : '#475569'
  const border   = isDark ? 'rgba(91,141,238,0.15)' : 'rgba(91,141,238,0.2)'
  const inputBg  = isDark ? 'rgba(91,141,238,0.06)' : 'rgba(91,141,238,0.05)'

  const handlePayment = () => {
    const amount = selected === 'yearly' ? 4788 : 499
    setLoading(true)

    if (!window.Razorpay) {
      toast.error('Payment system not loaded. Please refresh and try again.')
      setLoading(false)
      return
    }

    const options = {
      key: 'rzp_test_YourKeyHere', // ← Replace with your Razorpay test key from razorpay.com
      amount: amount * 100,
      currency: 'INR',
      name: 'Clarivox',
      description: `Pro Plan — ${plans.find(p => p.id === selected)?.label}`,
      prefill: {
        name:  userName  || 'User',
        email: userEmail || '',
      },
      theme: { color: '#5b8dee' },
      handler: (response) => {
        setLoading(false)
        toast.success(`🎉 Payment successful! Welcome to Pro. Payment ID: ${response.razorpay_payment_id}`)
        onClose()
      },
      modal: {
        ondismiss: () => setLoading(false)
      }
    }

    try {
      const rzp = new window.Razorpay(options)
      rzp.on('payment.failed', (response) => {
        setLoading(false)
        toast.error(`Payment failed: ${response.error.description}`)
      })
      rzp.open()
    } catch (e) {
      setLoading(false)
      toast.error('Could not open payment. Please try again.')
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      onClick={onClose}>
      <div style={{ background: modalBg, borderRadius: 20, border: `1px solid ${border}`, width: '100%', maxWidth: 460, padding: 32, maxHeight: '90vh', overflowY: 'auto' }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'linear-gradient(135deg,#5b8dee,#a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', boxShadow: '0 0 28px rgba(91,141,238,0.4)' }}>
            <Zap size={28} color="#fff"/>
          </div>
          <h2 style={{ color: textMain, fontWeight: 800, fontSize: 22, margin: '0 0 6px' }}>Upgrade to Pro</h2>
          <p style={{ color: textSub, fontSize: 14, margin: 0 }}>Unlock the full power of Clarivox AI</p>
        </div>

        {/* Features list */}
        <div style={{ background: inputBg, borderRadius: 12, padding: '16px 20px', marginBottom: 22 }}>
          {[
            { icon: '🎙️', text: 'Unlimited meeting uploads' },
            { icon: '🤖', text: 'AI transcription & summaries' },
            { icon: '💾', text: '100GB storage' },
            { icon: '⚡', text: 'Priority AI processing' },
            { icon: '📊', text: 'Advanced analytics & reports' },
            { icon: '📁', text: 'Unlimited project folders' },
          ].map(({ icon, text }) => (
            <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <span style={{ fontSize: 16 }}>{icon}</span>
              <span style={{ color: textMain, fontSize: 13, fontWeight: 500 }}>{text}</span>
              <Check size={14} color="#34d399" style={{ marginLeft: 'auto', flexShrink: 0 }}/>
            </div>
          ))}
        </div>

        {/* Plan selector */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 22 }}>
          {plans.map(plan => (
            <div key={plan.id} onClick={() => setSelected(plan.id)} style={{
              border: `2px solid ${selected === plan.id ? '#5b8dee' : border}`,
              borderRadius: 14, padding: '16px', cursor: 'pointer',
              background: selected === plan.id ? 'rgba(91,141,238,0.1)' : 'transparent',
              position: 'relative', transition: 'all 0.2s', textAlign: 'center'
            }}>
              {plan.popular && (
                <span style={{ position: 'absolute', top: -11, left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(90deg,#5b8dee,#a78bfa)', color: '#fff', fontSize: 10, fontWeight: 700, borderRadius: 20, padding: '3px 12px', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Star size={9}/> BEST VALUE
                </span>
              )}
              <p style={{ color: selected === plan.id ? '#7aa7f5' : textMain, fontWeight: 700, fontSize: 15, margin: '0 0 6px' }}>{plan.label}</p>
              <p style={{ color: selected === plan.id ? '#7aa7f5' : textMain, fontWeight: 800, fontSize: 26, margin: '0 0 4px', lineHeight: 1 }}>
                ₹{plan.price}
                <span style={{ fontSize: 13, fontWeight: 400, color: textSub }}>{plan.period}</span>
              </p>
              <p style={{ color: textSub, fontSize: 11, margin: 0 }}>{plan.desc}</p>
            </div>
          ))}
        </div>

        {/* Pay button */}
        <button
          onClick={handlePayment}
          disabled={loading}
          style={{
            width: '100%', padding: '15px',
            background: loading ? '#1e2a4a' : 'linear-gradient(90deg,#5b8dee,#a78bfa)',
            border: 'none', borderRadius: 12, color: '#fff',
            fontWeight: 700, fontSize: 16,
            cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: 'Inter, sans-serif',
            boxShadow: loading ? 'none' : '0 4px 20px rgba(91,141,238,0.4)',
            marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            transition: 'all 0.2s'
          }}>
          {loading
            ? <><span style={{ width: 18, height: 18, border: '3px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }}/> Opening payment...</>
            : <>Pay ₹{selected === 'yearly' ? '4,788' : '499'} with Razorpay →</>
          }
        </button>

        <button onClick={onClose} style={{ width: '100%', padding: '12px', background: 'transparent', border: `1px solid ${border}`, borderRadius: 12, color: textSub, fontSize: 14, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
          Maybe later
        </button>

        <p style={{ color: textSub, fontSize: 11, textAlign: 'center', marginTop: 14 }}>
          🔒 Secured by Razorpay · UPI · Cards · Netbanking · Wallets
        </p>
      </div>
    </div>
  )
}

// ── Main Settings Page ────────────────────────────────────────────────────────
export default function SettingsPage() {
  const { user }                       = useAuth()
  const { theme, toggleTheme, isDark, colors } = useTheme()

  const [language, setLanguage]               = useState('English')
  const [notifOn, setNotifOn]                 = useState(true)
  const [emailOn, setEmailOn]                 = useState(false)
  const [processingNotif, setProcessingNotif] = useState(true)
  const [twoFA, setTwoFA]                     = useState(false)
  const [saving, setSaving]                   = useState(false)
  const [stats, setStats]                     = useState(null)
  const [showUpgrade, setShowUpgrade]         = useState(false)

  const [sessions] = useState([
    { device: 'MacBook Pro', location: 'Chennai, India', time: 'Active now',  current: true },
    { device: 'iPhone 15',   location: 'Chennai, India', time: '2 hours ago', current: false },
  ])

  // Load saved settings
  useEffect(() => {
    const savedLang  = localStorage.getItem('clarivox_language')
    const savedNotif = localStorage.getItem('clarivox_notif')
    const savedEmail = localStorage.getItem('clarivox_email_notif')
    if (savedLang)  setLanguage(savedLang)
    if (savedNotif  !== null) setNotifOn(savedNotif  === 'true')
    if (savedEmail  !== null) setEmailOn(savedEmail  === 'true')
  }, [])

  // Check if navigated here with ?upgrade=true
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('upgrade') === 'true') setShowUpgrade(true)
  }, [])

  // Live stats
  useEffect(() => {
    if (!user?.id) return
    api.get(`/users/${user.id}/stats`).then(r => setStats(r.data)).catch(() => {})
    const t = setInterval(() => {
      api.get(`/users/${user.id}/stats`).then(r => setStats(r.data)).catch(() => {})
    }, 5000)
    return () => clearInterval(t)
  }, [user])

  const handleSave = async () => {
    setSaving(true)
    localStorage.setItem('clarivox_language', language)
    localStorage.setItem('clarivox_notif', notifOn)
    localStorage.setItem('clarivox_email_notif', emailOn)
    await new Promise(r => setTimeout(r, 600))
    setSaving(false)
    toast.success('Settings saved!')
  }

  const handleExport = async () => {
    try {
      const r = await api.get('/meetings/', { params: { user_id: user?.id } })
      const content = r.data.map(m =>
        `Title: ${m.title}\nDate: ${m.created_at}\nStatus: ${m.status}\n`
      ).join('\n---\n')
      const blob = new Blob([`Clarivox Export\nUser: ${user?.email}\nDate: ${new Date().toLocaleString()}\n\n${content}`], { type: 'text/plain' })
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href = url; a.download = 'clarivox-export.txt'; a.click()
      URL.revokeObjectURL(url)
      toast.success('Data exported!')
    } catch { toast.error('Export failed') }
  }

  const card = {
    background: colors.cardBg, borderRadius: 16,
    border: `1px solid ${colors.border}`, padding: 24,
    transition: 'background 0.3s, border-color 0.3s'
  }

  const inputStyle = {
    background: colors.inputBg, border: `1px solid ${colors.borderInput}`,
    borderRadius: 10, padding: '10px 14px',
    color: colors.textPrimary, fontSize: 14,
    outline: 'none', fontFamily: 'Inter, sans-serif', transition: 'all 0.3s'
  }

  return (
    <UserLayout title="Settings" subtitle="Adjust your preferences and application settings">

      {/* Razorpay Upgrade Modal */}
      {showUpgrade && (
        <UpgradeModal
          onClose={() => setShowUpgrade(false)}
          userEmail={user?.email}
          userName={user?.user_metadata?.name || user?.email?.split('@')[0]}
        />
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22, maxWidth: 980 }}>

        {/* ── LEFT ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Theme */}
          <div style={card}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              {isDark ? <Moon size={16} color="#7aa7f5"/> : <Sun size={16} color="#fbbf24"/>}
              <h3 style={{ color: colors.textPrimary, fontWeight: 700, fontSize: 16, margin: 0 }}>Theme</h3>
              <span style={{ marginLeft: 'auto', background: isDark ? 'rgba(91,141,238,0.15)' : 'rgba(251,191,36,0.15)', color: isDark ? '#7aa7f5' : '#d97706', borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 600 }}>
                {isDark ? 'Dark mode' : 'Light mode'}
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { val: 'dark',  label: 'Dark',  icon: Moon, desc: 'Easy on the eyes' },
                { val: 'light', label: 'Light', icon: Sun,  desc: 'Bright & clean' },
              ].map(({ val, label, icon: Icon, desc }) => (
                <div key={val} onClick={() => toggleTheme(val)} style={{
                  border: `2px solid ${theme === val ? '#5b8dee' : colors.border}`,
                  borderRadius: 12, padding: '14px 16px', cursor: 'pointer',
                  background: theme === val ? 'rgba(91,141,238,0.1)' : colors.inputBg,
                  transition: 'all 0.2s', position: 'relative'
                }}>
                  {theme === val && (
                    <div style={{ position: 'absolute', top: 8, right: 8, width: 18, height: 18, borderRadius: '50%', background: '#5b8dee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Check size={11} color="#fff"/>
                    </div>
                  )}
                  <Icon size={20} color={theme === val ? '#7aa7f5' : colors.textSecondary} style={{ marginBottom: 6 }}/>
                  <p style={{ color: theme === val ? '#7aa7f5' : colors.textPrimary, fontWeight: 600, fontSize: 14, margin: 0 }}>{label}</p>
                  <p style={{ color: colors.textSecondary, fontSize: 11, margin: '3px 0 0' }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Language */}
          <div style={card}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <Globe size={16} color="#7aa7f5"/>
              <h3 style={{ color: colors.textPrimary, fontWeight: 700, fontSize: 16, margin: 0 }}>Language</h3>
            </div>
            <select value={language} onChange={e => setLanguage(e.target.value)} style={{ ...inputStyle, width: '100%', cursor: 'pointer' }}>
              {LANGUAGES.map(l => (
                <option key={l} value={l} style={{ background: colors.cardBg, color: colors.textPrimary }}>{l}</option>
              ))}
            </select>
            <p style={{ color: colors.textSecondary, fontSize: 12, margin: '8px 0 0' }}>Used for AI transcription and summaries</p>
          </div>

          {/* Notifications */}
          <div style={card}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
              <Bell size={16} color="#7aa7f5"/>
              <h3 style={{ color: colors.textPrimary, fontWeight: 700, fontSize: 16, margin: 0 }}>Notifications</h3>
            </div>
            {[
              { label: 'Push notifications',        sub: 'In-app alerts',                on: notifOn,         set: setNotifOn },
              { label: 'Email notifications',        sub: 'Summaries sent to your email', on: emailOn,         set: setEmailOn },
              { label: 'Processing complete alerts', sub: 'When AI finishes a meeting',   on: processingNotif, set: setProcessingNotif },
            ].map(({ label, sub, on, set }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <p style={{ color: colors.textPrimary, fontSize: 14, fontWeight: 500, margin: 0 }}>{label}</p>
                  <p style={{ color: colors.textSecondary, fontSize: 12, margin: '2px 0 0' }}>{sub}</p>
                </div>
                <Toggle on={on} setOn={set}/>
              </div>
            ))}
          </div>

          {/* Upgrade to Pro CTA */}
          <div style={{ ...card, background: 'linear-gradient(135deg,#0f1a3a,#1a1060)', border: '1px solid rgba(91,141,238,0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(91,141,238,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Zap size={18} color="#fbbf24"/>
              </div>
              <div>
                <p style={{ color: '#fff', fontWeight: 700, fontSize: 15, margin: 0 }}>Upgrade to Pro</p>
                <p style={{ color: '#6a7a9a', fontSize: 12, margin: 0 }}>Unlock unlimited AI features</p>
              </div>
            </div>
            <button
              onClick={() => setShowUpgrade(true)}
              style={{ width: '100%', padding: '12px', background: 'linear-gradient(90deg,#5b8dee,#a78bfa)', border: 'none', borderRadius: 10, color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'Inter, sans-serif', boxShadow: '0 4px 16px rgba(91,141,238,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <Zap size={16}/> Upgrade Now · From ₹399/month
            </button>
          </div>
        </div>

        {/* ── RIGHT ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Live Usage */}
          <div style={card}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ color: colors.textPrimary, fontWeight: 700, fontSize: 16, margin: 0 }}>Live Usage</h3>
              <span style={{ background: 'rgba(16,185,129,0.15)', color: '#34d399', borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block', animation: 'pulse 1.5s infinite' }}/>
                Live
              </span>
            </div>
            {[
              { label: 'Total Meetings', value: stats?.total_meetings ?? '—', color: '#7aa7f5', icon: '🎙️' },
              { label: 'Processed',      value: stats?.done ?? '—',           color: '#34d399', icon: '✅' },
              { label: 'This Week',      value: stats?.this_week ?? '—',      color: '#fbbf24', icon: '📅' },
              { label: 'Storage Used',   value: stats ? `${(stats.storage_mb || 0).toFixed(1)} MB` : '—', color: '#a78bfa', icon: '💾' },
            ].map(({ label, value, color, icon }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 12px', background: colors.inputBg, borderRadius: 10, marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                  <span style={{ fontSize: 15 }}>{icon}</span>
                  <span style={{ color: colors.textSecondary, fontSize: 13 }}>{label}</span>
                </div>
                <span style={{ color, fontSize: 16, fontWeight: 700 }}>{value}</span>
              </div>
            ))}
            {stats && (
              <div style={{ marginTop: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ color: colors.textSecondary, fontSize: 12 }}>Storage</span>
                  <span style={{ color: colors.textSecondary, fontSize: 12 }}>{(stats.storage_mb || 0).toFixed(1)} / {stats.storage_limit_mb} MB</span>
                </div>
                <div style={{ height: 5, background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)', borderRadius: 4 }}>
                  <div style={{ height: '100%', width: `${Math.min(((stats.storage_mb || 0) / stats.storage_limit_mb) * 100, 100)}%`, background: 'linear-gradient(90deg,#5b8dee,#a78bfa)', borderRadius: 4, transition: 'width 0.8s ease' }}/>
                </div>
              </div>
            )}
          </div>

          {/* Security */}
          <div style={card}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
              <Shield size={16} color="#7aa7f5"/>
              <h3 style={{ color: colors.textPrimary, fontWeight: 700, fontSize: 16, margin: 0 }}>Security</h3>
            </div>

            {/* Password */}
            <div style={{ padding: '12px 14px', background: colors.inputBg, borderRadius: 10, border: `1px solid ${colors.border}`, marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Lock size={15} color="#7aa7f5"/>
                <div>
                  <p style={{ color: colors.textPrimary, fontSize: 13, fontWeight: 600, margin: 0 }}>Password</p>
                  <p style={{ color: colors.textSecondary, fontSize: 11, margin: '2px 0 0' }}>Last changed 30 days ago</p>
                </div>
              </div>
              <button onClick={() => toast.success('Password reset email sent to ' + user?.email)} style={{ background: 'rgba(91,141,238,0.15)', border: `1px solid ${colors.borderInput}`, borderRadius: 8, padding: '6px 12px', color: '#7aa7f5', fontSize: 12, cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
                Reset
              </button>
            </div>

            {/* 2FA */}
            <div style={{ padding: '12px 14px', background: colors.inputBg, borderRadius: 10, border: `1px solid ${colors.border}`, marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Smartphone size={15} color="#a78bfa"/>
                <div>
                  <p style={{ color: colors.textPrimary, fontSize: 13, fontWeight: 600, margin: 0 }}>Two-factor auth</p>
                  <p style={{ color: colors.textSecondary, fontSize: 11, margin: '2px 0 0' }}>{twoFA ? 'Enabled — extra secure' : 'Add extra protection'}</p>
                </div>
              </div>
              <Toggle on={twoFA} setOn={setTwoFA}/>
            </div>

            {/* Active Sessions */}
            <p style={{ color: colors.textSecondary, fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '16px 0 10px' }}>Active Sessions</p>
            {sessions.map((s, i) => (
              <div key={i} style={{ padding: '10px 14px', background: colors.inputBg, borderRadius: 10, border: `1px solid ${s.current ? 'rgba(91,141,238,0.3)' : colors.border}`, marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Clock size={14} color={s.current ? '#34d399' : colors.textSecondary}/>
                  <div>
                    <p style={{ color: colors.textPrimary, fontSize: 13, fontWeight: 600, margin: 0 }}>{s.device}</p>
                    <p style={{ color: colors.textSecondary, fontSize: 11, margin: '2px 0 0' }}>{s.location} · {s.time}</p>
                  </div>
                </div>
                {s.current
                  ? <span style={{ background: 'rgba(16,185,129,0.15)', color: '#34d399', borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 600 }}>Current</span>
                  : <button onClick={() => toast.success('Session revoked')} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 7, padding: '4px 10px', color: '#f87171', fontSize: 11, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Revoke</button>
                }
              </div>
            ))}

            {/* Data Management */}
            <p style={{ color: colors.textSecondary, fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '16px 0 10px' }}>Data</p>
            <button onClick={handleExport} style={{ width: '100%', padding: '10px', background: colors.inputBg, border: `1px solid ${colors.borderInput}`, borderRadius: 10, color: '#7aa7f5', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, marginBottom: 8 }}>
              <Download size={14}/> Export All My Data
            </button>
            <button onClick={() => toast.error('Contact support to delete your account')} style={{ width: '100%', padding: '10px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, color: '#f87171', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
              <Trash2 size={14}/> Delete Account
            </button>
          </div>
        </div>
      </div>

      {/* Save Settings */}
      <button onClick={handleSave} disabled={saving} style={{
        marginTop: 22, padding: '12px 50px',
        background: saving ? '#1e2a4a' : 'linear-gradient(90deg,#5b8dee,#a78bfa)',
        border: 'none', borderRadius: 12, color: '#fff',
        fontWeight: 700, fontSize: 15,
        cursor: saving ? 'not-allowed' : 'pointer',
        fontFamily: 'Inter, sans-serif',
        boxShadow: saving ? 'none' : '0 4px 18px rgba(91,141,238,0.3)',
        display: 'flex', alignItems: 'center', gap: 8
      }}>
        {saving
          ? <><span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }}/> Saving...</>
          : <><Check size={16}/> Save Settings</>
        }
      </button>
    </UserLayout>
  )
}