import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Upload, FileText, Mail, BarChart2, Settings, ChevronDown, Crown, CheckCircle } from 'lucide-react'

function ClarivoxLogo({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="8" fill="url(#cvgrad2)"/>
      <defs>
        <linearGradient id="cvgrad2" x1="0" y1="0" x2="32" y2="32">
          <stop offset="0%" stopColor="#5b8dee"/>
          <stop offset="100%" stopColor="#a78bfa"/>
        </linearGradient>
      </defs>
      <rect x="5"  y="13" width="3" height="6"  rx="1.5" fill="white" opacity="0.7"/>
      <rect x="10" y="9"  width="3" height="14" rx="1.5" fill="white"/>
      <rect x="15" y="6"  width="3" height="20" rx="1.5" fill="white"/>
      <rect x="20" y="9"  width="3" height="14" rx="1.5" fill="white"/>
      <rect x="25" y="13" width="3" height="6"  rx="1.5" fill="white" opacity="0.7"/>
    </svg>
  )
}

export default function AdminSidebar() {
  const location = useLocation()
  const [meetOpen, setMeetOpen] = useState(false)
  const [analOpen, setAnalOpen] = useState(false)
  const isActive = (p) => location.pathname === p

  const ls = (active) => ({
    display:'flex', alignItems:'center', gap:12, padding:'10px 14px', borderRadius:8, marginBottom:2,
    background: active ? 'rgba(91,141,238,0.15)' : 'transparent',
    color:      active ? '#7aa7f5' : '#8b92a5',
    textDecoration:'none', fontSize:14, fontWeight: active ? 600 : 400,
    borderLeft: active ? '3px solid #5b8dee' : '3px solid transparent',
    cursor:'pointer', width:'100%', textAlign:'left',
    fontFamily:'Inter, sans-serif', outline:'none', boxSizing:'border-box', border:'none', transition:'all 0.15s'
  })

  return (
    <aside style={{ width:258, background:'#0c0e1a', borderRight:'1px solid rgba(91,141,238,0.12)', display:'flex', flexDirection:'column', height:'100vh', position:'fixed', top:0, left:0, zIndex:50 }}>
      <div style={{ padding:'20px 18px', borderBottom:'1px solid rgba(91,141,238,0.12)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <ClarivoxLogo size={36}/>
          <div>
            <div style={{ fontWeight:800, fontSize:17, color:'#fff', letterSpacing:'-0.3px' }}>
              Clari<span style={{ color:'#7aa7f5' }}>vox</span>
            </div>
            <div style={{ color:'#3d4a6b', fontSize:10, marginTop:1 }}>Admin Panel</div>
          </div>
        </div>
      </div>

      <nav style={{ flex:1, padding:'14px 10px', overflowY:'auto' }}>
        <Link to="/admin"  style={ls(isActive('/admin'))}><LayoutDashboard size={17}/> Dashboard</Link>
        <Link to="/upload" style={ls(isActive('/upload'))}><Upload size={17}/> Upload Meeting</Link>

        <button onClick={()=>setMeetOpen(p=>!p)} style={{ ...ls(false), justifyContent:'space-between', background:'transparent', border:'none' }}>
          <span style={{ display:'flex', alignItems:'center', gap:12 }}><FileText size={17}/> Meetings</span>
          <ChevronDown size={13} style={{ transform:meetOpen?'rotate(180deg)':'none', transition:'transform 0.2s' }}/>
        </button>
        {meetOpen && <div style={{ paddingLeft:16 }}>
          <Link to="/admin/meetings" style={ls(isActive('/admin/meetings'))}>All Meetings</Link>
          <Link to="/dashboard" style={ls(false)}>Archived</Link>
        </div>}

        <Link to="/dashboard" style={ls(false)}><FileText size={17}/> Summaries</Link>
        <Link to="/dashboard" style={ls(false)}><Mail size={17}/> Subscriptions</Link>

        <button onClick={()=>setAnalOpen(p=>!p)} style={{ ...ls(false), justifyContent:'space-between', background:'transparent', border:'none' }}>
          <span style={{ display:'flex', alignItems:'center', gap:12 }}><BarChart2 size={17}/> Analytics</span>
          <ChevronDown size={13} style={{ transform:analOpen?'rotate(180deg)':'none', transition:'transform 0.2s' }}/>
        </button>
        {analOpen && <div style={{ paddingLeft:16 }}>
          <Link to="/dashboard" style={ls(false)}>Usage Stats</Link>
          <Link to="/dashboard" style={ls(false)}>Reports</Link>
        </div>}

        <Link to="/dashboard" style={ls(false)}><Settings size={17}/> Settings</Link>
      </nav>

      <div style={{ padding:'0 14px 16px' }}>
        <div style={{ background:'linear-gradient(135deg,#0f1a3a,#1a1060)', borderRadius:14, padding:16, border:'1px solid rgba(91,141,238,0.25)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
            <Crown size={15} color="#fbbf24"/>
            <span style={{ fontWeight:700, color:'#fff', fontSize:13 }}>Upgrade to Pro</span>
          </div>
          {['Unlimited Meetings','AI Summaries','Export & Analytics'].map(f=>(
            <div key={f} style={{ display:'flex', alignItems:'center', gap:7, marginBottom:6 }}>
              <CheckCircle size={12} color="#5b8dee"/>
              <span style={{ color:'#93b4f5', fontSize:12 }}>{f}</span>
            </div>
          ))}
          <button style={{ width:'100%', marginTop:12, padding:'9px 0', background:'linear-gradient(90deg,#5b8dee,#a78bfa)', border:'none', borderRadius:8, color:'#fff', fontWeight:600, fontSize:13, cursor:'pointer', fontFamily:'Inter, sans-serif' }}>
            Upgrade Now
          </button>
        </div>
        <p style={{ color:'#1e2a4a', fontSize:11, textAlign:'center', marginTop:10 }}>© 2024 Clarivox</p>
      </div>
    </aside>
  )
}
