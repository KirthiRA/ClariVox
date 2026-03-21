import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AdminLayout from './AdminLayout'
import { Badge } from '../../components/admin/AdminComponents'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import { Eye, Trash2, FileText, Search, Download } from 'lucide-react'

const MOCK = [
  { id:1, title:'Project Kickoff',  created_at:'2024-04-20', duration_seconds:2730, status:'done',       user_id:'usr_001' },
  { id:2, title:'Team Discussion',  created_at:'2024-04-18', duration_seconds:1935, status:'done',       user_id:'usr_002' },
  { id:3, title:'Client Meeting',   created_at:'2024-04-15', duration_seconds:3400, status:'processing', user_id:'usr_001' },
  { id:4, title:'Weekly Sync',      created_at:'2024-04-12', duration_seconds:1685, status:'done',       user_id:'usr_003' },
  { id:5, title:'Sprint Planning',  created_at:'2024-04-10', duration_seconds:2100, status:'failed',     user_id:'usr_002' },
]
const fmt = (s) => s ? `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}` : '—'
const statusLabel = (s) => ({ done:'Completed', processing:'Processing', failed:'Failed', pending:'Pending' }[s] || s)

export default function AdminMeetings() {
  const [meetings, setMeetings] = useState(MOCK)
  const [search, setSearch]     = useState('')
  const [filter, setFilter]     = useState('all')
  const [loading, setLoading]   = useState(false)

  const load = () => {
    api.get('/admin/meetings')
      .then(r => { if (r.data?.length) setMeetings(r.data) })
      .catch(() => {}).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const deleteMeeting = async (id) => {
    if (!confirm('Delete this meeting? This cannot be undone.')) return
    try {
      await api.delete(`/admin/meetings/${id}`)
      setMeetings(prev => prev.filter(m => m.id !== id))
      toast.success('Meeting deleted')
    } catch { toast.error('Failed to delete') }
  }

  const filtered = meetings.filter(m => {
    const ms = m.title.toLowerCase().includes(search.toLowerCase())
    const mf = filter === 'all' || m.status === filter
    return ms && mf
  })
  const card = { background:'#0f1117', borderRadius:16, border:'1px solid #1e2030' }

  const filterBtn = (val, label) => (
    <button key={val} onClick={() => setFilter(val)} style={{
      padding:'7px 16px', borderRadius:8, fontSize:13, fontWeight: filter===val ? 600 : 400,
      background: filter===val ? 'rgba(99,102,241,0.2)' : 'transparent',
      color: filter===val ? '#818cf8' : '#6b7280',
      border: filter===val ? '1px solid rgba(99,102,241,0.4)' : '1px solid transparent',
      cursor:'pointer', fontFamily:'Inter, sans-serif', transition:'all 0.15s'
    }}>{label}</button>
  )

  return (
    <AdminLayout>
      <div style={{ marginBottom:28 }}>
        <h1 style={{ color:'#fff', fontWeight:700, fontSize:22, margin:0 }}>All Meetings</h1>
        <p style={{ color:'#6b7280', fontSize:13, margin:'4px 0 0' }}>View and manage every meeting on the platform</p>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:24 }}>
        {[
          { label:'Total',      value:meetings.length,                                color:'#6366f1' },
          { label:'Completed',  value:meetings.filter(m=>m.status==='done').length,       color:'#10b981' },
          { label:'Processing', value:meetings.filter(m=>m.status==='processing').length, color:'#f59e0b' },
          { label:'Failed',     value:meetings.filter(m=>m.status==='failed').length,     color:'#ef4444' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ ...card, padding:'16px 20px', display:'flex', alignItems:'center', gap:14 }}>
            <div style={{ width:40, height:40, borderRadius:10, background:color+'22', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <FileText size={18} color={color} />
            </div>
            <div>
              <p style={{ color:'#fff', fontSize:24, fontWeight:700, margin:0 }}>{value}</p>
              <p style={{ color:'#6b7280', fontSize:12, margin:0 }}>{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:18, flexWrap:'wrap' }}>
        <div style={{ position:'relative', flex:'1', maxWidth:300 }}>
          <Search size={15} color="#4b5563" style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search meetings..."
            style={{ width:'100%', background:'#13151f', border:'1px solid #1e2030', borderRadius:10, padding:'9px 14px 9px 36px', color:'#e2e8f0', fontSize:13, outline:'none', fontFamily:'Inter, sans-serif' }} />
        </div>
        <div style={{ display:'flex', gap:6 }}>
          {filterBtn('all','All')}
          {filterBtn('done','Completed')}
          {filterBtn('processing','Processing')}
          {filterBtn('failed','Failed')}
        </div>
      </div>

      <div style={{ ...card, overflow:'hidden' }}>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead>
            <tr style={{ borderBottom:'1px solid #1e2030' }}>
              {['Title','Date','Duration','Status','User','Actions'].map(h => (
                <th key={h} style={{ padding:'12px 24px', textAlign:'left', color:'#4b5563', fontSize:12, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.06em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(m => (
              <tr key={m.id} className="row-hover" style={{ borderBottom:'1px solid #13151f', transition:'background 0.15s' }}>
                <td style={{ padding:'15px 24px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <div style={{ width:34, height:34, borderRadius:8, background:'rgba(99,102,241,0.12)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <FileText size={15} color="#818cf8" />
                    </div>
                    <span style={{ color:'#e2e8f0', fontWeight:600, fontSize:14 }}>{m.title}</span>
                  </div>
                </td>
                <td style={{ padding:'15px 24px', color:'#6b7280', fontSize:13 }}>
                  {new Date(m.created_at).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' })}
                </td>
                <td style={{ padding:'15px 24px', color:'#6b7280', fontSize:13 }}>{fmt(m.duration_seconds)}</td>
                <td style={{ padding:'15px 24px' }}><Badge status={statusLabel(m.status)} /></td>
                <td style={{ padding:'15px 24px' }}>
                  <span style={{ background:'#1e2030', color:'#6b7280', borderRadius:6, padding:'3px 10px', fontSize:11, fontFamily:'monospace' }}>{m.user_id}</span>
                </td>
                <td style={{ padding:'15px 24px' }}>
                  <div style={{ display:'flex', gap:8 }}>
                    <Link to="/meetings">
                      <button className="icon-btn" style={{ width:34, height:34, borderRadius:8, background:'rgba(99,102,241,0.12)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', transition:'background 0.15s' }}>
                        <Eye size={15} color="#818cf8" />
                      </button>
                    </Link>
                    <button className="icon-btn" style={{ width:34, height:34, borderRadius:8, background:'rgba(99,102,241,0.12)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', transition:'background 0.15s' }}>
                      <Download size={15} color="#818cf8" />
                    </button>
                    <button onClick={() => deleteMeeting(m.id)} className="icon-btn" style={{ width:34, height:34, borderRadius:8, background:'rgba(239,68,68,0.12)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', transition:'background 0.15s' }}>
                      <Trash2 size={15} color="#f87171" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div style={{ padding:48, textAlign:'center' }}>
            <FileText size={36} color="#2d3148" style={{ marginBottom:10 }} />
            <p style={{ color:'#4b5563', fontSize:14, margin:0 }}>No meetings found</p>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
