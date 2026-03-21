import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import UserLayout from '../../components/user/UserLayout'
import toast from 'react-hot-toast'
import { Eye, EyeOff, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function ProfilePage() {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [showCurr, setShowCurr] = useState(false)
  const [showNew, setShowNew]   = useState(false)
  const [showConf, setShowConf] = useState(false)
  const [name, setName]         = useState(profile?.name || user?.email?.split('@')[0] || '')
  const [email]                 = useState(user?.email || '')
  const [phone, setPhone]       = useState('+1 (234) 567-890')
  const [currPass, setCurrPass] = useState('')
  const [newPass, setNewPass]   = useState('')
  const [confPass, setConfPass] = useState('')

  const handleUpdateInfo = (e) => { e.preventDefault(); toast.success('Profile updated successfully!') }
  const handleUpdatePass = (e) => {
    e.preventDefault()
    if (newPass !== confPass) { toast.error('Passwords do not match'); return }
    if (newPass.length < 6)   { toast.error('Password must be at least 6 characters'); return }
    toast.success('Password updated!')
    setCurrPass(''); setNewPass(''); setConfPass('')
  }
  const handleLogout = () => { signOut(); navigate('/login') }

  const inp = {
    width:'100%', background:'rgba(255,255,255,0.05)',
    border:'1px solid rgba(99,102,241,0.2)', borderRadius:10,
    padding:'12px 16px', color:'#e2e8f0', fontSize:14,
    outline:'none', fontFamily:'Inter, sans-serif'
  }
  const card = { background:'#0f1117', borderRadius:16, border:'1px solid rgba(99,102,241,0.12)', padding:28 }
  const lbl  = { color:'#9ca3af', fontSize:13, display:'block', marginBottom:8, fontWeight:500 }
  const initials = (profile?.name || user?.email || 'U')[0].toUpperCase()

  return (
    <UserLayout title="Profile Settings" subtitle="Manage your account information and subscription plan">
      <div style={{ display:'grid', gridTemplateColumns:'1fr 320px', gap:24 }}>
        <div style={{ display:'flex', flexDirection:'column', gap:24 }}>

          <div style={card}>
            <h2 style={{ color:'#fff', fontWeight:700, fontSize:18, margin:'0 0 24px' }}>Personal Information</h2>
            <div style={{ display:'flex', gap:24, alignItems:'flex-start' }}>
              <div style={{ flexShrink:0, textAlign:'center' }}>
                <div style={{ width:80, height:80, borderRadius:'50%', background:'linear-gradient(135deg,#6366f1,#8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:32, fontWeight:700, color:'#fff', boxShadow:'0 0 24px rgba(99,102,241,0.4)', margin:'0 auto 10px' }}>
                  {initials}
                </div>
                <button style={{ background:'rgba(99,102,241,0.15)', border:'1px solid rgba(99,102,241,0.3)', borderRadius:8, padding:'6px 14px', color:'#818cf8', fontSize:12, cursor:'pointer', fontFamily:'Inter, sans-serif' }}>
                  Edit Photo
                </button>
              </div>
              <form onSubmit={handleUpdateInfo} style={{ flex:1, display:'flex', flexDirection:'column', gap:16 }}>
                <div style={{ display:'grid', gridTemplateColumns:'80px 1fr', alignItems:'center', gap:16 }}>
                  <label style={lbl}>Name</label>
                  <input value={name} onChange={e => setName(e.target.value)} style={inp} />
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'80px 1fr', alignItems:'center', gap:16 }}>
                  <label style={lbl}>Email</label>
                  <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                    <input value={email} readOnly style={{ ...inp, flex:1, opacity:0.7 }} />
                    <span style={{ background:'rgba(16,185,129,0.18)', color:'#34d399', borderRadius:20, padding:'4px 12px', fontSize:12, fontWeight:600, whiteSpace:'nowrap' }}>Verified</span>
                  </div>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'80px 1fr', alignItems:'center', gap:16 }}>
                  <label style={lbl}>Phone</label>
                  <input value={phone} onChange={e => setPhone(e.target.value)} style={inp} />
                </div>
                <button type="submit" style={{ alignSelf:'flex-start', background:'linear-gradient(90deg,#6366f1,#8b5cf6)', border:'none', borderRadius:10, padding:'12px 32px', color:'#fff', fontWeight:600, fontSize:14, cursor:'pointer', fontFamily:'Inter, sans-serif' }}>
                  Update Information
                </button>
              </form>
            </div>
          </div>

          <div style={card}>
            <h2 style={{ color:'#fff', fontWeight:700, fontSize:18, margin:'0 0 24px' }}>Change Password</h2>
            <form onSubmit={handleUpdatePass} style={{ display:'flex', flexDirection:'column', gap:16 }}>
              {[
                { label:'Current Password',     val:currPass, set:setCurrPass, show:showCurr, toggle:()=>setShowCurr(p=>!p) },
                { label:'New Password',         val:newPass,  set:setNewPass,  show:showNew,  toggle:()=>setShowNew(p=>!p) },
                { label:'Confirm New Password', val:confPass, set:setConfPass, show:showConf, toggle:()=>setShowConf(p=>!p) },
              ].map(({ label: lb, val, set, show, toggle }) => (
                <div key={lb} style={{ display:'grid', gridTemplateColumns:'180px 1fr', alignItems:'center', gap:16 }}>
                  <label style={lbl}>{lb}</label>
                  <div style={{ position:'relative' }}>
                    <input type={show?'text':'password'} value={val} onChange={e => set(e.target.value)} style={{ ...inp, paddingRight:44 }} />
                    <button type="button" onClick={toggle} style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#6366f1' }}>
                      {show ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              ))}
              <button type="submit" style={{ alignSelf:'center', background:'linear-gradient(90deg,#2563eb,#6366f1)', border:'none', borderRadius:10, padding:'13px 48px', color:'#fff', fontWeight:600, fontSize:14, cursor:'pointer', fontFamily:'Inter, sans-serif', marginTop:8, width:'100%' }}>
                Update Password
              </button>
            </form>
          </div>
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
          <div style={card}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
              <h3 style={{ color:'#fff', fontWeight:700, fontSize:16, margin:0 }}>Subscription Plan</h3>
              <span style={{ background:'rgba(99,102,241,0.2)', color:'#818cf8', borderRadius:6, padding:'4px 12px', fontSize:12, fontWeight:600 }}>Pro Plan</span>
            </div>
            {[
              { icon:'📋', label:'Meetings/Month', value:'Unlimited' },
              { icon:'💾', label:'Storage Used',   value:'8.5 GB / 100 GB' },
              { icon:'📅', label:'Valid Till',      value:'May 25, 2024' },
            ].map(({ icon, label: lb, value }) => (
              <div key={lb} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <span style={{ fontSize:16 }}>{icon}</span>
                  <span style={{ color:'#9ca3af', fontSize:13 }}>{lb}</span>
                </div>
                <span style={{ color:'#e2e8f0', fontSize:13, fontWeight:600 }}>{value}</span>
              </div>
            ))}
            <div style={{ height:4, background:'#1e2030', borderRadius:4, margin:'16px 0' }}>
              <div style={{ height:'100%', width:'8%', background:'linear-gradient(90deg,#6366f1,#8b5cf6)', borderRadius:4 }} />
            </div>
            <button style={{ width:'100%', padding:'12px', background:'linear-gradient(90deg,#d97706,#dc2626)', border:'none', borderRadius:10, color:'#fff', fontWeight:600, fontSize:14, cursor:'pointer', fontFamily:'Inter, sans-serif', marginBottom:10 }}>
              Manage Subscription
            </button>
            <button style={{ width:'100%', padding:'10px', background:'none', border:'1px solid rgba(99,102,241,0.3)', borderRadius:10, color:'#818cf8', fontWeight:500, fontSize:13, cursor:'pointer', fontFamily:'Inter, sans-serif', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
              📄 Download Invoice
            </button>
          </div>

          <div style={card}>
            <h3 style={{ color:'#fff', fontWeight:700, fontSize:16, margin:'0 0 18px' }}>Account Activity</h3>
            {[
              { icon:'🏠', label:'Account Created', value:'Jan 15, 2024' },
              { icon:'🕐', label:'Last Login',       value:'Today, 10:22 AM' },
              { icon:'⚡', label:'Last Activity',    value:'2 hours ago' },
            ].map(({ icon, label: lb, value }) => (
              <div key={lb} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <span style={{ fontSize:16 }}>{icon}</span>
                  <span style={{ color:'#9ca3af', fontSize:13 }}>{lb}</span>
                </div>
                <span style={{ color:'#e2e8f0', fontSize:13, fontWeight:500 }}>{value}</span>
              </div>
            ))}
            <button onClick={handleLogout} style={{ width:'100%', marginTop:8, padding:'11px', background:'rgba(239,68,68,0.12)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:10, color:'#f87171', fontWeight:600, fontSize:13, cursor:'pointer', fontFamily:'Inter, sans-serif', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
              <LogOut size={15} /> Logout
            </button>
          </div>
        </div>
      </div>
    </UserLayout>
  )
}
