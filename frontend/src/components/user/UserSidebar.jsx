import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Upload, FileText, BookOpen, FolderOpen, Settings, User, Crown, CheckCircle, LogOut } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'

function ClarivoxLogo({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="8" fill="url(#cvgrad)"/>
      <defs>
        <linearGradient id="cvgrad" x1="0" y1="0" x2="32" y2="32">
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

export default function UserSidebar() {
  const location    = useLocation()
  const navigate    = useNavigate()
  const { signOut } = useAuth()
  const { colors }  = useTheme()

  const isActive = (p) => location.pathname === p

  const ls = (active) => ({
    display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
    borderRadius: 8, marginBottom: 2,
    background: active ? 'rgba(91,141,238,0.15)' : 'transparent',
    color: active ? '#7aa7f5' : colors.textSecondary,
    textDecoration: 'none', fontSize: 14, fontWeight: active ? 600 : 400,
    borderLeft: active ? '3px solid #5b8dee' : '3px solid transparent',
    cursor: 'pointer', width: '100%', textAlign: 'left',
    fontFamily: 'Inter, sans-serif', outline: 'none', boxSizing: 'border-box',
    border: 'none', transition: 'all 0.15s'
  })

  return (
    <aside style={{
      width: 258, background: colors.sidebarBg,
      borderRight: `1px solid ${colors.border}`,
      display: 'flex', flexDirection: 'column',
      height: '100vh', position: 'fixed', top: 0, left: 0, zIndex: 50,
      transition: 'background 0.3s, border-color 0.3s'
    }}>
      <div style={{ padding: '20px 18px', borderBottom: `1px solid ${colors.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <ClarivoxLogo size={36}/>
          <div>
            <div style={{ fontWeight: 800, fontSize: 17, color: colors.textPrimary, letterSpacing: '-0.3px' }}>
              Clari<span style={{ color: '#7aa7f5' }}>vox</span>
            </div>
            <div style={{ color: colors.textMuted, fontSize: 10, marginTop: 1 }}>AI Voice Intelligence</div>
          </div>
        </div>
      </div>

      <nav style={{ flex: 1, padding: '14px 10px', overflowY: 'auto' }}>
        <Link to="/dashboard" style={ls(isActive('/dashboard'))}><LayoutDashboard size={17}/> Dashboard</Link>
        <Link to="/upload"    style={ls(isActive('/upload'))}><Upload size={17}/> Upload Meeting</Link>
        <Link to="/meetings"  style={ls(isActive('/meetings'))}><FileText size={17}/> Meetings</Link>
        <Link to="/summaries" style={ls(isActive('/summaries'))}><BookOpen size={17}/> Summaries</Link>
        <Link to="/projects"  style={ls(isActive('/projects'))}><FolderOpen size={17}/> Projects</Link>
        <Link to="/settings"  style={ls(isActive('/settings'))}><Settings size={17}/> Settings</Link>
        <Link to="/profile"   style={ls(isActive('/profile'))}><User size={17}/> Profile</Link>
      </nav>

      <div style={{ padding: '0 14px 16px' }}>
        <div style={{ background: 'linear-gradient(135deg,#0f1a3a,#1a1060)', borderRadius: 14, padding: 16, border: '1px solid rgba(91,141,238,0.25)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <Crown size={15} color="#fbbf24"/>
            <span style={{ fontWeight: 700, color: '#fff', fontSize: 13 }}>Upgrade to Pro</span>
          </div>
          {['Unlimited Meetings', 'AI Summaries', 'Export Reports'].map(f => (
            <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6 }}>
              <CheckCircle size={12} color="#5b8dee"/>
              <span style={{ color: '#93b4f5', fontSize: 12 }}>{f}</span>
            </div>
          ))}
          <button
            onClick={() => navigate('/settings?upgrade=true')}
            style={{ width: '100%', marginTop: 12, padding: '9px 0', background: 'linear-gradient(90deg,#5b8dee,#a78bfa)', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
            Upgrade Now
          </button>
        </div>
        <button onClick={() => { signOut(); navigate('/login') }} style={{ width: '100%', marginTop: 10, padding: '8px 0', background: 'transparent', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, color: '#f87171', fontWeight: 500, fontSize: 12, cursor: 'pointer', fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <LogOut size={13}/> Sign Out
        </button>
        <p style={{ color: colors.textMuted, fontSize: 11, textAlign: 'center', marginTop: 10 }}>© 2024 Clarivox</p>
      </div>
    </aside>
  )
}