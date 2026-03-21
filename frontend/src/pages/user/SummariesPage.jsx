import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import UserLayout from '../../components/user/UserLayout'
import api from '../../utils/api'
import { FileText, Tag, CheckSquare, X, Download, Mic, BarChart2 } from 'lucide-react'

const fmt = (s) => {
  if (!s || s === 0) return '—'
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`
}

function SentimentBadge({ sentiment }) {
  const m = {
    positive: { bg: 'rgba(16,185,129,0.15)', color: '#34d399', label: '😊 Positive' },
    negative: { bg: 'rgba(239,68,68,0.15)',  color: '#f87171', label: '😟 Negative' },
    neutral:  { bg: 'rgba(91,141,238,0.15)', color: '#7aa7f5', label: '😐 Neutral'  },
  }
  const s = m[sentiment] || m.neutral
  return (
    <span style={{ background: s.bg, color: s.color, borderRadius: 20, padding: '4px 12px', fontSize: 12, fontWeight: 600 }}>
      {s.label}
    </span>
  )
}

// ── Summary Modal ─────────────────────────────────────────────────────────────
function SummaryModal({ meeting, onClose }) {
  const { colors, isDark } = useTheme()
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab]         = useState('summary')

  useEffect(() => {
    api.get(`/meetings/${meeting.id}`)
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [meeting.id])

  const modalBg  = isDark ? '#0f1117' : '#ffffff'
  const innerBg  = isDark ? '#0a0c14' : '#f8faff'
  const textMain = isDark ? '#e2e8f0' : '#0f172a'
  const textSub  = isDark ? '#9ca3af' : '#475569'
  const textMuted= isDark ? '#4a5a7a' : '#94a3b8'
  const border   = isDark ? 'rgba(91,141,238,0.12)' : 'rgba(91,141,238,0.2)'

  const downloadTxt = () => {
    if (!data) return
    const lines = [
      `Clarivox Summary Report`,
      `═══════════════════════`,
      `Title:    ${data.meeting.title}`,
      `Date:     ${new Date(data.meeting.created_at).toLocaleString()}`,
      `Duration: ${fmt(data.meeting.duration_seconds)}`,
      `Sentiment:${data.summary?.sentiment || 'neutral'}`,
      '',
      '─── SUMMARY ───',
      data.summary?.short_summary || 'Not available',
      '',
      '─── ACTION ITEMS ───',
      ...(data.summary?.action_items || []).map((a, i) => `${i + 1}. ${a}`),
      '',
      '─── KEYWORDS ───',
      (data.summary?.keywords || []).join(', '),
      '',
      '─── FULL TRANSCRIPT ───',
      data.transcript?.full_text || 'Not available',
    ].join('\n')
    const blob = new Blob([lines], { type: 'text/plain' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url; a.download = `${data.meeting.title}-summary.txt`; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      onClick={onClose}>
      <div style={{ background: modalBg, borderRadius: 20, border: `1px solid ${border}`, width: '100%', maxWidth: 800, maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ padding: '20px 26px', borderBottom: `1px solid ${border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ color: textMain, fontWeight: 700, fontSize: 18, margin: 0 }}>{meeting.title}</h2>
            <div style={{ display: 'flex', gap: 12, marginTop: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ color: textMuted, fontSize: 12 }}>
                {new Date(meeting.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
              {meeting.duration_seconds > 0 && (
                <span style={{ color: textMuted, fontSize: 12 }}>⏱ {fmt(meeting.duration_seconds)}</span>
              )}
              {data?.summary?.sentiment && <SentimentBadge sentiment={data.summary.sentiment}/>}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            {data?.transcript && (
              <button onClick={downloadTxt} style={{ background: 'rgba(91,141,238,0.12)', border: `1px solid ${border}`, borderRadius: 8, padding: '7px 14px', color: '#7aa7f5', fontSize: 13, cursor: 'pointer', fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Download size={14}/> Export
              </button>
            )}
            <button onClick={onClose} style={{ background: 'rgba(239,68,68,0.1)', border: 'none', borderRadius: 8, width: 34, height: 34, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <X size={16} color="#f87171"/>
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 60 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 36, height: 36, border: `3px solid ${border}`, borderTopColor: '#5b8dee', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 14px' }}/>
              <p style={{ color: textMuted, fontSize: 14 }}>Loading summary...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div style={{ display: 'flex', gap: 4, padding: '14px 26px 0', borderBottom: `1px solid ${border}` }}>
              {['summary', 'transcript'].map(t => (
                <button key={t} onClick={() => setTab(t)} style={{
                  padding: '8px 20px', borderRadius: '8px 8px 0 0', border: 'none', cursor: 'pointer',
                  background: tab === t ? (isDark ? '#0a0c14' : '#f0f4ff') : 'transparent',
                  color: tab === t ? '#7aa7f5' : textMuted,
                  fontWeight: tab === t ? 600 : 400, fontSize: 14,
                  borderBottom: tab === t ? '2px solid #5b8dee' : '2px solid transparent',
                  fontFamily: 'Inter, sans-serif', textTransform: 'capitalize'
                }}>{t}</button>
              ))}
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '22px 26px' }}>
              {tab === 'summary' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ background: innerBg, borderRadius: 12, border: `1px solid ${border}`, padding: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                      <FileText size={16} color="#5b8dee"/>
                      <h3 style={{ color: textMain, fontWeight: 600, fontSize: 15, margin: 0 }}>Summary</h3>
                    </div>
                    <p style={{ color: textSub, fontSize: 14, lineHeight: 1.8, margin: 0 }}>
                      {data?.summary?.short_summary || 'No summary available.'}
                    </p>
                  </div>

                  {data?.summary?.action_items?.length > 0 && (
                    <div style={{ background: innerBg, borderRadius: 12, border: `1px solid ${border}`, padding: 20 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                        <CheckSquare size={16} color="#5b8dee"/>
                        <h3 style={{ color: textMain, fontWeight: 600, fontSize: 15, margin: 0 }}>Action Items</h3>
                        <span style={{ background: 'rgba(91,141,238,0.15)', color: '#7aa7f5', borderRadius: 20, padding: '2px 8px', fontSize: 11, fontWeight: 600 }}>
                          {data.summary.action_items.length}
                        </span>
                      </div>
                      {data.summary.action_items.map((item, i) => (
                        <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 10, alignItems: 'flex-start' }}>
                          <span style={{ width: 24, height: 24, borderRadius: 6, background: 'rgba(91,141,238,0.15)', color: '#7aa7f5', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>{i + 1}</span>
                          <p style={{ color: textSub, fontSize: 13, margin: 0, lineHeight: 1.6 }}>{item}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {data?.summary?.keywords?.length > 0 && (
                    <div style={{ background: innerBg, borderRadius: 12, border: `1px solid ${border}`, padding: 20 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                        <Tag size={16} color="#5b8dee"/>
                        <h3 style={{ color: textMain, fontWeight: 600, fontSize: 15, margin: 0 }}>Keywords</h3>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {data.summary.keywords.map((kw, i) => (
                          <span key={i} style={{ background: 'rgba(91,141,238,0.12)', border: `1px solid ${border}`, color: '#7aa7f5', borderRadius: 20, padding: '5px 14px', fontSize: 12, fontWeight: 500 }}>{kw}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {tab === 'transcript' && (
                <div style={{ background: innerBg, borderRadius: 12, border: `1px solid ${border}`, padding: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Mic size={16} color="#5b8dee"/>
                      <h3 style={{ color: textMain, fontWeight: 600, fontSize: 15, margin: 0 }}>Full Transcript</h3>
                    </div>
                    <button onClick={() => { navigator.clipboard.writeText(data?.transcript?.full_text || ''); alert('Copied!') }}
                      style={{ background: 'rgba(91,141,238,0.1)', border: `1px solid ${border}`, borderRadius: 7, padding: '5px 12px', color: '#7aa7f5', fontSize: 12, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                      Copy
                    </button>
                  </div>
                  <p style={{ color: textSub, fontSize: 13, lineHeight: 1.9, margin: 0, whiteSpace: 'pre-wrap' }}>
                    {data?.transcript?.full_text || 'No transcript available.'}
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ── Summary Card ──────────────────────────────────────────────────────────────
function SummaryCard({ meeting, onOpen, colors }) {
  const [summary, setSummary] = useState(null)

  useEffect(() => {
    api.get(`/meetings/${meeting.id}`)
      .then(r => { if (r.data?.summary) setSummary(r.data.summary) })
      .catch(() => {})
  }, [meeting.id])

  const sentimentColor = {
    positive: '#34d399', negative: '#f87171', neutral: '#7aa7f5'
  }

  return (
    <div onClick={onOpen}
      style={{ background: colors.cardBg, borderRadius: 16, border: `1px solid ${colors.border}`, padding: 22, cursor: 'pointer', transition: 'all 0.2s' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = 'rgba(91,141,238,0.4)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = colors.border }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ color: colors.textPrimary, fontWeight: 700, fontSize: 15, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {meeting.title}
          </h3>
          <p style={{ color: colors.textSecondary, fontSize: 12, margin: '4px 0 0' }}>
            {new Date(meeting.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            {meeting.duration_seconds > 0 ? ` · ${fmt(meeting.duration_seconds)}` : ''}
          </p>
        </div>
        {summary?.sentiment && (
          <span style={{ background: `${sentimentColor[summary.sentiment]}22`, color: sentimentColor[summary.sentiment], borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 600, flexShrink: 0, marginLeft: 10, textTransform: 'capitalize' }}>
            {summary.sentiment}
          </span>
        )}
      </div>

      <p style={{ color: colors.textSecondary, fontSize: 13, lineHeight: 1.6, margin: '0 0 14px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {summary?.short_summary || 'Loading summary...'}
      </p>

      {summary?.keywords?.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
          {summary.keywords.slice(0, 4).map((kw, i) => (
            <span key={i} style={{ background: 'rgba(91,141,238,0.1)', color: '#7aa7f5', borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 500 }}>{kw}</span>
          ))}
          {summary.keywords.length > 4 && (
            <span style={{ background: colors.inputBg, color: colors.textSecondary, borderRadius: 20, padding: '3px 10px', fontSize: 11 }}>+{summary.keywords.length - 4} more</span>
          )}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTop: `1px solid ${colors.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {summary?.action_items?.length > 0 && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: colors.textSecondary, fontSize: 12 }}>
              <CheckSquare size={13} color="#5b8dee"/>
              {summary.action_items.length} action{summary.action_items.length !== 1 ? 's' : ''}
            </span>
          )}
          {summary?.keywords?.length > 0 && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: colors.textSecondary, fontSize: 12 }}>
              <Tag size={13} color="#a78bfa"/>
              {summary.keywords.length} keywords
            </span>
          )}
        </div>
        <span style={{ color: '#5b8dee', fontSize: 13, fontWeight: 500 }}>View full →</span>
      </div>
    </div>
  )
}

// ── Main Summaries Page ───────────────────────────────────────────────────────
export default function SummariesPage() {
  const { user }           = useAuth()
  const { colors, isDark } = useTheme()
  const [meetings, setMeetings]   = useState([])
  const [selected, setSelected]   = useState(null)
  const [search, setSearch]       = useState('')
  const [filter, setFilter]       = useState('all')
  const [loading, setLoading]     = useState(true)
  // KEY FIX: store sentiments separately so filter works
  const [sentiments, setSentiments] = useState({})

  // Load meetings
  useEffect(() => {
    const load = () => {
      if (!user?.id) return
      api.get('/meetings/', { params: { user_id: user.id } })
        .then(r => {
          const done = (r.data || []).filter(m => m.status === 'done')
          setMeetings(done)
        })
        .catch(() => {})
        .finally(() => setLoading(false))
    }
    load()
    const t = setInterval(load, 5000)
    return () => clearInterval(t)
  }, [user])

  // Fetch sentiment for each meeting so filter works
  useEffect(() => {
    meetings.forEach(m => {
      if (sentiments[m.id]) return // already loaded
      api.get(`/meetings/${m.id}`)
        .then(r => {
          const sentiment = r.data?.summary?.sentiment
          if (sentiment) {
            setSentiments(prev => ({ ...prev, [m.id]: sentiment }))
          }
        })
        .catch(() => {})
    })
  }, [meetings])

  // Compute real stats from loaded sentiments
  const totalActionItems = Object.keys(sentiments).length  // placeholder until full data
  const totalKeywords    = meetings.length * 3             // rough estimate

  // Filter with working sentiment
  const filtered = meetings.filter(m => {
    const matchSearch  = m.title.toLowerCase().includes(search.toLowerCase())
    const matchSentiment = filter === 'all' || sentiments[m.id] === filter
    return matchSearch && matchSentiment
  })

  const card = {
    background: colors.cardBg,
    borderRadius: 16,
    border: `1px solid ${colors.border}`,
    transition: 'background 0.3s'
  }

  const filterBtn = (val, label, count) => {
    const isActive = filter === val
    return (
      <button key={val} onClick={() => setFilter(val)} style={{
        padding: '7px 16px', borderRadius: 8, fontSize: 13,
        fontWeight: isActive ? 600 : 400,
        background: isActive ? 'rgba(91,141,238,0.2)' : 'transparent',
        color: isActive ? '#7aa7f5' : colors.textSecondary,
        border: isActive ? '1px solid rgba(91,141,238,0.4)' : '1px solid transparent',
        cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'all 0.15s',
        display: 'flex', alignItems: 'center', gap: 6
      }}>
        {label}
        {count !== undefined && (
          <span style={{ background: isActive ? 'rgba(91,141,238,0.3)' : colors.inputBg, color: isActive ? '#7aa7f5' : colors.textMuted, borderRadius: 20, padding: '1px 7px', fontSize: 11, fontWeight: 600 }}>
            {count}
          </span>
        )}
      </button>
    )
  }

  // Count per sentiment for badge numbers
  const sentimentCounts = {
    positive: Object.values(sentiments).filter(s => s === 'positive').length,
    neutral:  Object.values(sentiments).filter(s => s === 'neutral').length,
    negative: Object.values(sentiments).filter(s => s === 'negative').length,
  }

  return (
    <UserLayout title="Summaries" subtitle="AI-generated summaries from your meetings" onSearch={setSearch}>

      {selected && <SummaryModal meeting={selected} onClose={() => setSelected(null)}/>}

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total Summaries', value: meetings.length,                                           icon: FileText,    color: '#7aa7f5', bg: 'rgba(91,141,238,0.1)' },
          { label: 'Positive',        value: sentimentCounts.positive,                                  icon: CheckSquare, color: '#34d399', bg: 'rgba(16,185,129,0.1)' },
          { label: 'Neutral / Neg',   value: `${sentimentCounts.neutral} / ${sentimentCounts.negative}`, icon: BarChart2,   color: '#a78bfa', bg: 'rgba(167,139,250,0.1)' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} style={{ ...card, padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon size={20} color={color}/>
            </div>
            <div>
              <p style={{ color, fontSize: 24, fontWeight: 700, margin: 0 }}>{value}</p>
              <p style={{ color: colors.textSecondary, fontSize: 13, margin: 0 }}>{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 340 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={colors.textMuted} strokeWidth="2"
            style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}>
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search summaries..."
            style={{ width: '100%', background: colors.inputBg, border: `1px solid ${colors.borderInput}`, borderRadius: 10, padding: '9px 14px 9px 34px', color: colors.textPrimary, fontSize: 13, outline: 'none', fontFamily: 'Inter, sans-serif' }}/>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {filterBtn('all',      'All',      meetings.length)}
          {filterBtn('positive', '😊 Positive', sentimentCounts.positive)}
          {filterBtn('neutral',  '😐 Neutral',  sentimentCounts.neutral)}
          {filterBtn('negative', '😟 Negative', sentimentCounts.negative)}
        </div>
      </div>

      {/* Cards */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <div style={{ width: 36, height: 36, border: `3px solid ${colors.border}`, borderTopColor: '#5b8dee', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}/>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ ...card, padding: '64px 24px', textAlign: 'center' }}>
          <BarChart2 size={44} color={colors.textMuted} style={{ marginBottom: 14 }}/>
          <p style={{ color: colors.textSecondary, fontSize: 16, fontWeight: 600, margin: 0 }}>
            {filter !== 'all' ? `No ${filter} sentiment meetings found` : 'No summaries yet'}
          </p>
          <p style={{ color: colors.textMuted, fontSize: 13, margin: '6px 0 0' }}>
            {filter !== 'all' ? 'Try selecting a different filter' : 'Upload and process a meeting to see AI summaries here'}
          </p>
          {filter !== 'all' && (
            <button onClick={() => setFilter('all')} style={{ marginTop: 16, padding: '8px 20px', background: 'rgba(91,141,238,0.15)', border: 'none', borderRadius: 8, color: '#7aa7f5', fontSize: 13, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
              Show all summaries
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 18 }}>
          {filtered.map(m => (
            <SummaryCard key={m.id} meeting={m} onOpen={() => setSelected(m)} colors={colors} isDark={isDark}/>
          ))}
        </div>
      )}
    </UserLayout>
  )
}