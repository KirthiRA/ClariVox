import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import UserLayout from '../../components/user/UserLayout'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import { LogOut, FileText, Clock, CheckCircle, AlertCircle, Zap, Shield } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

function StatRing({ value, max, color, label, sub }) {
  const pct  = Math.min((value / max) * 100, 100)
  const r    = 32
  const circ = 2 * Math.PI * r
  const dash = (pct / 100) * circ
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8 }}>
      <div style={{ position:'relative', width:80, height:80 }}>
        <svg width="80" height="80" viewBox="0 0 80 80" style={{ transform:'rotate(-90deg)' }}>
          <circle cx="40" cy="40" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="7"/>
          <circle cx="40" cy="40" r={r} fill="none" stroke={color} strokeWidth="7"
            strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
            style={{ transition:'stroke-dasharray 0.8s ease' }}/>
        </svg>
        <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <span style={{ color:'#fff', fontSize:13, fontWeight:700 }}>{Math.round(pct)}%</span>
        </div>
      </div>
      <div style={{ textAlign:'center' }}>
        <p style={{ color:'#e2e8f0', fontSize:13, fontWeight:600, margin:0 }}>{label}</p>
        <p style={{ color:'#4a5a7a', fontSize:11, margin:'2px 0 0' }}>{sub}</p>
      </div>
    </div>
  )
}

