import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../utils/api'
import AdminLayout from './AdminLayout'
import { StatCard, Badge } from '../../components/admin/AdminComponents'
import { FileText, Mic, CheckCircle, Cloud, Upload, Download, Eye } from 'lucide-react'

const MOCK_STATS = { total_meetings: 24, status_breakdown: { done: 18, processing: 1, failed: 2 } }
const MOCK_MEETINGS = [
  { id:1, title:'Project Kickoff',  created_at:'2024-04-20', duration_seconds:2730, status:'done' },
  { id:2, title:'Team Discussion',  created_at:'2024-04-18', duration_seconds:1935, status:'done' },
  { id:3, title:'Client Meeting',   created_at:'2024-04-15', duration_seconds:3400, status:'processing' },
  { id:4, title:'Weekly Sync',      created_at:'2024-04-12', duration_seconds:1685, status:'done' },
]
const fmt = (s) => s ? `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}` : '—'
const statusLabel = (s) => ({ done:'Completed', processing:'Processing', failed:'Failed', pending:'Pending' }[s] || s)
const card = { background:'#0f1117', borderRadius:16, border:'1px solid #1e2030', padding:24 }

export default function AdminDashboard() {
  const [stats, setStats]       = useState(MOCK_STATS)
  const [meetings, setMeetings] = useState(MOCK_MEETINGS)
  const [loading, setLoading]   = useState(false)
  const [search, setSearch]     = useState('')

  const fetchData = () => {
    Promise.all([
      api.get('/admin/dashboard').catch(() => ({ data: MOCK_STATS })),
      api.get('/admin/meetings').catch(() => ({ data: MOCK_MEETINGS })),
    ]).then(([s, m]) => {
      setStats(s.data)
      if (m.data?.length) setMeetings(m.data)
    }).finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchData()
    const t = setInterval(fetchData, 5000)
    return () => clearInterval(t)
  }, [])

  const filtered = meetings.filter(m => m.title.toLowerCase().includes(search.toLowerCase()))

  return (
    <AdminLayout onSearch={setSearch}>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:28 }}>
        <StatCard label="Total Meetings" value={stats.total_meetings} sub="+12 this month" icon={FileText} gradient="linear-gradient(135deg,#1a3a5c,#1e40af)" />
        <StatCard label="Transcripts" value={stats.status_breakdown.done} sub="Generated" icon={Mic} gradient="linear-gradient(135deg,#1a1a3e,#3730a3)" />
        <StatCard label="Summaries" value={stats.total_meetings} sub="Ready" icon={CheckCircle} gradient="linear-gradient(135deg,#1a2e1a,#166534)" />
        <StatCard label="Storage Used" value="2.4 GB" sub="of 10 GB" icon={Cloud} gradient="linear-gradient(135deg,#1e1b4b,#4c1d95)" />
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 300px', gap:24 }}>
        <div style={{ display:'flex', flexDirection:'column', gap:24 }}>
          <div style={card}>
            <h2 style={{ color:'#fff', fontWeight:600, fontSize:16, margin:'0 0 18px' }}>Upload New Meeting</h2>
            <div style={{ border:'2px dashed #2d3148', borderRadius:12, padding:'36px 20px', textAlign:'center' }}>
              <div style={{ width:56, height:56, borderRadius:'50%', background:'#13151f', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px' }}>
                <Upload size={26} color="#6366f1" />
              </div>
              <p style={{ color:'#e2e8f0', fontWeight:600, fontSize:15, margin:'0 0 6px' }}>Drag & drop audio/video file here</p>
              <p style={{ color:'#4b5563', fontSize:13, margin:'0 0 18px' }}>or</p>
              <Link to="/upload">
                <button style={{ background:'linear-gradient(90deg,#6366f1,#8b5cf6)', border:'none', borderRadius:10, padding:'10px 28px', color:'#fff', fontWeight:600, fontSize:14, cursor:'pointer', display:'inline-flex', alignItems:'center', gap:8, fontFamily:'Inter, sans-serif' }}>
                  <FileText size={14} /> Choose File
                </button>
              </Link>
              <p style={{ color:'#374151', fontSize:12, marginTop:14 }}>Supported: MP3, WAV, MP4, M4A (Max 500MB)</p>
            </div>
          </div>

          <div style={{ ...card, padding:0, overflow:'hidden' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'18px 24px', borderBottom:'1px solid #1e2030' }}>
              <h2 style={{ color:'#fff', fontWeight:600, fontSize:16, margin:0 }}>Recent Meetings</h2>
              <Link to="/admin/meetings" style={{ color:'#6366f1', fontSize:13, fontWeight:500 }}>View All</Link>
            </div>
            {loading ? (
              <div style={{ padding:48, textAlign:'center' }}>
                <div style={{ width:30, height:30, border:'3px solid #1e2030', borderTopColor:'#6366f1', borderRadius:'50%', animation:'spin 0.8s linear infinite', margin:'0 auto' }} />
              </div>
            ) : (
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead>
                  <tr style={{ borderBottom:'1px solid #1e2030' }}>
                    {['Title','Date','Duration','Status','Action'].map(h => (
                      <th key={h} style={{ padding:'11px 24px', textAlign:'left', color:'#4b5563', fontSize:12, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.06em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.slice(0,5).map(m => (
                    <tr key={m.id} className="row-hover" style={{ borderBottom:'1px solid #13151f', transition:'background 0.15s' }}>
                      <td style={{ padding:'15px 24px', color:'#e2e8f0', fontWeight:600, fontSize:14 }}>{m.title}</td>
                      <td style={{ padding:'15px 24px', color:'#6b7280', fontSize:13 }}>
                        {new Date(m.created_at).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' })}
                      </td>
                      <td style={{ padding:'15px 24px', color:'#6b7280', fontSize:13 }}>{fmt(m.duration_seconds)}</td>
                      <td style={{ padding:'15px 24px' }}><Badge status={statusLabel(m.status)} /></td>
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
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
          <div style={card}>
            <h3 style={{ color:'#fff', fontWeight:600, fontSize:15, margin:'0 0 16px' }}>Quick Actions</h3>
            {[
              { label:'Upload Meeting',  icon:Upload,    g:'linear-gradient(90deg,#2563eb,#6366f1)', to:'/upload' },
              { label:'Start Recording', icon:Mic,       g:'linear-gradient(90deg,#7c3aed,#db2777)', to:'/upload' },
              { label:'View Summaries',  icon:FileText,  g:'linear-gradient(90deg,#059669,#0d9488)', to:'/dashboard' },
              { label:'Export Report',   icon:Download,  g:'linear-gradient(90deg,#d97706,#dc2626)', to:'/admin/meetings' },
            ].map(({ label, icon: Icon, g, to }) => (
              <Link key={label} to={to}>
                <button className="quick-btn" style={{ width:'100%', display:'flex', alignItems:'center', gap:12, background:g, border:'none', borderRadius:10, padding:'12px 16px', marginBottom:10, color:'#fff', fontWeight:600, fontSize:14, cursor:'pointer', fontFamily:'Inter, sans-serif', transition:'opacity 0.15s, transform 0.15s' }}>
                  <Icon size={17} /> {label}
                </button>
              </Link>
            ))}
          </div>

          <div style={card}>
            <h3 style={{ color:'#fff', fontWeight:600, fontSize:15, margin:'0 0 14px' }}>AI Summary Preview</h3>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:12 }}>
              <span style={{ color:'#e2e8f0', fontWeight:700, fontSize:15 }}>Project Kickoff</span>
              <span style={{ color:'#6b7280', fontSize:12 }}>Apr 20, 2024</span>
            </div>
            {[
              { bold:'Goals:', text:'Define project scope' },
              { bold:null, text:'Tasks assigned to 5 members' },
              { bold:'Deadline:', text:'May 25, 2024' },
            ].map((item, i) => (
              <div key={i} style={{ display:'flex', gap:8, marginBottom:8 }}>
                <span style={{ color:'#6366f1', fontSize:16 }}>•</span>
                <p style={{ color:'#9ca3af', fontSize:13, margin:0, lineHeight:1.5 }}>
                  {item.bold && <strong style={{ color:'#e2e8f0' }}>{item.bold} </strong>}{item.text}
                </p>
              </div>
            ))}
            <div style={{ marginTop:12, textAlign:'right' }}>
              <button style={{ background:'none', border:'none', color:'#6366f1', fontSize:13, cursor:'pointer', fontWeight:500, fontFamily:'Inter, sans-serif' }}>View Full →</button>
            </div>
          </div>

          <div style={card}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
              <h3 style={{ color:'#fff', fontWeight:600, fontSize:15, margin:0 }}>Subscription</h3>
              <span style={{ background:'rgba(99,102,241,0.2)', color:'#818cf8', borderRadius:6, padding:'4px 12px', fontSize:12, fontWeight:600 }}>Pro Plan</span>
            </div>
            <p style={{ color:'#9ca3af', fontSize:13, margin:'0 0 10px' }}>Valid till <strong style={{ color:'#fff' }}>25 May 2024</strong></p>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
              <p style={{ color:'#9ca3af', fontSize:13, margin:0 }}>Meetings: <strong style={{ color:'#fff' }}>8 /Unlimited</strong></p>
              <button style={{ background:'none', border:'1px solid #2d3148', borderRadius:6, padding:'5px 12px', color:'#818cf8', fontSize:12, cursor:'pointer', fontFamily:'Inter, sans-serif' }}>Manage</button>
            </div>
            <div style={{ height:5, background:'#1e2030', borderRadius:4 }}>
              <div style={{ height:'100%', width:'30%', background:'linear-gradient(90deg,#6366f1,#8b5cf6)', borderRadius:4 }} />
            </div>
          </div>

          <div style={{ ...card, padding:'14px 18px', display:'flex', alignItems:'center', gap:10 }}>
            <span style={{ width:10, height:10, borderRadius:'50%', background:'#10b981', flexShrink:0, animation:'pulse 1.5s infinite' }} />
            <span style={{ color:'#6b7280', fontSize:13 }}>Live sync — updates every <strong style={{ color:'#34d399' }}>5s</strong></span>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
