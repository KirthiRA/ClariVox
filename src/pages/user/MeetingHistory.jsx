import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import UserLayout from '../../components/user/UserLayout'
import api from '../../utils/api'
import { Eye, Download, ChevronLeft, ChevronRight } from 'lucide-react'

const MOCK = [
  { id:1, title:'Project Kickoff',    created_at:'2024-04-20', duration_seconds:2730, status:'done' },
  { id:2, title:'Weekly Sync',        created_at:'2024-04-18', duration_seconds:1685, status:'done' },
  { id:3, title:'Client Meeting',     created_at:'2024-04-15', duration_seconds:3400, status:'done' },
  { id:4, title:'Team Discussion',    created_at:'2024-04-12', duration_seconds:1935, status:'processing' },
  { id:5, title:'Marketing Strategy', created_at:'2024-04-10', duration_seconds:2580, status:'done' },
  { id:6, title:'Sprint Planning',    created_at:'2024-04-08', duration_seconds:2100, status:'done' },
  { id:7, title:'Board Review',       created_at:'2024-04-05', duration_seconds:3200, status:'done' },
]
const fmt = (s) => s ? `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}` : '—'
const statusLabel = (s) => ({ done:'Processed', processing:'Processing', failed:'Failed' }[s] || s)

function Badge({ status }) {
  const m = {
    Processed:   { bg:'rgba(16,185,129,0.18)',  color:'#34d399', dot:'#10b981' },
    Processing:  { bg:'rgba(245,158,11,0.18)',  color:'#fbbf24', dot:'#f59e0b' },
    Failed:      { bg:'rgba(239,68,68,0.18)',   color:'#f87171', dot:'#ef4444' },
  }
  const s = m[status] || m.Processed
  return (
    <span style={{ background:s.bg, color:s.color, borderRadius:20, padding:'5px 14px', fontSize:12, fontWeight:600, display:'inline-flex', alignItems:'center', gap:6 }}>
      <span style={{ width:7, height:7, borderRadius:'50%', background:s.dot, animation:status==='Processing'?'pulse 1.5s infinite':'none' }} />
      {status}
    </span>
  )
}

const PAGE_SIZE = 5

export default function MeetingHistory() {
  const { user } = useAuth()
  const [meetings, setMeetings] = useState(MOCK)
  const [search, setSearch]     = useState('')
  const [page, setPage]         = useState(1)

  useEffect(() => {
    api.get('/meetings/', { params: { user_id: user?.id } })
      .then(r => { if (r.data?.length) setMeetings(r.data) })
      .catch(() => {})
  }, [user])

  const filtered    = meetings.filter(m => m.title.toLowerCase().includes(search.toLowerCase()))
  const totalPages  = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated   = filtered.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE)
  const card = { background:'#0f1117', borderRadius:16, border:'1px solid rgba(99,102,241,0.12)' }

  return (
    <UserLayout title="Meeting History" subtitle="Review your meeting summaries & transcripts." onSearch={setSearch}>
      <div style={{ ...card, overflow:'hidden' }}>
        <div style={{ padding:'20px 24px', borderBottom:'1px solid rgba(99,102,241,0.1)' }}>
          <div style={{ position:'relative', maxWidth:400 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#4b5563" strokeWidth="2" style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)' }}>
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
              placeholder="Search meetings..."
              style={{ width:'100%', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(99,102,241,0.2)', borderRadius:10, padding:'9px 14px 9px 36px', color:'#e2e8f0', fontSize:13, outline:'none', fontFamily:'Inter, sans-serif' }} />
          </div>
        </div>

        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead>
            <tr style={{ borderBottom:'1px solid rgba(99,102,241,0.1)' }}>
              {['Title','Date','Duration','Status','Summary'].map(h => (
                <th key={h} style={{ padding:'12px 24px', textAlign:'left', color:'#4b5563', fontSize:12, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.06em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.map(m => (
              <tr key={m.id} className="row-hover" style={{ borderBottom:'1px solid rgba(255,255,255,0.03)' }}>
                <td style={{ padding:'16px 24px', color:'#e2e8f0', fontWeight:600, fontSize:14 }}>{m.title}</td>
                <td style={{ padding:'16px 24px', color:'#6b7280', fontSize:13 }}>
                  {new Date(m.created_at).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' })}
                </td>
                <td style={{ padding:'16px 24px', color:'#6b7280', fontSize:13 }}>{fmt(m.duration_seconds)}</td>
                <td style={{ padding:'16px 24px' }}><Badge status={statusLabel(m.status)} /></td>
                <td style={{ padding:'16px 24px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <Link to="/meetings" style={{ color:'#818cf8', fontSize:13, fontWeight:500 }}>View Summary</Link>
                    <button className="icon-btn" style={{ width:32, height:32, borderRadius:7, background:'rgba(99,102,241,0.12)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <Eye size={14} color="#818cf8" />
                    </button>
                    <button className="icon-btn" style={{ width:32, height:32, borderRadius:7, background:'rgba(99,102,241,0.12)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <Download size={14} color="#818cf8" />
                    </button>
                    <button className="icon-btn" style={{ width:32, height:32, borderRadius:7, background:'rgba(99,102,241,0.12)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 24px', borderTop:'1px solid rgba(99,102,241,0.1)' }}>
          <span style={{ color:'#6b7280', fontSize:13 }}>
            Showing {(page-1)*PAGE_SIZE+1} to {Math.min(page*PAGE_SIZE, filtered.length)} of {filtered.length} entries
          </span>
          <div style={{ display:'flex', gap:6, alignItems:'center' }}>
            <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1}
              style={{ width:32, height:32, borderRadius:7, background:'rgba(99,102,241,0.12)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', opacity:page===1?0.4:1 }}>
              <ChevronLeft size={15} color="#818cf8" />
            </button>
            {Array.from({ length: totalPages }, (_,i) => (
              <button key={i+1} onClick={() => setPage(i+1)} style={{
                width:32, height:32, borderRadius:7, border:'none', cursor:'pointer',
                background: page===i+1 ? 'linear-gradient(90deg,#6366f1,#8b5cf6)' : 'rgba(99,102,241,0.12)',
                color: page===i+1 ? '#fff' : '#818cf8', fontSize:13, fontWeight:600, fontFamily:'Inter, sans-serif'
              }}>{i+1}</button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages,p+1))} disabled={page===totalPages}
              style={{ width:32, height:32, borderRadius:7, background:'rgba(99,102,241,0.12)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', opacity:page===totalPages?0.4:1 }}>
              <ChevronRight size={15} color="#818cf8" />
            </button>
          </div>
        </div>
      </div>
    </UserLayout>
  )
}