function ActivityItem({ item }) {
  const statusMap = {
    done:       { color:'#34d399', bg:'rgba(16,185,129,0.1)',  icon:CheckCircle, label:'Completed' },
    processing: { color:'#fbbf24', bg:'rgba(245,158,11,0.1)', icon:Clock,       label:'Processing' },
    failed:     { color:'#f87171', bg:'rgba(239,68,68,0.1)',  icon:AlertCircle, label:'Failed' },
    pending:    { color:'#7aa7f5', bg:'rgba(91,141,238,0.1)', icon:Clock,       label:'Pending' },
  }
  const s    = statusMap[item.status] || statusMap.pending
  const Icon = s.icon
  const ago  = item.created_at
    ? (() => {
        const diff = Date.now() - new Date(item.created_at).getTime()
        const m = Math.floor(diff / 60000)
        const h = Math.floor(m / 60)
        const d = Math.floor(h / 24)
        if (d > 0) return `${d}d ago`
        if (h > 0) return `${h}h ago`
        if (m > 0) return `${m}m ago`
        return 'Just now'
      })()
    : ''

  return (
    <div style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 0', borderBottom:'1px solid rgba(91,141,238,0.06)' }}>
      <div style={{ width:36, height:36, borderRadius:10, background:s.bg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
        <Icon size={16} color={s.color}/>
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <p style={{ color:'#e2e8f0', fontSize:13, fontWeight:600, margin:0, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{item.title}</p>
        <p style={{ color:'#4a5a7a', fontSize:11, margin:'2px 0 0' }}>
          {item.duration ? `${Math.floor(item.duration/60)}:${String(item.duration%60).padStart(2,'0')} · ` : ''}
          <span style={{ color:s.color }}>{s.label}</span>
        </p>
      </div>
      <span style={{ color:'#3d4a6b', fontSize:11, flexShrink:0 }}>{ago}</span>
    </div>
  )
}

export default function ProfilePage() {
  const { user, profile, signOut, updateProfile } = useAuth()
  const { colors, isDark } = useTheme()
  const navigate           = useNavigate()

  // ── State ──────────────────────────────────────────────────────────────────
  const [stats, setStats]         = useState(null)
  const [name, setName]           = useState(profile?.name || user?.email?.split('@')[0] || '')
  const [savedName, setSavedName] = useState(profile?.name || user?.email?.split('@')[0] || '')
  const [saving, setSaving]       = useState(false)

  // Sync name when profile loads from AuthContext
  useEffect(() => {
    if (profile?.name) {
      setName(profile.name)
      setSavedName(profile.name)
    }
  }, [profile?.name])

  const email      = user?.email || ''
  const joinedDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'January 2024'

  // ── Fetch live stats ───────────────────────────────────────────────────────
  const fetchStats = () => {
    if (!user?.id) return
    api.get(`/users/${user.id}/stats`)
      .then(r => setStats(r.data))
      .catch(() => {})
  }

  useEffect(() => {
    fetchStats()
    const t = setInterval(fetchStats, 5000)
    return () => clearInterval(t)
  }, [user])

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleUpdateName = async (e) => {
    e.preventDefault()
    if (!name.trim()) { toast.error('Name cannot be empty'); return }
    setSaving(true)
    try {
      await api.put(`/users/${user.id}/name`, null, { params: { name } })
      setSavedName(name)
      updateProfile(name) // updates AuthContext → header + dashboard update instantly
      toast.success('Name updated successfully!')
    } catch {
      toast.error('Failed to update name')
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = () => { signOut(); navigate('/login') }

  // ── Derived values ─────────────────────────────────────────────────────────
  const isSameAsStored = name === savedName
  const isDisabled     = saving || isSameAsStored || !name.trim()

  const storageUsed   = stats?.storage_mb || 0
  const storageLimit  = stats?.storage_limit_mb || 500
  const meetingsUsed  = stats?.total_meetings || 0
  const meetingsLimit = stats?.meetings_limit || 5
  const storagePct    = Math.min((storageUsed / storageLimit) * 100, 100)
  const meetingsPct   = Math.min((meetingsUsed / meetingsLimit) * 100, 100)

  // ── Styles ─────────────────────────────────────────────────────────────────
  const card = {
    background: colors.cardBg,
    borderRadius: 16,
    border: `1px solid ${colors.border}`,
    padding: 24,
    transition: 'background 0.3s, border-color 0.3s'
  }

  const inp = {
    width: '100%',
    background: colors.inputBg,
    border: `1px solid ${colors.borderInput}`,
    borderRadius: 10,
    padding: '11px 14px',
    color: colors.textPrimary,
    fontSize: 14,
    outline: 'none',
    fontFamily: 'Inter, sans-serif',
    transition: 'all 0.3s',
    boxSizing: 'border-box'
  }

  return (
    <UserLayout title="Profile" subtitle="Your account overview and activity">
      <div style={{ display:'grid', gridTemplateColumns:'1fr 340px', gap:24 }}>

        {/* ── LEFT ── */}
        <div style={{ display:'flex', flexDirection:'column', gap:20 }}>

          {/* Personal Information */}
          <div style={card}>
            <h2 style={{ color: colors.textPrimary, fontWeight:700, fontSize:17, margin:'0 0 20px' }}>
              Personal Information
            </h2>
            <div style={{ display:'flex', gap:20, alignItems:'flex-start' }}>

              {/* Avatar — shows first letter of saved name */}
              <div style={{ flexShrink:0, textAlign:'center' }}>
                <div style={{ width:76, height:76, borderRadius:'50%', background:'linear-gradient(135deg,#5b8dee,#a78bfa)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:30, fontWeight:700, color:'#fff', boxShadow:'0 0 24px rgba(91,141,238,0.35)', margin:'0 auto 10px', transition:'all 0.3s' }}>
                  {savedName?.[0]?.toUpperCase() || 'U'}
                </div>
                <span style={{ background:'rgba(16,185,129,0.15)', color:'#34d399', borderRadius:20, padding:'3px 10px', fontSize:11, fontWeight:600 }}>
                  Active
                </span>
              </div>

              {/* Form */}
              <form onSubmit={handleUpdateName} style={{ flex:1, display:'flex', flexDirection:'column', gap:14 }}>

                {/* Display Name */}
                <div>
                  <label style={{ color: colors.textSecondary, fontSize:12, display:'block', marginBottom:6, fontWeight:500, textTransform:'uppercase', letterSpacing:'0.05em' }}>
                    Display Name
                  </label>
                  <div style={{ position:'relative' }}>
                    <input
                      value={name}
                      onChange={e => setName(e.target.value)}
                      style={{ ...inp, paddingRight: !isSameAsStored ? 90 : 14 }}
                      placeholder="Enter your name"
                    />
                    {!isSameAsStored && (
                      <span style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', background:'rgba(245,158,11,0.15)', color:'#fbbf24', fontSize:10, fontWeight:600, borderRadius:10, padding:'2px 8px' }}>
                        unsaved
                      </span>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label style={{ color: colors.textSecondary, fontSize:12, display:'block', marginBottom:6, fontWeight:500, textTransform:'uppercase', letterSpacing:'0.05em' }}>
                    Email
                  </label>
                  <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                    <input value={email} readOnly style={{ ...inp, flex:1, opacity:0.6, cursor:'not-allowed' }}/>
                    <span style={{ background:'rgba(16,185,129,0.15)', color:'#34d399', borderRadius:20, padding:'5px 12px', fontSize:12, fontWeight:600, whiteSpace:'nowrap' }}>
                      ✓ Verified
                    </span>
                  </div>
                </div>

                {/* Member Since */}
                <div>
                  <label style={{ color: colors.textSecondary, fontSize:12, display:'block', marginBottom:6, fontWeight:500, textTransform:'uppercase', letterSpacing:'0.05em' }}>
                    Member Since
                  </label>
                  <input value={joinedDate} readOnly style={{ ...inp, opacity:0.5, cursor:'not-allowed' }}/>
                </div>

                {/* Save + Cancel buttons */}
                <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                  <button
                    type="submit"
                    disabled={isDisabled}
                    style={{
                      background: isDisabled
                        ? (isDark ? '#1e2a4a' : '#e2e8f0')
                        : 'linear-gradient(90deg,#5b8dee,#a78bfa)',
                      border: 'none', borderRadius:10, padding:'11px 28px',
                      color: isDisabled ? (isDark ? '#3d4a6b' : '#94a3b8') : '#fff',
                      fontWeight:600, fontSize:14,
                      cursor: isDisabled ? 'not-allowed' : 'pointer',
                      fontFamily:'Inter, sans-serif',
                      boxShadow: isDisabled ? 'none' : '0 4px 16px rgba(91,141,238,0.25)',
                      transition:'all 0.2s'
                    }}>
                    {saving ? 'Saving...' : isSameAsStored ? 'Saved ✓' : 'Save Changes'}
                  </button>
                  {!isSameAsStored && (
                    <button
                      type="button"
                      onClick={() => setName(savedName)}
                      style={{ background:'transparent', border:`1px solid ${colors.border}`, borderRadius:10, padding:'11px 18px', color: colors.textSecondary, fontSize:13, cursor:'pointer', fontFamily:'Inter, sans-serif' }}>
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* Recent Activity */}
          <div style={card}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
              <h2 style={{ color: colors.textPrimary, fontWeight:700, fontSize:17, margin:0 }}>Recent Activity</h2>
              <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                <span style={{ width:7, height:7, borderRadius:'50%', background:'#10b981', display:'inline-block', animation:'pulse 1.5s infinite' }}/>
                <span style={{ color:'#34d399', fontSize:12, fontWeight:500 }}>Live</span>
              </div>
            </div>

            {stats?.recent_activity?.length ? (
              <div>
                {stats.recent_activity.map(item => <ActivityItem key={item.id} item={item}/>)}
              </div>
            ) : (
              <div style={{ textAlign:'center', padding:'24px 0' }}>
                <FileText size={32} color={colors.textMuted} style={{ marginBottom:10 }}/>
                <p style={{ color: colors.textSecondary, fontSize:14, margin:0 }}>No meetings yet</p>
                <p style={{ color: colors.textMuted, fontSize:12, margin:'4px 0 0' }}>Upload your first meeting to see activity here</p>
              </div>
            )}

            {stats && (
              <div style={{ marginTop:16, padding:'12px 16px', background: colors.inputBg, borderRadius:10, display:'flex', gap:24 }}>
                {[
                  { label:'Total',     value: stats.total_meetings, color:'#7aa7f5' },
                  { label:'Done',      value: stats.done,           color:'#34d399' },
                  { label:'This week', value: stats.this_week,      color:'#fbbf24' },
                  { label:'Failed',    value: stats.failed,         color:'#f87171' },
                ].map(({ label, value, color }) => (
                  <div key={label} style={{ textAlign:'center' }}>
                    <p style={{ color, fontSize:20, fontWeight:700, margin:0 }}>{value}</p>
                    <p style={{ color: colors.textSecondary, fontSize:11, margin:0 }}>{label}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Security */}
          <div style={card}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
              <Shield size={18} color="#7aa7f5"/>
              <h2 style={{ color: colors.textPrimary, fontWeight:700, fontSize:17, margin:0 }}>Security</h2>
            </div>
            <div style={{ display:'flex', gap:12 }}>
              <button
                onClick={() => toast.success('Password reset email sent to ' + email)}
                style={{ flex:1, padding:'11px', background:'rgba(91,141,238,0.1)', border:'1px solid rgba(91,141,238,0.2)', borderRadius:10, color:'#7aa7f5', fontWeight:500, fontSize:13, cursor:'pointer', fontFamily:'Inter, sans-serif' }}>
                Reset Password via Email
              </button>
              <button
                onClick={handleLogout}
                style={{ flex:1, padding:'11px', background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:10, color:'#f87171', fontWeight:500, fontSize:13, cursor:'pointer', fontFamily:'Inter, sans-serif', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
                <LogOut size={14}/> Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* ── RIGHT ── */}
        <div style={{ display:'flex', flexDirection:'column', gap:20 }}>

          {/* Live Usage */}
          <div style={card}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
              <h3 style={{ color: colors.textPrimary, fontWeight:700, fontSize:15, margin:0 }}>Live Usage</h3>
              <span style={{ background:'rgba(91,141,238,0.15)', color:'#7aa7f5', borderRadius:20, padding:'3px 10px', fontSize:11, fontWeight:600 }}>
                {stats?.plan === 'pro' ? 'Pro Plan' : 'Free Plan'}
              </span>
            </div>

            <div style={{ display:'flex', justifyContent:'space-around', marginBottom:20 }}>
              <StatRing value={meetingsUsed} max={meetingsLimit} color="#5b8dee" label="Meetings" sub={`${meetingsUsed}/${meetingsLimit}`}/>
              <StatRing value={storageUsed}  max={storageLimit}  color="#a78bfa" label="Storage"  sub={`${storageUsed.toFixed(1)}MB`}/>
            </div>

            <div style={{ marginBottom:14 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                <span style={{ color: colors.textSecondary, fontSize:12 }}>Meetings used</span>
                <span style={{ color: colors.textPrimary, fontSize:12, fontWeight:600 }}>{meetingsUsed} / {meetingsLimit}</span>
              </div>
              <div style={{ height:6, background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)', borderRadius:4 }}>
                <div style={{ height:'100%', width:`${meetingsPct}%`, background:'linear-gradient(90deg,#5b8dee,#7aa7f5)', borderRadius:4, transition:'width 0.8s ease' }}/>
              </div>
            </div>

            <div style={{ marginBottom:20 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                <span style={{ color: colors.textSecondary, fontSize:12 }}>Storage used</span>
                <span style={{ color: colors.textPrimary, fontSize:12, fontWeight:600 }}>{storageUsed.toFixed(1)} / {storageLimit} MB</span>
              </div>
              <div style={{ height:6, background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)', borderRadius:4 }}>
                <div style={{ height:'100%', width:`${storagePct}%`, background:'linear-gradient(90deg,#a78bfa,#c4b5fd)', borderRadius:4, transition:'width 0.8s ease' }}/>
              </div>
            </div>

            <div style={{ background:'linear-gradient(135deg,#0f1a3a,#1a1060)', borderRadius:12, padding:16, border:'1px solid rgba(91,141,238,0.2)' }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
                <Zap size={15} color="#fbbf24"/>
                <span style={{ color:'#fff', fontWeight:700, fontSize:13 }}>Unlock more with Pro</span>
              </div>
              <p style={{ color:'#6a7a9a', fontSize:12, margin:'0 0 12px', lineHeight:1.5 }}>
                Get unlimited meetings, 100GB storage and priority AI processing.
              </p>
              <button
                onClick={() => toast.success('Upgrade feature coming soon!')}
                style={{ width:'100%', padding:'10px', background:'linear-gradient(90deg,#5b8dee,#a78bfa)', border:'none', borderRadius:8, color:'#fff', fontWeight:600, fontSize:13, cursor:'pointer', fontFamily:'Inter, sans-serif', boxShadow:'0 4px 14px rgba(91,141,238,0.3)' }}>
                Upgrade to Pro →
              </button>
            </div>
          </div>

          {/* Account Details */}
          <div style={card}>
            <h3 style={{ color: colors.textPrimary, fontWeight:700, fontSize:15, margin:'0 0 16px' }}>Account Details</h3>
            {[
              { icon:'🗓️', label:'Member Since', value: joinedDate },
              { icon:'🕐', label:'Last Login',   value:'Today' },
              { icon:'📊', label:'AI Summaries', value:`${stats?.done || 0} generated` },
              { icon:'⚡', label:'This Week',    value:`${stats?.this_week || 0} meetings` },
            ].map(({ icon, label, value }) => (
              <div key={label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{ fontSize:15 }}>{icon}</span>
                  <span style={{ color: colors.textSecondary, fontSize:13 }}>{label}</span>
                </div>
                <span style={{ color: colors.textPrimary, fontSize:13, fontWeight:500 }}>{value}</span>
              </div>
            ))}
          </div>

          {/* Danger Zone */}
          <div style={{ ...card, border:'1px solid rgba(239,68,68,0.15)' }}>
            <h3 style={{ color:'#f87171', fontWeight:600, fontSize:14, margin:'0 0 12px' }}>Danger Zone</h3>
            <button
              onClick={() => toast.error('Contact support to delete your account')}
              style={{ width:'100%', padding:'10px', background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:9, color:'#f87171', fontSize:13, cursor:'pointer', fontFamily:'Inter, sans-serif' }}>
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </UserLayout>
  )
}