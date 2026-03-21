import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Eye, EyeOff, User, Mail, Lock } from 'lucide-react'

function ClarivoxIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
      <rect x="5"  y="13" width="3" height="6"  rx="1.5" fill="white" opacity="0.7"/>
      <rect x="10" y="9"  width="3" height="14" rx="1.5" fill="white"/>
      <rect x="15" y="6"  width="3" height="20" rx="1.5" fill="white"/>
      <rect x="20" y="9"  width="3" height="14" rx="1.5" fill="white"/>
      <rect x="25" y="13" width="3" height="6"  rx="1.5" fill="white" opacity="0.7"/>
    </svg>
  )
}

export default function LoginPage() {
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode]       = useState('signup')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm]       = useState({ name:'', email:'', password:'' })
  const set = (k,v) => setForm(p=>({...p,[k]:v}))

  const handle = async (e) => {
    e.preventDefault(); setLoading(true)
    try {
      const { error } = mode==='login' ? await signIn(form.email,form.password) : await signUp(form.email,form.password)
      if (error) throw error
      mode==='signup' ? toast.success('Account created! Check your email.') : navigate('/dashboard')
    } catch(err) { toast.error(err.message) }
    finally { setLoading(false) }
  }

  const inp = {
    width:'100%', background:'rgba(91,141,238,0.06)',
    border:'1px solid rgba(91,141,238,0.18)', borderRadius:10,
    padding:'13px 14px 13px 42px', color:'#e2e8f0',
    fontSize:14, outline:'none', fontFamily:'Inter, sans-serif', transition:'border 0.2s'
  }

  return (
    <div style={{ minHeight:'100vh', background:'#08090f', display:'flex', fontFamily:'Inter, sans-serif' }}>
      <style>{`
        input::placeholder { color:#2d3a5a; }
        input:focus { border-color:rgba(91,141,238,0.5) !important; background:rgba(91,141,238,0.09) !important; }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes pulse { 0%,100%{opacity:0.4} 50%{opacity:1} }
        @keyframes spin  { to{transform:rotate(360deg)} }
        @keyframes wave  { 0%,100%{scaleY:1} 50%{scaleY:1.6} }
      `}</style>

      {/* ── Left form ── */}
      <div style={{ flex:'0 0 500px', padding:'44px 52px', display:'flex', flexDirection:'column', justifyContent:'space-between', borderRight:'1px solid rgba(91,141,238,0.08)' }}>

        {/* Logo */}
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:38, height:38, borderRadius:10, background:'linear-gradient(135deg,#5b8dee,#a78bfa)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 0 18px rgba(91,141,238,0.4)' }}>
            <ClarivoxIcon/>
          </div>
          <span style={{ fontWeight:800, fontSize:18, color:'#fff', letterSpacing:'-0.3px' }}>
            Clari<span style={{ color:'#7aa7f5' }}>vox</span>
          </span>
        </div>

        {/* Form */}
        <div>
          <h1 style={{ color:'#fff', fontWeight:800, fontSize:30, margin:'0 0 8px', letterSpacing:'-0.5px' }}>
            {mode==='login' ? 'Welcome back' : 'Create an account'}
          </h1>
          <p style={{ color:'#4a5a7a', fontSize:14, margin:'0 0 30px', lineHeight:1.6 }}>
            {mode==='login' ? "Don't have an account? " : 'Enter your information to get started. Already have an account? '}
            <button onClick={()=>setMode(mode==='login'?'signup':'login')}
              style={{ background:'none', border:'none', color:'#7aa7f5', fontSize:14, cursor:'pointer', fontFamily:'Inter, sans-serif', fontWeight:600 }}>
              {mode==='login' ? 'Sign up →' : 'Sign in →'}
            </button>
          </p>

          <form onSubmit={handle} style={{ display:'flex', flexDirection:'column', gap:18 }}>
            {mode==='signup' && (
              <div>
                <label style={{ color:'#6a7a9a', fontSize:13, display:'block', marginBottom:8, fontWeight:500 }}>Your name:</label>
                <div style={{ position:'relative' }}>
                  <User size={15} color="#3d4a6b" style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)' }}/>
                  <input type="text" value={form.name} onChange={e=>set('name',e.target.value)} style={inp} required/>
                </div>
              </div>
            )}
            <div>
              <label style={{ color:'#6a7a9a', fontSize:13, display:'block', marginBottom:8, fontWeight:500 }}>Your email:</label>
              <div style={{ position:'relative' }}>
                <Mail size={15} color="#3d4a6b" style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)' }}/>
                <input type="email" value={form.email} onChange={e=>set('email',e.target.value)} style={inp} required/>
              </div>
            </div>
            <div>
              <label style={{ color:'#6a7a9a', fontSize:13, display:'block', marginBottom:8, fontWeight:500 }}>
                {mode==='signup' ? 'Your new password:' : 'Password:'}
              </label>
              <div style={{ position:'relative' }}>
                <Lock size={15} color="#3d4a6b" style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)' }}/>
                <input type={showPass?'text':'password'} value={form.password}
                  onChange={e=>set('password',e.target.value)}
                  style={{ ...inp, paddingRight:44 }} required minLength={6}/>
                <button type="button" onClick={()=>setShowPass(p=>!p)} style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#5b8dee' }}>
                  {showPass ? <EyeOff size={15}/> : <Eye size={15}/>}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} style={{
              width:'100%', padding:'14px',
              background: loading ? '#1a2040' : 'linear-gradient(90deg,#5b8dee,#a78bfa)',
              border:'none', borderRadius:10, color:'#fff',
              fontWeight:700, fontSize:15, cursor: loading?'not-allowed':'pointer',
              fontFamily:'Inter, sans-serif', marginTop:4,
              display:'flex', alignItems:'center', justifyContent:'center', gap:10,
              boxShadow: loading ? 'none' : '0 4px 20px rgba(91,141,238,0.3)'
            }}>
              {loading
                ? <><span style={{ width:16, height:16, border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'#fff', borderRadius:'50%', animation:'spin 0.8s linear infinite', display:'inline-block' }}/> Please wait...</>
                : mode==='login' ? 'Sign in' : 'Create account'
              }
            </button>
          </form>
        </div>

        {/* Footer */}
        <p style={{ color:'#1e2a4a', fontSize:12, margin:0 }}>© 2024 Clarivox · AI Voice Intelligence Platform</p>
      </div>

      {/* ── Right illustration ── */}
      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', position:'relative', overflow:'hidden' }}>
        {/* Background glow */}
        <div style={{ position:'absolute', width:500, height:500, borderRadius:'50%', background:'radial-gradient(circle, rgba(91,141,238,0.06) 0%, transparent 65%)', top:'10%', left:'10%', pointerEvents:'none' }}/>
        <div style={{ position:'absolute', width:350, height:350, borderRadius:'50%', background:'radial-gradient(circle, rgba(167,139,250,0.05) 0%, transparent 65%)', bottom:'10%', right:'5%', pointerEvents:'none' }}/>

        {/* Animated waveform illustration */}
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:32 }}>
          {/* Logo large */}
          <svg width="120" height="120" viewBox="0 0 120 120" style={{ animation:'float 4s ease-in-out infinite', filter:'drop-shadow(0 0 30px rgba(91,141,238,0.35))' }}>
            <rect width="120" height="120" rx="28" fill="url(#biggrad)"/>
            <defs>
              <linearGradient id="biggrad" x1="0" y1="0" x2="120" y2="120">
                <stop offset="0%" stopColor="#5b8dee"/>
                <stop offset="100%" stopColor="#a78bfa"/>
              </linearGradient>
            </defs>
            {/* Waveform bars */}
            <rect x="18"  y="50" width="10" height="20" rx="5" fill="white" opacity="0.6"/>
            <rect x="34"  y="36" width="10" height="48" rx="5" fill="white" opacity="0.75"/>
            <rect x="50"  y="22" width="10" height="76" rx="5" fill="white"/>
            <rect x="66"  y="32" width="10" height="56" rx="5" fill="white" opacity="0.8"/>
            <rect x="82"  y="44" width="10" height="32" rx="5" fill="white" opacity="0.65"/>
            <rect x="98"  y="52" width="10" height="16" rx="5" fill="white" opacity="0.5"/>
          </svg>

          {/* Product name + tagline */}
          <div style={{ textAlign:'center' }}>
            <div style={{ fontWeight:800, fontSize:36, color:'#fff', letterSpacing:'-1px' }}>
              Clari<span style={{ color:'#7aa7f5' }}>vox</span>
            </div>
            <div style={{ color:'#3d4a6b', fontSize:15, marginTop:6, letterSpacing:'0.3px' }}>
              Clarity from every voice
            </div>
          </div>

          {/* Animated mini waveform */}
          <div style={{ display:'flex', alignItems:'center', gap:4, height:40 }}>
            {[14, 28, 38, 24, 40, 18, 32, 22, 36, 16, 30, 20].map((h, i) => (
              <div key={i} style={{
                width:5, borderRadius:3,
                background:`rgba(91,141,238,${0.3 + (i%4)*0.18})`,
                height:h,
                animation:`wave 1.2s ease-in-out infinite`,
                animationDelay:`${i*0.1}s`
              }}/>
            ))}
          </div>

          {/* Feature pills */}
          <div style={{ display:'flex', gap:10, flexWrap:'wrap', justifyContent:'center', maxWidth:360 }}>
            {['AI Transcription','Smart Summaries','Action Items','Speaker Detection'].map(f=>(
              <span key={f} style={{ background:'rgba(91,141,238,0.1)', border:'1px solid rgba(91,141,238,0.2)', borderRadius:20, padding:'6px 14px', color:'#7aa7f5', fontSize:12, fontWeight:500 }}>{f}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
