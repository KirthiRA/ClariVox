import AdminSidebar from '../../components/admin/AdminSidebar'
import { Bell, Search, ChevronDown } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function AdminLayout({ children, onSearch }) {
  const { user, profile } = useAuth()
  const displayName  = profile?.name || user?.email?.split('@')[0] || 'Admin'
  const initials     = displayName?.[0]?.toUpperCase() || 'A'

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'#08090f', fontFamily:'Inter, sans-serif' }}>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.35} }
        @keyframes spin  { to{transform:rotate(360deg)} }
        * { box-sizing:border-box; }
        a { text-decoration:none; }
        .row-hover:hover  { background:rgba(91,141,238,0.07) !important; cursor:pointer; }
        .icon-btn:hover   { background:rgba(255,255,255,0.12) !important; }
        .quick-btn:hover  { opacity:0.88; transform:translateY(-1px); }
        input::placeholder { color:#2d3a5a; }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-thumb { background:#1e2a4a; border-radius:4px; }
      `}</style>

      <AdminSidebar/>

      <div style={{ marginLeft:258, flex:1, display:'flex', flexDirection:'column' }}>
        <header style={{
          height:68, background:'rgba(8,9,15,0.97)',
          borderBottom:'1px solid rgba(91,141,238,0.12)',
          padding:'0 32px', display:'flex', alignItems:'center',
          justifyContent:'space-between', position:'sticky', top:0, zIndex:40,
          backdropFilter:'blur(12px)'
        }}>
          <div>
            <h1 style={{ color:'#fff', fontWeight:700, fontSize:21, margin:0 }}>Dashboard</h1>
            <p style={{ color:'#4a5a7a', fontSize:13, margin:0 }}>
              Welcome back, <strong style={{ color:'#93b4f5' }}>{displayName}</strong>!
            </p>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:20 }}>
            {onSearch && (
              <div style={{ position:'relative' }}>
                <Search size={14} color="#3d4a6b" style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)' }}/>
                <input onChange={e=>onSearch(e.target.value)} placeholder="Search meetings..."
                  style={{ background:'rgba(91,141,238,0.06)', border:'1px solid rgba(91,141,238,0.15)', borderRadius:10, padding:'8px 14px 8px 34px', color:'#e2e8f0', fontSize:13, outline:'none', width:230 }}/>
              </div>
            )}
            <div style={{ position:'relative', cursor:'pointer' }}>
              <Bell size={20} color="#4a5a7a"/>
              <span style={{ position:'absolute', top:-5, right:-5, width:16, height:16, background:'#ef4444', borderRadius:'50%', fontSize:10, color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700 }}>2</span>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:10, cursor:'pointer' }}>
              <div style={{ width:36, height:36, borderRadius:'50%', background:'linear-gradient(135deg,#5b8dee,#a78bfa)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:14, color:'#fff' }}>{initials}</div>
              <div>
                <p style={{ color:'#e2e8f0', fontSize:13, fontWeight:600, margin:0 }}>{displayName}</p>
                <p style={{ color:'#4a5a7a', fontSize:11, margin:0 }}>{user?.email}</p>
              </div>
              <ChevronDown size={13} color="#4a5a7a"/>
            </div>
          </div>
        </header>
        <main style={{ padding:'26px 32px', flex:1 }}>{children}</main>
      </div>
    </div>
  )
}
