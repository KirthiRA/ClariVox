import { useState } from 'react'
import UserLayout from '../../components/user/UserLayout'
import toast from 'react-hot-toast'
import { Copy, RefreshCw } from 'lucide-react'

function Toggle({ on, setOn }) {
  return (
    <div onClick={() => setOn(p => !p)} style={{
      width:44, height:24, borderRadius:24, cursor:'pointer', transition:'background 0.3s',
      background: on ? '#6366f1' : '#2d3148', position:'relative', flexShrink:0
    }}>
      <div style={{
        position:'absolute', top:3, left: on ? 23 : 3,
        width:18, height:18, borderRadius:'50%', background:'#fff', transition:'left 0.3s'
      }} />
    </div>
  )
}

export default function SettingsPage() {
  const [theme, setTheme]       = useState('dark')
  const [language, setLanguage] = useState('English')
  const [notifOn, setNotifOn]   = useState(true)
  const [emailOn, setEmailOn]   = useState(false)
  const [apiKey]                = useState('sk-nt-xxxxxxxxxxxxxxxxxxxx')

  const handleSave = () => toast.success('Settings saved!')
  const handleCopy = () => { navigator.clipboard.writeText(apiKey); toast.success('API key copied!') }

  const card = { background:'#0f1117', borderRadius:16, border:'1px solid rgba(99,102,241,0.12)', padding:28 }

  return (
    <UserLayout title="Settings" subtitle="Adjust your preferences and application settings">
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24, maxWidth:900 }}>

        <div style={card}>
          <h3 style={{ color:'#fff', fontWeight:700, fontSize:17, margin:'0 0 20px' }}>Theme</h3>
          {['dark','light'].map(t => (
            <div key={t} onClick={() => setTheme(t)} style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14, cursor:'pointer' }}>
              <div style={{
                width:20, height:20, borderRadius:'50%', border:'2px solid',
                borderColor: theme===t ? '#6366f1' : '#2d3148',
                background: theme===t ? '#6366f1' : 'transparent',
                display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.2s'
              }}>
                {theme===t && <div style={{ width:8, height:8, borderRadius:'50%', background:'#fff' }} />}
              </div>
              <span style={{ color: theme===t ? '#e2e8f0' : '#6b7280', fontSize:15, fontWeight: theme===t ? 600 : 400, textTransform:'capitalize' }}>{t}</span>
            </div>
          ))}

          <div style={{ height:1, background:'rgba(99,102,241,0.12)', margin:'20px 0' }} />

          <h3 style={{ color:'#fff', fontWeight:700, fontSize:17, margin:'0 0 14px' }}>Language</h3>
          <select value={language} onChange={e => setLanguage(e.target.value)} style={{
            width:'100%', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(99,102,241,0.2)',
            borderRadius:10, padding:'11px 14px', color:'#e2e8f0', fontSize:14, outline:'none',
            fontFamily:'Inter, sans-serif', marginBottom:20, cursor:'pointer'
          }}>
            {['English','Tamil','Hindi','French','German','Spanish','Japanese'].map(l => (
              <option key={l} value={l} style={{ background:'#0f1117' }}>{l}</option>
            ))}
          </select>

          <div style={{ height:1, background:'rgba(99,102,241,0.12)', margin:'0 0 20px' }} />

          <h3 style={{ color:'#fff', fontWeight:700, fontSize:17, margin:'0 0 16px' }}>Notifications</h3>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
            <span style={{ color:'#e2e8f0', fontSize:14 }}>Push notifications</span>
            <Toggle on={notifOn} setOn={setNotifOn} />
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <span style={{ color:'#9ca3af', fontSize:14 }}>Receive email notifications</span>
            <Toggle on={emailOn} setOn={setEmailOn} />
          </div>
        </div>

        <div style={card}>
          <h3 style={{ color:'#818cf8', fontWeight:700, fontSize:17, margin:'0 0 20px' }}>Account</h3>
          <h4 style={{ color:'#fff', fontWeight:600, fontSize:15, margin:'0 0 12px' }}>API Access</h4>
          <div style={{ background:'rgba(99,102,241,0.08)', border:'1px solid rgba(99,102,241,0.2)', borderRadius:10, padding:'12px 14px', marginBottom:8 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:10 }}>
              <span style={{ color:'#9ca3af', fontSize:13, fontFamily:'monospace', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                {apiKey.slice(0,8) + '••••••••••••••••••••'}
              </span>
              <div style={{ display:'flex', gap:8, flexShrink:0 }}>
                <button onClick={handleCopy} className="icon-btn" style={{ width:32, height:32, borderRadius:7, background:'rgba(99,102,241,0.15)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <Copy size={14} color="#818cf8" />
                </button>
                <button className="icon-btn" style={{ width:32, height:32, borderRadius:7, background:'rgba(99,102,241,0.15)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <RefreshCw size={14} color="#818cf8" />
                </button>
              </div>
            </div>
          </div>
          <button style={{ background:'none', border:'none', color:'#818cf8', fontSize:13, cursor:'pointer', fontFamily:'Inter, sans-serif', fontWeight:500, padding:0, marginBottom:24 }}>
            Revoke Key
          </button>

          <div style={{ height:1, background:'rgba(99,102,241,0.12)', margin:'0 0 20px' }} />

          <h4 style={{ color:'#fff', fontWeight:600, fontSize:15, margin:'0 0 14px' }}>Danger Zone</h4>
          <button style={{ width:'100%', padding:'11px', background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.25)', borderRadius:10, color:'#f87171', fontSize:13, fontWeight:500, cursor:'pointer', fontFamily:'Inter, sans-serif', marginBottom:10 }}>
            Delete Account
          </button>
          <button style={{ width:'100%', padding:'11px', background:'rgba(245,158,11,0.1)', border:'1px solid rgba(245,158,11,0.25)', borderRadius:10, color:'#fbbf24', fontSize:13, fontWeight:500, cursor:'pointer', fontFamily:'Inter, sans-serif' }}>
            Export All Data
          </button>
        </div>
      </div>

      <button onClick={handleSave} style={{ marginTop:24, padding:'13px 48px', background:'linear-gradient(90deg,#6366f1,#8b5cf6)', border:'none', borderRadius:10, color:'#fff', fontWeight:700, fontSize:15, cursor:'pointer', fontFamily:'Inter, sans-serif' }}>
        Save Settings
      </button>
    </UserLayout>
  )
}
