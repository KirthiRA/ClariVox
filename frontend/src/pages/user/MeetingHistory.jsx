import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import UserLayout from '../../components/user/UserLayout'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import { Eye, Download, ChevronLeft, ChevronRight, X, FileText, Tag, CheckSquare, Mic, Trash2 } from 'lucide-react'

const fmt = (s) => {
  if (!s || s === 0) return '—'
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`
}

const statusLabel = (s) => ({
  done: 'Processed', processing: 'Processing', failed: 'Failed', pending: 'Pending'
}[s] || s)

function Badge({ status }) {
  const m = {
    Processed:  { bg: 'rgba(16,185,129,0.18)',  color: '#34d399', dot: '#10b981' },
    Processing: { bg: 'rgba(245,158,11,0.18)',  color: '#fbbf24', dot: '#f59e0b' },
    Failed:     { bg: 'rgba(239,68,68,0.18)',   color: '#f87171', dot: '#ef4444' },
    Pending:    { bg: 'rgba(91,141,238,0.18)',  color: '#7aa7f5', dot: '#5b8dee' },
  }
  const s = m[status] || m.Pending
  return (
    <span style={{ background: s.bg, color: s.color, borderRadius: 20, padding: '5px 14px', fontSize: 12, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: s.dot, animation: status === 'Processing' ? 'pulse 1.5s infinite' : 'none' }}/>
      {status}
    </span>
  )
}

// ── Meeting Detail Modal ──────────────────────────────────────────────────────
function MeetingModal({ meetingId, onClose }) {
  const { colors, isDark } = useTheme()
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab]         = useState('summary')

  useEffect(() => {
    api.get(`/meetings/${meetingId}`)
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))

    const t = setInterval(() => {
      api.get(`/meetings/${meetingId}`).then(r => {
        setData(r.data)
        if (r.data?.meeting?.status === 'done') clearInterval(t)
      }).catch(() => {})
    }, 4000)
    return () => clearInterval(t)
  }, [meetingId])

  const copyText = (text) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!')
  }

  const downloadTxt = () => {
    if (!data) return
    const lines = [
      `Title: ${data.meeting.title}`,
      `Date: ${new Date(data.meeting.created_at).toLocaleString()}`,
      `Duration: ${fmt(data.meeting.duration_seconds)}`,
      `Status: ${data.meeting.status}`,
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
    a.href = url; a.download = `${data.meeting.title}.txt`; a.click()
    URL.revokeObjectURL(url)
  }

  const sentimentColor = { positive: '#34d399', negative: '#f87171', neutral: '#7aa7f5' }
  const modalBg   = isDark ? '#0f1117' : '#ffffff'
  const innerBg   = isDark ? '#0a0c14' : '#f8faff'
  const textMain  = isDark ? '#e2e8f0' : '#0f172a'
  const textSub   = isDark ? '#9ca3af' : '#475569'
  const textMuted = isDark ? '#4a5a7a' : '#94a3b8'
  const border    = isDark ? 'rgba(91,141,238,0.1)' : 'rgba(91,141,238,0.2)'
  const tabActive = isDark ? '#0a0c14' : '#f0f4ff'

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      onClick={onClose}>
      <div style={{ background: modalBg, borderRadius: 20, border: `1px solid ${border}`, width: '100%', maxWidth: 780, maxHeight: '88vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'background 0.3s' }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ color: textMain, fontWeight: 700, fontSize: 18, margin: 0 }}>
              {data?.meeting?.title || 'Loading...'}
            </h2>
            <div style={{ display: 'flex', gap: 12, marginTop: 6 }}>
              {data?.meeting && (
                <>
                  <span style={{ color: textMuted, fontSize: 12 }}>
                    {new Date(data.meeting.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  {data.meeting.duration_seconds > 0 && (
                    <span style={{ color: textMuted, fontSize: 12 }}>⏱ {fmt(data.meeting.duration_seconds)}</span>
                  )}
                  {data.summary?.sentiment && (
                    <span style={{ color: sentimentColor[data.summary.sentiment] || '#7aa7f5', fontSize: 12, fontWeight: 600, textTransform: 'capitalize' }}>
                      ● {data.summary.sentiment}
                    </span>
                  )}
                </>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {data?.transcript && (
              <button onClick={downloadTxt} style={{ background: 'rgba(91,141,238,0.12)', border: `1px solid ${border}`, borderRadius: 8, padding: '7px 14px', color: '#7aa7f5', fontSize: 13, cursor: 'pointer', fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Download size={14}/> Download
              </button>
            )}
            <button onClick={onClose} style={{ background: 'rgba(239,68,68,0.1)', border: 'none', borderRadius: 8, width: 34, height: 34, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <X size={16} color="#f87171"/>
            </button>
          </div>
        </div>

        {/* Loading */}
        {loading ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 60 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 36, height: 36, border: `3px solid ${border}`, borderTopColor: '#5b8dee', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 14px' }}/>
              <p style={{ color: textMuted, fontSize: 14 }}>Loading meeting details...</p>
            </div>
          </div>

        ) : data?.meeting?.status !== 'done' ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 60, textAlign: 'center' }}>
            <div>
              <div style={{ width: 48, height: 48, border: `3px solid ${border}`, borderTopColor: '#5b8dee', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }}/>
              <p style={{ color: textMain, fontWeight: 600, fontSize: 16, margin: 0 }}>AI is processing your meeting...</p>
              <p style={{ color: textMuted, fontSize: 13, margin: '6px 0 0' }}>This usually takes 1–3 minutes. Updates automatically.</p>
            </div>
          </div>

        ) : (
          <>
            <div style={{ display: 'flex', gap: 4, padding: '14px 24px 0', borderBottom: `1px solid ${border}` }}>
              {['summary', 'transcript'].map(t => (
                <button key={t} onClick={() => setTab(t)} style={{
                  padding: '8px 20px', borderRadius: '8px 8px 0 0', border: 'none', cursor: 'pointer',
                  background: tab === t ? tabActive : 'transparent',
                  color: tab === t ? '#7aa7f5' : textMuted,
                  fontWeight: tab === t ? 600 : 400, fontSize: 14,
                  borderBottom: tab === t ? '2px solid #5b8dee' : '2px solid transparent',
                  fontFamily: 'Inter, sans-serif', textTransform: 'capitalize',
                  transition: 'all 0.2s'
                }}>{t}</button>
              ))}
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
              {tab === 'summary' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ background: innerBg, borderRadius: 12, border: `1px solid ${border}`, padding: 18 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                      <FileText size={16} color="#5b8dee"/>
                      <h3 style={{ color: textMain, fontWeight: 600, fontSize: 15, margin: 0 }}>Summary</h3>
                    </div>
                    <p style={{ color: textSub, fontSize: 14, lineHeight: 1.7, margin: 0 }}>
                      {data.summary?.short_summary || 'No summary available.'}
                    </p>
                  </div>

                  {data.summary?.action_items?.length > 0 && (
                    <div style={{ background: innerBg, borderRadius: 12, border: `1px solid ${border}`, padding: 18 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                        <CheckSquare size={16} color="#5b8dee"/>
                        <h3 style={{ color: textMain, fontWeight: 600, fontSize: 15, margin: 0 }}>Action Items</h3>
                      </div>
                      {data.summary.action_items.map((item, i) => (
                        <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 8, alignItems: 'flex-start' }}>
                          <span style={{ width: 22, height: 22, borderRadius: 6, background: 'rgba(91,141,238,0.15)', color: '#7aa7f5', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>{i + 1}</span>
                          <p style={{ color: textSub, fontSize: 13, margin: 0, lineHeight: 1.6 }}>{item}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {data.summary?.keywords?.length > 0 && (
                    <div style={{ background: innerBg, borderRadius: 12, border: `1px solid ${border}`, padding: 18 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                        <Tag size={16} color="#5b8dee"/>
                        <h3 style={{ color: textMain, fontWeight: 600, fontSize: 15, margin: 0 }}>Keywords</h3>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {data.summary.keywords.map((kw, i) => (
                          <span key={i} style={{ background: 'rgba(91,141,238,0.12)', border: `1px solid ${border}`, color: '#7aa7f5', borderRadius: 20, padding: '4px 12px', fontSize: 12, fontWeight: 500 }}>{kw}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {tab === 'transcript' && (
                <div style={{ background: innerBg, borderRadius: 12, border: `1px solid ${border}`, padding: 18 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Mic size={16} color="#5b8dee"/>
                      <h3 style={{ color: textMain, fontWeight: 600, fontSize: 15, margin: 0 }}>Full Transcript</h3>
                    </div>
                    <button onClick={() => copyText(data.transcript?.full_text || '')}
                      style={{ background: 'rgba(91,141,238,0.1)', border: `1px solid ${border}`, borderRadius: 7, padding: '5px 12px', color: '#7aa7f5', fontSize: 12, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                      Copy
                    </button>
                  </div>
                  <p style={{ color: textSub, fontSize: 13, lineHeight: 1.8, margin: 0, whiteSpace: 'pre-wrap' }}>
                    {data.transcript?.full_text || 'No transcript available.'}
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

// ── Delete Confirmation Modal ─────────────────────────────────────────────────
function DeleteModal({ meeting, onConfirm, onCancel }) {
  const { isDark } = useTheme()
  const modalBg  = isDark ? '#0f1117' : '#ffffff'
  const textMain = isDark ? '#e2e8f0' : '#0f172a'
  const textSub  = isDark ? '#6a7a9a' : '#475569'
  const border   = isDark ? 'rgba(91,141,238,0.12)' : 'rgba(91,141,238,0.2)'

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: modalBg, borderRadius: 16, border: `1px solid rgba(239,68,68,0.3)`, width: '100%', maxWidth: 420, padding: 28 }}>
        <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(239,68,68,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <Trash2 size={24} color="#f87171"/>
        </div>
        <h2 style={{ color: textMain, fontWeight: 700, fontSize: 18, margin: '0 0 8px', textAlign: 'center' }}>
          Delete Meeting
        </h2>
        <p style={{ color: textSub, fontSize: 14, textAlign: 'center', margin: '0 0 6px', lineHeight: 1.6 }}>
          Are you sure you want to delete
        </p>
        <p style={{ color: '#7aa7f5', fontWeight: 600, fontSize: 14, textAlign: 'center', margin: '0 0 20px' }}>
          "{meeting.title}"?
        </p>
        <p style={{ color: '#f87171', fontSize: 12, textAlign: 'center', margin: '0 0 24px', background: 'rgba(239,68,68,0.08)', borderRadius: 8, padding: '8px 12px' }}>
          This will permanently delete the meeting, transcript and AI summary. This cannot be undone.
        </p>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={onCancel} style={{ flex: 1, padding: '11px', background: 'transparent', border: `1px solid ${border}`, borderRadius: 10, color: textSub, fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
            Cancel
          </button>
          <button onClick={onConfirm} style={{ flex: 1, padding: '11px', background: 'linear-gradient(90deg,#ef4444,#dc2626)', border: 'none', borderRadius: 10, color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
const PAGE_SIZE = 5

export default function MeetingHistory() {
  const { user }                        = useAuth()
  const { colors }                      = useTheme()
  const [meetings, setMeetings]         = useState([])
  const [search, setSearch]             = useState('')
  const [page, setPage]                 = useState(1)
  const [selectedId, setSelectedId]     = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting]         = useState(false)

  useEffect(() => {
    const load = () => {
      if (!user?.id) return
      api.get('/meetings/', { params: { user_id: user.id } })
        .then(r => { if (r.data?.length) setMeetings(r.data) })
        .catch(() => {})
    }
    load()
    const t = setInterval(load, 5000)
    return () => clearInterval(t)
  }, [user])

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await api.delete(`/meetings/${deleteTarget.id}`)
      setMeetings(prev => prev.filter(m => m.id !== deleteTarget.id))
      toast.success(`"${deleteTarget.title}" deleted successfully`)
      setDeleteTarget(null)
      // Reset to page 1 if current page becomes empty
      const remaining = meetings.filter(m => m.id !== deleteTarget.id)
      const newTotalPages = Math.ceil(remaining.filter(m => m.title.toLowerCase().includes(search.toLowerCase())).length / PAGE_SIZE)
      if (page > newTotalPages) setPage(Math.max(1, newTotalPages))
    } catch {
      toast.error('Failed to delete. Please try again.')
    } finally {
      setDeleting(false)
    }
  }

  const filtered   = meetings.filter(m => m.title.toLowerCase().includes(search.toLowerCase()))
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const card = {
    background: colors.cardBg,
    borderRadius: 16,
    border: `1px solid ${colors.border}`,
    transition: 'background 0.3s, border-color 0.3s'
  }

  const downloadMeeting = async (meetingId, title) => {
    try {
      const r    = await api.get(`/meetings/${meetingId}`)
      const data = r.data
      const lines = [
        `Title: ${title}`,
        `Date: ${new Date(data.meeting.created_at).toLocaleString()}`,
        '',
        '─── SUMMARY ───',
        data.summary?.short_summary || 'Not available',
        '',
        '─── FULL TRANSCRIPT ───',
        data.transcript?.full_text || 'Not available',
      ].join('\n')
      const blob = new Blob([lines], { type: 'text/plain' })
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href = url; a.download = `${title}.txt`; a.click()
      URL.revokeObjectURL(url)
    } catch {
      toast.error('Could not download. Make sure meeting is processed.')
    }
  }

  return (
    <UserLayout title="Meeting History" subtitle="Review your meeting summaries & transcripts." onSearch={setSearch}>

      {selectedId && <MeetingModal meetingId={selectedId} onClose={() => setSelectedId(null)}/>}

      {deleteTarget && (
        <DeleteModal
          meeting={deleteTarget}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      <div style={{ ...card, overflow: 'hidden' }}>

        {/* Search */}
        <div style={{ padding: '18px 24px', borderBottom: `1px solid ${colors.border}` }}>
          <div style={{ position: 'relative', maxWidth: 380 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={colors.textMuted} strokeWidth="2"
              style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}>
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
              placeholder="Search meetings..."
              style={{ width: '100%', background: colors.inputBg, border: `1px solid ${colors.borderInput}`, borderRadius: 10, padding: '9px 14px 9px 34px', color: colors.textPrimary, fontSize: 13, outline: 'none', fontFamily: 'Inter, sans-serif', transition: 'all 0.3s' }}/>
          </div>
        </div>

        {/* Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${colors.border}` }}>
              {['Title', 'Date', 'Duration', 'Status', 'Actions'].map(h => (
                <th key={h} style={{ padding: '11px 24px', textAlign: 'left', color: colors.textMuted, fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.map(m => (
              <tr key={m.id} className="row-hover" style={{ borderBottom: `1px solid ${colors.border}`, transition: 'background 0.15s' }}>
                <td style={{ padding: '15px 24px', color: colors.textPrimary, fontWeight: 600, fontSize: 14 }}>{m.title}</td>
                <td style={{ padding: '15px 24px', color: colors.textSecondary, fontSize: 13 }}>
                  {m.created_at ? new Date(m.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                </td>
                <td style={{ padding: '15px 24px', color: colors.textSecondary, fontSize: 13 }}>
                  {m.duration_seconds > 0 ? fmt(m.duration_seconds) : '—'}
                </td>
                <td style={{ padding: '15px 24px' }}>
                  <Badge status={statusLabel(m.status)}/>
                </td>
                <td style={{ padding: '15px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button onClick={() => setSelectedId(m.id)}
                      style={{ background: 'none', border: 'none', color: '#5b8dee', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'Inter, sans-serif', padding: 0 }}>
                      View Summary
                    </button>
                    <button onClick={() => setSelectedId(m.id)} className="icon-btn"
                      style={{ width: 32, height: 32, borderRadius: 7, background: 'rgba(91,141,238,0.1)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Eye size={14} color="#7aa7f5"/>
                    </button>
                    <button onClick={() => downloadMeeting(m.id, m.title)} className="icon-btn"
                      style={{ width: 32, height: 32, borderRadius: 7, background: 'rgba(91,141,238,0.1)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Download size={14} color="#7aa7f5"/>
                    </button>
                    {/* ── DELETE BUTTON ── */}
                    <button
                      onClick={() => setDeleteTarget(m)}
                      className="icon-btn"
                      title="Delete meeting"
                      style={{ width: 32, height: 32, borderRadius: 7, background: 'rgba(239,68,68,0.1)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Trash2 size={14} color="#f87171"/>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Empty state */}
        {paginated.length === 0 && (
          <div style={{ padding: '48px 24px', textAlign: 'center' }}>
            <FileText size={36} color={colors.textMuted} style={{ marginBottom: 10 }}/>
            <p style={{ color: colors.textSecondary, fontSize: 14, margin: 0 }}>No meetings found</p>
            <p style={{ color: colors.textMuted, fontSize: 12, margin: '4px 0 0' }}>Upload a meeting or try a different search</p>
          </div>
        )}

        {/* Pagination */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 24px', borderTop: `1px solid ${colors.border}` }}>
          <span style={{ color: colors.textSecondary, fontSize: 13 }}>
            Showing {filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1} to {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} entries
          </span>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              style={{ width: 32, height: 32, borderRadius: 7, background: 'rgba(91,141,238,0.1)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: page === 1 ? 0.4 : 1 }}>
              <ChevronLeft size={14} color="#7aa7f5"/>
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button key={i + 1} onClick={() => setPage(i + 1)} style={{
                width: 32, height: 32, borderRadius: 7, border: 'none', cursor: 'pointer',
                background: page === i + 1 ? 'linear-gradient(90deg,#5b8dee,#a78bfa)' : 'rgba(91,141,238,0.1)',
                color: page === i + 1 ? '#fff' : '#7aa7f5',
                fontSize: 13, fontWeight: 600, fontFamily: 'Inter, sans-serif'
              }}>{i + 1}</button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages || totalPages === 0}
              style={{ width: 32, height: 32, borderRadius: 7, background: 'rgba(91,141,238,0.1)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: (page === totalPages || totalPages === 0) ? 0.4 : 1 }}>
              <ChevronRight size={14} color="#7aa7f5"/>
            </button>
          </div>
        </div>
      </div>
    </UserLayout>
  )
}