import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import UserLayout from '../../components/user/UserLayout'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import { Upload, FileText, CheckCircle, X, Clock } from 'lucide-react'

export default function UploadPage() {
  const { user } = useAuth()
  const navigate  = useNavigate()
  const fileRef   = useRef()
  const [file, setFile]           = useState(null)
  const [title, setTitle]         = useState('')
  const [language, setLanguage]   = useState('en')
  const [uploading, setUploading] = useState(false)
  const [drag, setDrag]           = useState(false)

  const handleFile = (f) => {
    const ok = ['audio/mpeg','audio/wav','audio/ogg','video/mp4','audio/mp4','audio/webm','audio/x-m4a']
    if (!ok.includes(f.type) && !f.name.match(/\.(mp3|wav|mp4|m4a|ogg|webm)$/i)) {
      toast.error('Please upload an audio or video file'); return
    }
    setFile(f)
    if (!title) setTitle(f.name.replace(/\.[^/.]+$/, ''))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file || !title.trim()) return
    const fd = new FormData()
    fd.append('file', file)
    fd.append('title', title)
    fd.append('language', language)
    fd.append('user_id', user.id)
    setUploading(true)
    try {
      await api.post('/meetings/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      toast.success('Meeting uploaded! AI processing started.')
      navigate('/meetings')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const fmtSize = (b) => b < 1048576 ? `${(b/1024).toFixed(1)} KB` : `${(b/1048576).toFixed(1)} MB`
  const card = { background:'#0f1117', borderRadius:16, border:'1px solid rgba(99,102,241,0.12)', padding:24 }

  return (
    <UserLayout title="Upload Meeting" subtitle="Upload your audio or video file and generate transcript + AI summary.">
      <div style={{ display:'grid', gridTemplateColumns:'1fr 320px', gap:24 }}>
        <div style={card}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
            <h2 style={{ color:'#fff', fontWeight:700, fontSize:18, margin:0 }}>Upload New Meeting</h2>
            <span style={{ background:'rgba(99,102,241,0.2)', color:'#818cf8', borderRadius:20, padding:'4px 12px', fontSize:12, fontWeight:600 }}>AI Powered</span>
          </div>

          <form onSubmit={handleSubmit}>
            <div
              onDragOver={e => { e.preventDefault(); setDrag(true) }}
              onDragLeave={() => setDrag(false)}
              onDrop={e => { e.preventDefault(); setDrag(false); if(e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]) }}
              onClick={() => !file && fileRef.current?.click()}
              style={{
                border: `2px dashed ${drag ? '#6366f1' : 'rgba(99,102,241,0.3)'}`,
                borderRadius:14, padding:'40px 20px', textAlign:'center',
                cursor: file ? 'default' : 'pointer',
                background: drag ? 'rgba(99,102,241,0.05)' : 'transparent',
                transition:'all 0.2s', marginBottom:20
              }}
            >
              <input ref={fileRef} type="file" accept="audio/*,video/mp4,.m4a"
                onChange={e => e.target.files[0] && handleFile(e.target.files[0])}
                style={{ display:'none' }} />
              {file ? (
                <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:14 }}>
                  <CheckCircle size={32} color="#34d399" />
                  <div style={{ textAlign:'left' }}>
                    <p style={{ color:'#e2e8f0', fontWeight:600, fontSize:15, margin:0 }}>{file.name}</p>
                    <p style={{ color:'#6b7280', fontSize:13, margin:'4px 0 0' }}>{fmtSize(file.size)}</p>
                  </div>
                  <button type="button" onClick={e => { e.stopPropagation(); setFile(null); setTitle('') }}
                    style={{ background:'rgba(239,68,68,0.15)', border:'none', borderRadius:8, width:32, height:32, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <X size={16} color="#f87171" />
                  </button>
                </div>
              ) : (
                <>
                  <div style={{ width:64, height:64, borderRadius:'50%', background:'rgba(99,102,241,0.1)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
                    <Upload size={30} color="#6366f1" />
                  </div>
                  <p style={{ color:'#e2e8f0', fontWeight:600, fontSize:16, margin:'0 0 6px' }}>Drag & drop audio/video file here</p>
                  <p style={{ color:'#4b5563', fontSize:13, margin:'0 0 18px' }}>or choose a file from your device</p>
                  <button type="button" style={{ background:'linear-gradient(90deg,#6366f1,#8b5cf6)', border:'none', borderRadius:10, padding:'10px 28px', color:'#fff', fontWeight:600, fontSize:14, cursor:'pointer', display:'inline-flex', alignItems:'center', gap:8, fontFamily:'Inter, sans-serif' }}>
                    <FileText size={15} /> Choose File
                  </button>
                  <p style={{ color:'#374151', fontSize:12, marginTop:14 }}>Supported: MP3, WAV, M4A, MP4</p>
                </>
              )}
            </div>

            <div style={{ marginBottom:16 }}>
              <label style={{ color:'#9ca3af', fontSize:13, display:'block', marginBottom:8 }}>Meeting Title</label>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Q2 Planning Meeting" required
                style={{ width:'100%', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(99,102,241,0.2)', borderRadius:10, padding:'12px 16px', color:'#e2e8f0', fontSize:14, outline:'none', fontFamily:'Inter, sans-serif' }} />
            </div>

            <div style={{ marginBottom:24 }}>
              <label style={{ color:'#9ca3af', fontSize:13, display:'block', marginBottom:8 }}>Language</label>
              <select value={language} onChange={e => setLanguage(e.target.value)}
                style={{ width:'100%', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(99,102,241,0.2)', borderRadius:10, padding:'12px 16px', color:'#e2e8f0', fontSize:14, outline:'none', fontFamily:'Inter, sans-serif', cursor:'pointer' }}>
                {[['en','English'],['ta','Tamil'],['hi','Hindi'],['fr','French'],['de','German'],['es','Spanish']].map(([v,l]) => (
                  <option key={v} value={v} style={{ background:'#0f1117' }}>{l}</option>
                ))}
              </select>
            </div>

            <button type="submit" disabled={!file || !title.trim() || uploading} style={{
              width:'100%', padding:'14px',
              background: (!file||!title.trim()||uploading) ? '#2d3148' : 'linear-gradient(90deg,#2563eb,#6366f1)',
              border:'none', borderRadius:10, color:'#fff', fontWeight:700, fontSize:15,
              cursor: (!file||!title.trim()||uploading) ? 'not-allowed' : 'pointer',
              fontFamily:'Inter, sans-serif', display:'flex', alignItems:'center', justifyContent:'center', gap:10
            }}>
              {uploading
                ? <><div style={{ width:18, height:18, border:'3px solid rgba(255,255,255,0.3)', borderTopColor:'#fff', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} /> Uploading...</>
                : <><Upload size={18} /> Upload & Process</>
              }
            </button>
          </form>
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
          <div style={card}>
            <h3 style={{ color:'#fff', fontWeight:700, fontSize:16, margin:'0 0 20px' }}>Processing Flow</h3>
            {[
              { num:'1', label:'Upload meeting file',         icon:'☁️',  color:'rgba(59,130,246,0.15)' },
              { num:'2', label:'Convert audio to transcript', icon:'🎙️', color:'rgba(139,92,246,0.15)' },
              { num:'3', label:'Generate AI summary',         icon:'✨',  color:'rgba(245,158,11,0.15)' },
            ].map(({ num, label, icon, color }) => (
              <div key={num} style={{ display:'flex', alignItems:'center', gap:14, marginBottom:16 }}>
                <div style={{ width:40, height:40, borderRadius:10, background:color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>{icon}</div>
                <p style={{ color:'#e2e8f0', fontSize:14, margin:0 }}>{num}. {label}</p>
              </div>
            ))}
          </div>

          <div style={card}>
            <h3 style={{ color:'#fff', fontWeight:700, fontSize:16, margin:'0 0 16px' }}>Supported Formats</h3>
            {['MP3','WAV','M4A','MP4'].map(f => (
              <div key={f} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
                <CheckCircle size={15} color="#34d399" />
                <span style={{ color:'#9ca3af', fontSize:14, fontWeight:500 }}>{f}</span>
              </div>
            ))}
          </div>

          <div style={card}>
            <h3 style={{ color:'#fff', fontWeight:700, fontSize:16, margin:'0 0 16px' }}>Recent Status</h3>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <Clock size={16} color="#6b7280" />
              <span style={{ color:'#6b7280', fontSize:13 }}>Last upload status will appear here</span>
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  )
}
