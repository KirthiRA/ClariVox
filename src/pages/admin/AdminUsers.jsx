import { useEffect, useState } from 'react'
import AdminLayout from './AdminLayout'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import { ShieldCheck, ShieldOff, Search, Users } from 'lucide-react'

const MOCK_USERS = [
  { id:'1', name:'John Doe',   email:'john@example.com',  role:'admin', is_active:true,  created_at:'2024-01-10' },
  { id:'2', name:'Sarah Kim',  email:'sarah@example.com', role:'user',  is_active:true,  created_at:'2024-02-14' },
  { id:'3', name:'Raj Patel',  email:'raj@example.com',   role:'user',  is_active:true,  created_at:'2024-03-01' },
  { id:'4', name:'Emily Chen', email:'emily@example.com', role:'user',  is_active:false, created_at:'2024-03-22' },
]

export default function AdminUsers() {
  const [users, setUsers]     = useState(MOCK_USERS)
  const [search, setSearch]   = useState('')
  const [loading, setLoading] = useState(false)

  const load = () => {
    api.get('/admin/users')
      .then(r => { if (r.data?.length) setUsers(r.data) })
      .catch(() => {}).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const toggleRole = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin'
    try {
      await api.put(`/admin/users/${userId}/role`, null, { params: { role: newRole } })
      toast.success(`Role changed to ${newRole}`)
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u))
    } catch { toast.error('Failed to update role') }
  }

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  )
  const card = { background:'#0f1117', borderRadius:16, border:'1px solid #1e2030' }

  return (
    <AdminLayout>
      <div style={{ marginBottom:28 }}>
        <h1 style={{ color:'#fff', fontWeight:700, fontSize:22, margin:0 }}>Users</h1>
        <p style={{ color:'#6b7280', fontSize:13, margin:'4px 0 0' }}>Manage all platform users</p>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, marginBottom:24 }}>
        {[
          { label:'Total Users', value:users.length,                                 color:'#6366f1' },
          { label:'Active',      value:users.filter(u => u.is_active).length,        color:'#10b981' },
          { label:'Admins',      value:users.filter(u => u.role==='admin').length,   color:'#f59e0b' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ ...card, padding:'18px 22px', display:'flex', alignItems:'center', gap:16 }}>
            <div style={{ width:44, height:44, borderRadius:12, background:color+'22', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Users size={20} color={color} />
            </div>
            <div>
              <p style={{ color:'#fff', fontSize:26, fontWeight:700, margin:0 }}>{value}</p>
              <p style={{ color:'#6b7280', fontSize:13, margin:0 }}>{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ position:'relative', marginBottom:18, maxWidth:320 }}>
        <Search size={15} color="#4b5563" style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)' }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..."
          style={{ width:'100%', background:'#13151f', border:'1px solid #1e2030', borderRadius:10, padding:'9px 14px 9px 36px', color:'#e2e8f0', fontSize:13, outline:'none', fontFamily:'Inter, sans-serif' }} />
      </div>

      <div style={{ ...card, overflow:'hidden' }}>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead>
            <tr style={{ borderBottom:'1px solid #1e2030' }}>
              {['User','Role','Status','Joined','Actions'].map(h => (
                <th key={h} style={{ padding:'12px 24px', textAlign:'left', color:'#4b5563', fontSize:12, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.06em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(user => (
              <tr key={user.id} className="row-hover" style={{ borderBottom:'1px solid #13151f', transition:'background 0.15s' }}>
                <td style={{ padding:'14px 24px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                    <div style={{ width:38, height:38, borderRadius:'50%', background:'linear-gradient(135deg,#6366f1,#8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:14, color:'#fff', flexShrink:0 }}>
                      {user.email?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p style={{ color:'#e2e8f0', fontWeight:600, fontSize:14, margin:0 }}>{user.name || '—'}</p>
                      <p style={{ color:'#6b7280', fontSize:12, margin:0 }}>{user.email}</p>
                    </div>
                  </div>
                </td>
                <td style={{ padding:'14px 24px' }}>
                  <span style={{ background:user.role==='admin'?'rgba(99,102,241,0.18)':'rgba(107,114,128,0.18)', color:user.role==='admin'?'#818cf8':'#9ca3af', borderRadius:20, padding:'4px 12px', fontSize:12, fontWeight:600 }}>
                    {user.role}
                  </span>
                </td>
                <td style={{ padding:'14px 24px' }}>
                  <span style={{ background:user.is_active?'rgba(16,185,129,0.18)':'rgba(239,68,68,0.18)', color:user.is_active?'#34d399':'#f87171', borderRadius:20, padding:'4px 12px', fontSize:12, fontWeight:600, display:'inline-flex', alignItems:'center', gap:5 }}>
                    <span style={{ width:6, height:6, borderRadius:'50%', background:user.is_active?'#10b981':'#ef4444' }} />
                    {user.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td style={{ padding:'14px 24px', color:'#6b7280', fontSize:13 }}>
                  {new Date(user.created_at).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' })}
                </td>
                <td style={{ padding:'14px 24px' }}>
                  <button onClick={() => toggleRole(user.id, user.role)} style={{ display:'flex', alignItems:'center', gap:6, background:'rgba(99,102,241,0.12)', border:'1px solid rgba(99,102,241,0.25)', borderRadius:8, padding:'6px 12px', color:'#818cf8', fontSize:12, fontWeight:500, cursor:'pointer', fontFamily:'Inter, sans-serif' }}>
                    {user.role==='admin' ? <><ShieldOff size={13} /> Remove Admin</> : <><ShieldCheck size={13} /> Make Admin</>}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div style={{ padding:48, textAlign:'center' }}>
            <Users size={36} color="#2d3148" style={{ marginBottom:10 }} />
            <p style={{ color:'#4b5563', fontSize:14, margin:0 }}>No users found</p>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
