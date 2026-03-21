import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import UserLayout from '../../components/user/UserLayout'
import api from '../../utils/api'
import {
  FileText, Mic, CheckCircle, Cloud, Download, Eye,
  TrendingUp, Clock, Zap, BarChart2, Activity, ArrowRight
} from 'lucide-react'

const fmt = (s) => {
  if (!s || s === 0) return '—'
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`
}

const statusLabel = (s) => ({
  done: 'Completed', processing: 'Processing', failed: 'Failed', pending: 'Pending'
}[s] || s)

function Badge({ status }) {
  const m = {
    Completed:  { bg: 'rgba(16,185,129,0.18)',  color: '#34d399', dot: '#10b981' },
    Processing: { bg: 'rgba(245,158,11,0.18)',  color: '#fbbf24', dot: '#f59e0b' },
    Failed:     { bg: 'rgba(239,68,68,0.18)',   color: '#f87171', dot: '#ef4444' },
    Pending:    { bg: 'rgba(91,141,238,0.18)',  color: '#7aa7f5', dot: '#5b8dee' },
  }
  const s = m[status] || m.Pending
  return (
    <span style={{ background: s.bg, color: s.color, borderRadius: 20, padding: '4px 12px', fontSize: 12, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.dot, animation: status === 'Processing' ? 'pulse 1.5s infinite' : 'none' }}/>
      {status}
    </span>
  )
}

function StatCard({ label, value, sub, icon: Icon, gradient }) {
  return (
    <div style={{ background: gradient, borderRadius: 16, padding: '20px 22px', display: 'flex', alignItems: 'center', gap: 16, border: '1px solid rgba(255,255,255,0.05)', minHeight: 100 }}>
      <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(255,255,255,0.13)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={24} color="#fff"/>
      </div>
      <div>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, margin: 0 }}>{label}</p>
        <p style={{ color: '#fff', fontSize: 32, fontWeight: 700, margin: '2px 0 0', lineHeight: 1.1 }}>{value}</p>
        {sub && <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, margin: '4px 0 0' }}>{sub}</p>}
      </div>
    </div>
  )
}

function ActivityItem({ meeting, colors }) {
  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime()
    const m = Math.floor(diff / 60000)
    const h = Math.floor(m / 60)
    const d = Math.floor(h / 24)
    if (d > 0) return `${d}d ago`
    if (h > 0) return `${h}h ago`
    if (m > 0) return `${m}m ago`
    return 'Just now'
  }

  const statusInfo = {
    done:       { color: '#34d399', bg: 'rgba(16,185,129,0.12)',  label: 'Processed',  icon: CheckCircle },
    processing: { color: '#fbbf24', bg: 'rgba(245,158,11,0.12)', label: 'Processing', icon: Activity },
    failed:     { color: '#f87171', bg: 'rgba(239,68,68,0.12)',  label: 'Failed',     icon: FileText },
    pending:    { color: '#7aa7f5', bg: 'rgba(91,141,238,0.12)', label: 'Pending',    icon: Clock },
  }
  const s    = statusInfo[meeting.status] || statusInfo.pending
  const Icon = s.icon

  return (
    <div style={{ display: 'flex', gap: 14, padding: '14px 0', borderBottom: `1px solid ${colors.border}`, alignItems: 'flex-start' }}>
      <div style={{ width: 38, height: 38, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
        <Icon size={17} color={s.color}/>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ color: colors.textPrimary, fontWeight: 600, fontSize: 14, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {meeting.title}
        </p>
        <div style={{ display: 'flex', gap: 10, marginTop: 4, alignItems: 'center' }}>
          <span style={{ color: s.color, fontSize: 12, fontWeight: 500 }}>{s.label}</span>
          {meeting.duration_seconds > 0 && (
            <span style={{ color: colors.textMuted, fontSize: 12 }}>· {fmt(meeting.duration_seconds)}</span>
          )}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
        <span style={{ color: colors.textMuted, fontSize: 11 }}>{timeAgo(meeting.created_at)}</span>
        <Link to="/meetings">
          <button style={{ background: 'rgba(91,141,238,0.1)', border: 'none', borderRadius: 6, width: 28, height: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Eye size={13} color="#7aa7f5"/>
          </button>
        </Link>
      </div>
    </div>
  )
}

export default function UserDashboard() {
  const { user, profile }         = useAuth()
  const { colors }                = useTheme()
  const [stats, setStats]         = useState({ total_meetings: 0, status_breakdown: { done: 0, processing: 0, failed: 0 }, this_week: 0, storage_mb: 0 })
  const [meetings, setMeetings]   = useState([])
  const [latestSummary, setLatestSummary] = useState(null)
  const [search, setSearch]       = useState('')

  const displayName = profile?.name || user?.email?.split('@')[0] || 'User'

  const fetchData = () => {
    if (!user?.id) return
    Promise.all([
      api.get(`/users/${user.id}/stats`).catch(() => ({ data: null })),
      api.get('/meetings/', { params: { user_id: user.id } }).catch(() => ({ data: [] })),
    ]).then(([statsRes, meetingsRes]) => {
      if (statsRes.data) {
        const s = statsRes.data
        setStats({
          total_meetings: s.total_meetings ?? 0,
          this_week:      s.this_week      ?? 0,
          storage_mb:     s.storage_mb     ?? 0,
          status_breakdown: {
            done:       s.done       ?? 0,
            processing: s.processing ?? 0,
            failed:     s.failed     ?? 0,
          }
        })
      }
      if (meetingsRes.data?.length) {
        setMeetings(meetingsRes.data)
        const latestDone = meetingsRes.data.find(m => m.status === 'done')
        if (latestDone) {
          api.get(`/meetings/${latestDone.id}`)
            .then(r => { if (r.data?.summary) setLatestSummary({ ...r.data.summary, title: latestDone.title, date: latestDone.created_at }) })
            .catch(() => {})
        }
      }
    })
  }

  useEffect(() => {
    fetchData()
    const t = setInterval(fetchData, 5000)
    return () => clearInterval(t)
  }, [user])

  const card = {
    background: colors.cardBg, borderRadius: 16,
    border: `1px solid ${colors.border}`, padding: 24,
    transition: 'background 0.3s, border-color 0.3s'
  }

  const weekDays   = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const weekCounts = weekDays.map((day, i) =>
    meetings.filter(m => {
      if (!m.created_at) return false
      return new Date(m.created_at).getDay() === (i + 1) % 7
    }).length
  )
  const maxCount = Math.max(...weekCounts, 1)

  const successRate = stats.total_meetings > 0
    ? Math.round((stats.status_breakdown.done / stats.total_meetings) * 100)
    : 0

  const avgDuration = meetings.length > 0
    ? Math.round(meetings.reduce((acc, m) => acc + (m.duration_seconds || 0), 0) / meetings.length)
    : 0

  return (
    <UserLayout title="Dashboard" subtitle={`Welcome back, ${displayName}!`} onSearch={setSearch}>

      {/* ── Stat Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
        <StatCard label="Total Meetings" value={stats.total_meetings}              sub="All time"     icon={FileText}    gradient="linear-gradient(135deg,#1a3a5c,#1e40af)" />
        <StatCard label="Transcripts"    value={stats.status_breakdown.done}       sub="Generated"   icon={Mic}         gradient="linear-gradient(135deg,#1a1a3e,#3730a3)" />
        <StatCard label="Summaries"      value={stats.status_breakdown.done}       sub="Ready"       icon={CheckCircle} gradient="linear-gradient(135deg,#1a2e1a,#166534)" />
        <StatCard label="Processing"     value={stats.status_breakdown.processing} sub="In progress" icon={Cloud}       gradient="linear-gradient(135deg,#1e1b4b,#4c1d95)" />
      </div>

      {/* ── Main Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24 }}>

        {/* ── LEFT ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>

          {/* Analytics Overview */}
          <div style={card}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <BarChart2 size={18} color="#5b8dee"/>
                <h2 style={{ color: colors.textPrimary, fontWeight: 700, fontSize: 16, margin: 0 }}>Analytics Overview</h2>
              </div>
              <span style={{ background: 'rgba(16,185,129,0.15)', color: '#34d399', borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', animation: 'pulse 1.5s infinite', display: 'inline-block' }}/>
                Live
              </span>
            </div>

            {/* Key metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 24 }}>
              {[
                { label: 'Success Rate', value: `${successRate}%`, icon: TrendingUp, color: '#34d399', bg: 'rgba(16,185,129,0.1)'  },
                { label: 'This Week',    value: stats.this_week,   icon: Activity,   color: '#fbbf24', bg: 'rgba(245,158,11,0.1)'  },
                { label: 'Avg Duration', value: fmt(avgDuration),  icon: Clock,      color: '#a78bfa', bg: 'rgba(167,139,250,0.1)' },
              ].map(({ label, value, icon: Icon, color, bg }) => (
                <div key={label} style={{ background: colors.inputBg, borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={17} color={color}/>
                  </div>
                  <div>
                    <p style={{ color, fontSize: 20, fontWeight: 700, margin: 0 }}>{value}</p>
                    <p style={{ color: colors.textSecondary, fontSize: 12, margin: 0 }}>{label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Weekly bar chart — FIXED: no duplicate fontSize */}
            <div>
              <p style={{ color: colors.textSecondary, fontSize: 11, fontWeight: 600, margin: '0 0 14px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Meetings this week
              </p>
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', height: 80 }}>
                {weekDays.map((day, i) => {
                  const count   = weekCounts[i]
                  const height  = count > 0 ? Math.max((count / maxCount) * 64, 8) : 4
                  const isToday = new Date().getDay() === (i + 1) % 7
                  return (
                    <div key={day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                      <div style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center' }}>
                        {count > 0 && (
                          <span style={{ position: 'absolute', top: -18, color: '#7aa7f5', fontSize: 10, fontWeight: 700 }}>{count}</span>
                        )}
                        <div style={{
                          width: '100%', height: height,
                          background: isToday
                            ? 'linear-gradient(180deg,#5b8dee,#a78bfa)'
                            : count > 0 ? 'rgba(91,141,238,0.5)' : colors.inputBg,
                          borderRadius: 4,
                          transition: 'height 0.5s ease'
                        }}/>
                      </div>
                      <span style={{ color: isToday ? '#7aa7f5' : colors.textMuted, fontSize: 11, fontWeight: isToday ? 700 : 400 }}>{day}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Status breakdown */}
            <div style={{ marginTop: 20, paddingTop: 20, borderTop: `1px solid ${colors.border}` }}>
              <p style={{ color: colors.textSecondary, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 12px' }}>
                Status breakdown
              </p>
              <div style={{ display: 'flex', gap: 16 }}>
                {[
                  { label: 'Completed',  value: stats.status_breakdown.done,        color: '#34d399' },
                  { label: 'Processing', value: stats.status_breakdown.processing,   color: '#fbbf24' },
                  { label: 'Failed',     value: stats.status_breakdown.failed,       color: '#f87171' },
                ].map(({ label, value, color }) => {
                  const pct = stats.total_meetings > 0 ? Math.round((value / stats.total_meetings) * 100) : 0
                  return (
                    <div key={label} style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                        <span style={{ color: colors.textSecondary, fontSize: 12 }}>{label}</span>
                        <span style={{ color, fontSize: 12, fontWeight: 600 }}>{value}</span>
                      </div>
                      <div style={{ height: 5, background: colors.inputBg, borderRadius: 4 }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 4, transition: 'width 0.8s ease' }}/>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div style={card}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Activity size={18} color="#5b8dee"/>
                <h2 style={{ color: colors.textPrimary, fontWeight: 700, fontSize: 16, margin: 0 }}>Recent Activity</h2>
              </div>
              <Link to="/meetings" style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#5b8dee', fontSize: 13, fontWeight: 500 }}>
                View all <ArrowRight size={13}/>
              </Link>
            </div>

            {meetings.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 0' }}>
                <Activity size={32} color={colors.textMuted} style={{ marginBottom: 10 }}/>
                <p style={{ color: colors.textSecondary, fontSize: 14, margin: 0 }}>No activity yet</p>
                <p style={{ color: colors.textMuted, fontSize: 12, margin: '4px 0 16px' }}>Upload a meeting to see activity here</p>
                <Link to="/upload">
                  <button style={{ background: 'linear-gradient(90deg,#5b8dee,#a78bfa)', border: 'none', borderRadius: 10, padding: '10px 24px', color: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                    Upload Meeting
                  </button>
                </Link>
              </div>
            ) : (
              <div>
                {meetings.slice(0, 5).map(m => (
                  <ActivityItem key={m.id} meeting={m} colors={colors}/>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Quick Actions */}
          <div style={card}>
            <h3 style={{ color: colors.textPrimary, fontWeight: 700, fontSize: 15, margin: '0 0 16px' }}>Quick Actions</h3>
            {[
              { label: 'Upload Meeting',  icon: FileText,    g: 'linear-gradient(90deg,#2563eb,#5b8dee)', to: '/upload'    },
              { label: 'Start Recording', icon: Mic,         g: 'linear-gradient(90deg,#7c3aed,#db2777)', to: '/upload'    },
              { label: 'View Summaries',  icon: CheckCircle, g: 'linear-gradient(90deg,#059669,#0d9488)', to: '/summaries' },
              { label: 'Export Report',   icon: Download,    g: 'linear-gradient(90deg,#d97706,#dc2626)', to: '/meetings'  },
            ].map(({ label, icon: Icon, g, to }) => (
              <Link key={label} to={to}>
                <button className="quick-btn" style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, background: g, border: 'none', borderRadius: 10, padding: '12px 16px', marginBottom: 10, color: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'opacity 0.15s, transform 0.15s' }}>
                  <Icon size={17}/> {label}
                </button>
              </Link>
            ))}
          </div>

          {/* Latest AI Summary */}
          <div style={card}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <Zap size={16} color="#fbbf24"/>
              <h3 style={{ color: colors.textPrimary, fontWeight: 700, fontSize: 15, margin: 0 }}>Latest AI Summary</h3>
            </div>
            {latestSummary ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span style={{ color: colors.textPrimary, fontWeight: 700, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                    {latestSummary.title}
                  </span>
                  <span style={{ color: colors.textSecondary, fontSize: 12, flexShrink: 0, marginLeft: 8 }}>
                    {latestSummary.date ? new Date(latestSummary.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
                  </span>
                </div>
                <p style={{ color: colors.textSecondary, fontSize: 13, lineHeight: 1.6, margin: '0 0 12px' }}>
                  {latestSummary.short_summary?.slice(0, 160)}{latestSummary.short_summary?.length > 160 ? '...' : ''}
                </p>
                {latestSummary.action_items?.length > 0 && (
                  <div style={{ marginBottom: 12 }}>
                    <p style={{ color: colors.textMuted, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 8px' }}>Action Items</p>
                    {latestSummary.action_items.slice(0, 2).map((a, i) => (
                      <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                        <span style={{ color: '#5b8dee', fontSize: 14, lineHeight: 1.4 }}>•</span>
                        <p style={{ color: colors.textSecondary, fontSize: 12, margin: 0, lineHeight: 1.5 }}>{a}</p>
                      </div>
                    ))}
                  </div>
                )}
                {latestSummary.keywords?.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                    {latestSummary.keywords.slice(0, 3).map((kw, i) => (
                      <span key={i} style={{ background: 'rgba(91,141,238,0.1)', color: '#7aa7f5', borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 500 }}>{kw}</span>
                    ))}
                  </div>
                )}
                <Link to="/summaries" style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#5b8dee', fontSize: 13, fontWeight: 500 }}>
                  View full summary <ArrowRight size={13}/>
                </Link>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <FileText size={28} color={colors.textMuted} style={{ marginBottom: 8 }}/>
                <p style={{ color: colors.textSecondary, fontSize: 13, margin: 0 }}>No summaries yet</p>
                <p style={{ color: colors.textMuted, fontSize: 12, margin: '4px 0 0' }}>Upload a meeting to see AI summaries here</p>
              </div>
            )}
          </div>

          {/* Subscription */}
          <div style={card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ color: colors.textPrimary, fontWeight: 700, fontSize: 15, margin: 0 }}>Subscription</h3>
              <span style={{ background: 'rgba(91,141,238,0.2)', color: '#7aa7f5', borderRadius: 6, padding: '4px 12px', fontSize: 12, fontWeight: 600 }}>Pro Plan</span>
            </div>
            <p style={{ color: colors.textSecondary, fontSize: 13, margin: '0 0 10px' }}>
              Valid till <strong style={{ color: colors.textPrimary }}>25 May 2024</strong>
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <p style={{ color: colors.textSecondary, fontSize: 13, margin: 0 }}>
                Meetings: <strong style={{ color: colors.textPrimary }}>{stats.total_meetings} / Unlimited</strong>
              </p>
              <button style={{ background: 'none', border: `1px solid ${colors.border}`, borderRadius: 6, padding: '5px 12px', color: '#7aa7f5', fontSize: 12, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                Manage
              </button>
            </div>
            <div style={{ height: 5, background: colors.inputBg, borderRadius: 4 }}>
              <div style={{ height: '100%', width: `${Math.min((stats.total_meetings / 10) * 100, 100)}%`, background: 'linear-gradient(90deg,#5b8dee,#a78bfa)', borderRadius: 4, transition: 'width 0.8s ease' }}/>
            </div>
          </div>

        </div>
      </div>
    </UserLayout>
  )
}