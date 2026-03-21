import { useState, useEffect, useRef } from 'react'
import UserSidebar from './UserSidebar'
import { Bell, Search, ChevronDown, User, Settings, LogOut, CheckCircle, Clock, AlertCircle, X } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { useNavigate, Link } from 'react-router-dom'
import api from '../../utils/api'

export default function UserLayout({ children, title, subtitle, onSearch }) {
  const { profile, user, signOut } = useAuth()
  const { colors, isDark }         = useTheme()
  const navigate                   = useNavigate()
  const displayName  = profile?.name || user?.email?.split('@')[0] || 'User'
  const displayEmail = user?.email || 'user@clarivox.ai'
  const initials     = displayName?.[0]?.toUpperCase() || 'U'

  const [dropOpen, setDropOpen]   = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifs, setNotifs]       = useState([])
  const dropRef  = useRef(null)
  const notifRef = useRef(null)

  // Poll meetings to generate dynamic notifications
  useEffect(() => {
    if (!user?.id) return
    const prevStatuses = {}

    const checkNotifs = async () => {
      try {
        const r = await api.get('/meetings/', { params: { user_id: user.id } })
        const meetings = r.data || []
        const newNotifs = []

        meetings.forEach(m => {
          const prev = prevStatuses[m.id]
          if (prev && prev !== m.status) {
            if (m.status === 'done') {
              newNotifs.push({
                id: `${m.id}-done-${Date.now()}`,
                type: 'success',
                title: 'Processing Complete',
                message: `"${m.title}" has been transcribed and summarised.`,
                time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                read: false
              })
            } else if (m.status === 'failed') {
              newNotifs.push({
                id: `${m.id}-failed-${Date.now()}`,
                type: 'error',
                title: 'Processing Failed',
                message: `"${m.title}" could not be processed. Please try again.`,
                time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                read: false
              })
            }
          }
          prevStatuses[m.id] = m.status
        })

        if (newNotifs.length > 0) {
          setNotifs(prev => [...newNotifs, ...prev].slice(0, 10))
        }
      } catch {}
    }

    // Initialize statuses
    api.get('/meetings/', { params: { user_id: user.id } })
      .then(r => { (r.data || []).forEach(m => { prevStatuses[m.id] = m.status }) })
      .catch(() => {})

    const t = setInterval(checkNotifs, 5000)
    return () => clearInterval(t)
  }, [user])

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false)
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const unreadCount = notifs.filter(n => !n.read).length
  const markAllRead = () => setNotifs(prev => prev.map(n => ({ ...n, read: true })))
  const removeNotif = (id) => setNotifs(prev => prev.filter(n => n.id !== id))

  const notifIcon = (type) => {
    if (type === 'success') return <CheckCircle size={15} color="#34d399"/>
    if (type === 'error')   return <AlertCircle size={15} color="#f87171"/>
    return <Clock size={15} color="#7aa7f5"/>
  }

  const notifBg = (type) => {
    if (type === 'success') return 'rgba(16,185,129,0.12)'
    if (type === 'error')   return 'rgba(239,68,68,0.12)'
    return 'rgba(91,141,238,0.12)'
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: colors.pageBg, fontFamily: 'Inter, sans-serif', transition: 'background 0.3s' }}>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.35} }
        @keyframes spin  { to{transform:rotate(360deg)} }
        @keyframes slideDown { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
        * { box-sizing:border-box; }
        a { text-decoration:none; }
        .row-hover:hover  { background:${colors.rowHover} !important; cursor:pointer; }
        .icon-btn:hover   { opacity:0.8; }
        .quick-btn:hover  { opacity:0.88; transform:translateY(-1px); }
        .drop-item:hover  { background:${colors.inputBg} !important; }
        input::placeholder { color:${colors.textMuted}; }
        select option { background:${colors.cardBg}; color:${colors.textPrimary} }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-thumb { background:${colors.scrollThumb}; border-radius:4px; }
      `}</style>

      <UserSidebar/>

      <div style={{ marginLeft: 258, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <header style={{
          height: 68, background: colors.headerBg,
          borderBottom: `1px solid ${colors.border}`,
          padding: '0 32px', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 40,
          backdropFilter: 'blur(12px)', transition: 'background 0.3s'
        }}>
          <div>
            <h1 style={{ color: colors.textPrimary, fontWeight: 700, fontSize: 21, margin: 0, transition: 'color 0.3s' }}>{title}</h1>
            {subtitle && <p style={{ color: colors.textSecondary, fontSize: 13, margin: 0 }}>{subtitle}</p>}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {onSearch && (
              <div style={{ position: 'relative' }}>
                <Search size={14} color={colors.textMuted} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}/>
                <input onChange={e => onSearch(e.target.value)} placeholder="Search meetings..."
                  style={{ background: colors.inputBg, border: `1px solid ${colors.borderInput}`, borderRadius: 10, padding: '8px 14px 8px 34px', color: colors.textPrimary, fontSize: 13, outline: 'none', width: 230 }}/>
              </div>
            )}

            {/* ── Notification Bell ── */}
            <div ref={notifRef} style={{ position: 'relative' }}>
              <button onClick={() => { setNotifOpen(p => !p); setDropOpen(false) }} style={{ position: 'relative', background: 'transparent', border: 'none', cursor: 'pointer', padding: 4 }}>
                <Bell size={20} color={colors.textSecondary}/>
                {unreadCount > 0 && (
                  <span style={{ position: 'absolute', top: -2, right: -2, width: 18, height: 18, background: '#ef4444', borderRadius: '50%', fontSize: 10, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                    {unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div style={{ position: 'absolute', right: 0, top: 44, width: 340, background: colors.cardBg, border: `1px solid ${colors.border}`, borderRadius: 16, boxShadow: '0 16px 48px rgba(0,0,0,0.3)', zIndex: 100, animation: 'slideDown 0.2s ease', overflow: 'hidden' }}>
                  <div style={{ padding: '14px 18px', borderBottom: `1px solid ${colors.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: colors.textPrimary, fontWeight: 700, fontSize: 14 }}>Notifications</span>
                    {unreadCount > 0 && (
                      <button onClick={markAllRead} style={{ background: 'none', border: 'none', color: '#5b8dee', fontSize: 12, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div style={{ maxHeight: 320, overflowY: 'auto' }}>
                    {notifs.length === 0 ? (
                      <div style={{ padding: '32px 18px', textAlign: 'center' }}>
                        <Bell size={28} color={colors.textMuted} style={{ marginBottom: 8 }}/>
                        <p style={{ color: colors.textSecondary, fontSize: 13, margin: 0 }}>No notifications yet</p>
                        <p style={{ color: colors.textMuted, fontSize: 12, margin: '4px 0 0' }}>You'll be notified when meetings finish processing</p>
                      </div>
                    ) : (
                      notifs.map(n => (
                        <div key={n.id} style={{ padding: '12px 18px', borderBottom: `1px solid ${colors.border}`, background: n.read ? 'transparent' : (isDark ? 'rgba(91,141,238,0.04)' : 'rgba(91,141,238,0.03)'), display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                          <div style={{ width: 32, height: 32, borderRadius: 8, background: notifBg(n.type), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                            {notifIcon(n.type)}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <p style={{ color: colors.textPrimary, fontWeight: 600, fontSize: 13, margin: 0 }}>{n.title}</p>
                              {!n.read && <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#5b8dee', flexShrink: 0, marginTop: 4 }}/>}
                            </div>
                            <p style={{ color: colors.textSecondary, fontSize: 12, margin: '3px 0 4px', lineHeight: 1.4 }}>{n.message}</p>
                            <span style={{ color: colors.textMuted, fontSize: 11 }}>{n.time}</span>
                          </div>
                          <button onClick={() => removeNotif(n.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.textMuted, padding: 2, flexShrink: 0 }}>
                            <X size={12}/>
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* ── User Dropdown ── */}
            <div ref={dropRef} style={{ position: 'relative' }}>
              <button onClick={() => { setDropOpen(p => !p); setNotifOpen(false) }} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', background: 'transparent', border: 'none', padding: '6px 10px', borderRadius: 10, transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = colors.inputBg}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#5b8dee,#a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, color: '#fff', flexShrink: 0 }}>{initials}</div>
                <div style={{ textAlign: 'left' }}>
                  <p style={{ color: colors.textPrimary, fontSize: 13, fontWeight: 600, margin: 0 }}>{displayName}</p>
                  <p style={{ color: colors.textSecondary, fontSize: 11, margin: 0 }}>{displayEmail}</p>
                </div>
                <ChevronDown size={13} color={colors.textSecondary} style={{ transform: dropOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}/>
              </button>

              {dropOpen && (
                <div style={{ position: 'absolute', right: 0, top: 54, width: 260, background: colors.cardBg, border: `1px solid ${colors.border}`, borderRadius: 16, boxShadow: '0 16px 48px rgba(0,0,0,0.3)', zIndex: 100, animation: 'slideDown 0.2s ease', overflow: 'hidden' }}>

                  {/* User info header */}
                  <div style={{ padding: '16px 18px', borderBottom: `1px solid ${colors.border}`, background: isDark ? 'rgba(91,141,238,0.06)' : 'rgba(91,141,238,0.04)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg,#5b8dee,#a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 18, color: '#fff' }}>{initials}</div>
                      <div>
                        <p style={{ color: colors.textPrimary, fontWeight: 700, fontSize: 14, margin: 0 }}>{displayName}</p>
                        <p style={{ color: colors.textSecondary, fontSize: 12, margin: '2px 0 0' }}>{displayEmail}</p>
                      </div>
                    </div>
                    <div style={{ marginTop: 10, background: 'rgba(91,141,238,0.1)', borderRadius: 8, padding: '6px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#7aa7f5', fontSize: 12, fontWeight: 500 }}>Free Plan</span>
                      <button onClick={() => { setDropOpen(false); navigate('/settings?upgrade=true') }} style={{ background: 'linear-gradient(90deg,#5b8dee,#a78bfa)', border: 'none', borderRadius: 6, padding: '4px 10px', color: '#fff', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                        Upgrade →
                      </button>
                    </div>
                  </div>

                  {/* Menu items */}
                  {[
                    { icon: User,     label: 'View Profile',  path: '/profile' },
                    { icon: Settings, label: 'Settings',      path: '/settings' },
                  ].map(({ icon: Icon, label, path }) => (
                    <Link key={label} to={path} onClick={() => setDropOpen(false)} className="drop-item" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 18px', color: colors.textPrimary, textDecoration: 'none', fontSize: 14, transition: 'background 0.15s' }}>
                      <Icon size={16} color={colors.textSecondary}/>
                      {label}
                    </Link>
                  ))}

                  <div style={{ height: 1, background: colors.border, margin: '4px 0' }}/>

                  <button onClick={() => { signOut(); navigate('/login') }} className="drop-item" style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '11px 18px', background: 'transparent', border: 'none', color: '#f87171', fontSize: 14, cursor: 'pointer', fontFamily: 'Inter, sans-serif', textAlign: 'left', transition: 'background 0.15s' }}>
                    <LogOut size={16} color="#f87171"/>
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main style={{ padding: '26px 32px', flex: 1 }}>{children}</main>
      </div>
    </div>
  )
}