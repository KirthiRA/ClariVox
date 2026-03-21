import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import UserLayout from '../../components/user/UserLayout'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import {
  FolderOpen, Folder, Plus, X, FileText, Clock,
  CheckCircle, MoreVertical, Trash2, Edit2, ChevronDown, ChevronRight, AlertCircle
} from 'lucide-react'

const fmt = (s) => {
  if (!s || s === 0) return '—'
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`
}

const STORAGE_KEY = 'clarivox_projects'

const loadProjects = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') }
  catch { return [] }
}

const saveProjects = (projects) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects))
}

const FOLDER_COLORS = [
  '#5b8dee', '#a78bfa', '#34d399', '#fbbf24',
  '#f87171', '#38bdf8', '#fb7185', '#4ade80'
]

// ── Create / Edit Folder Modal ─────────────────────────────────────────────
function FolderModal({ onSave, onClose, existing }) {
  const { isDark } = useTheme()
  const [folderName, setFolderName] = useState(existing?.name || '')
  const [color, setColor]           = useState(existing?.color || FOLDER_COLORS[0])

  const modalBg = isDark ? '#0f1117' : '#ffffff'
  const textMain = isDark ? '#e2e8f0' : '#0f172a'
  const textSub  = isDark ? '#6a7a9a' : '#475569'
  const border   = isDark ? 'rgba(91,141,238,0.12)' : 'rgba(91,141,238,0.2)'
  const inputBg  = isDark ? 'rgba(91,141,238,0.06)' : 'rgba(91,141,238,0.07)'

  const handleSave = () => {
    if (!folderName.trim()) { toast.error('Please enter a folder name'); return }
    onSave({ name: folderName.trim(), color })
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      onClick={onClose}>
      <div style={{ background: modalBg, borderRadius: 16, border: `1px solid ${border}`, width: '100%', maxWidth: 420, padding: 28 }}
        onClick={e => e.stopPropagation()}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
          <h2 style={{ color: textMain, fontWeight: 700, fontSize: 18, margin: 0 }}>
            {existing ? 'Edit Folder' : 'New Folder'}
          </h2>
          <button onClick={onClose} style={{ background: 'rgba(239,68,68,0.1)', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={15} color="#f87171"/>
          </button>
        </div>

        <label style={{ color: textSub, fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>
          Folder Name
        </label>
        <input
          autoFocus
          value={folderName}
          onChange={e => setFolderName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSave()}
          placeholder="e.g. Client Meetings, Sprint Reviews..."
          style={{ width: '100%', background: inputBg, border: `1px solid ${border}`, borderRadius: 10, padding: '11px 14px', color: textMain, fontSize: 14, outline: 'none', fontFamily: 'Inter, sans-serif', marginBottom: 20, boxSizing: 'border-box' }}
        />

        <label style={{ color: textSub, fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 10 }}>
          Folder Color
        </label>
        <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
          {FOLDER_COLORS.map(c => (
            <div key={c} onClick={() => setColor(c)} style={{
              width: 32, height: 32, borderRadius: '50%', background: c, cursor: 'pointer',
              border: color === c ? `3px solid ${textMain}` : '3px solid transparent',
              boxShadow: color === c ? `0 0 0 2px ${c}40` : 'none',
              transition: 'all 0.2s'
            }}/>
          ))}
        </div>

        <div style={{ background: inputBg, borderRadius: 10, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
          <Folder size={22} color={color} fill={`${color}30`}/>
          <span style={{ color: textMain, fontSize: 14, fontWeight: 600 }}>
            {folderName || 'Folder preview'}
          </span>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '11px', background: 'transparent', border: `1px solid ${border}`, borderRadius: 10, color: textSub, fontSize: 14, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
            Cancel
          </button>
          <button onClick={handleSave} style={{ flex: 1, padding: '11px', background: 'linear-gradient(90deg,#5b8dee,#a78bfa)', border: 'none', borderRadius: 10, color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
            {existing ? 'Save Changes' : 'Create Folder'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Assign Meeting Modal ───────────────────────────────────────────────────
function AssignModal({ meetings, projects, onAssign, onClose }) {
  const { isDark } = useTheme()
  const [selectedMeeting, setSelectedMeeting] = useState('')
  const [selectedProject, setSelectedProject] = useState('')

  const modalBg = isDark ? '#0f1117' : '#ffffff'
  const textMain = isDark ? '#e2e8f0' : '#0f172a'
  const textSub  = isDark ? '#6a7a9a' : '#475569'
  const border   = isDark ? 'rgba(91,141,238,0.12)' : 'rgba(91,141,238,0.2)'
  const inputBg  = isDark ? 'rgba(91,141,238,0.06)' : 'rgba(91,141,238,0.07)'
  const selectStyle = {
    width: '100%', background: inputBg, border: `1px solid ${border}`,
    borderRadius: 10, padding: '11px 14px', color: textMain, fontSize: 14,
    outline: 'none', fontFamily: 'Inter, sans-serif', cursor: 'pointer',
    marginBottom: 16, boxSizing: 'border-box'
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      onClick={onClose}>
      <div style={{ background: modalBg, borderRadius: 16, border: `1px solid ${border}`, width: '100%', maxWidth: 420, padding: 28 }}
        onClick={e => e.stopPropagation()}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
          <h2 style={{ color: textMain, fontWeight: 700, fontSize: 18, margin: 0 }}>Add Meeting to Folder</h2>
          <button onClick={onClose} style={{ background: 'rgba(239,68,68,0.1)', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={15} color="#f87171"/>
          </button>
        </div>

        <label style={{ color: textSub, fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>
          Select Meeting
        </label>
        <select value={selectedMeeting} onChange={e => setSelectedMeeting(e.target.value)} style={selectStyle}>
          <option value="">— Choose a meeting —</option>
          {meetings.map(m => (
            <option key={m.id} value={m.id} style={{ background: isDark ? '#0f1117' : '#fff' }}>
              {m.title} {m.status !== 'done' ? '(processing)' : ''}
            </option>
          ))}
        </select>

        <label style={{ color: textSub, fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>
          Select Folder
        </label>
        <select value={selectedProject} onChange={e => setSelectedProject(e.target.value)} style={selectStyle}>
          <option value="">— Choose a folder —</option>
          {projects.map(p => (
            <option key={p.id} value={p.id} style={{ background: isDark ? '#0f1117' : '#fff' }}>
              {p.name}
            </option>
          ))}
        </select>

        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '11px', background: 'transparent', border: `1px solid ${border}`, borderRadius: 10, color: textSub, fontSize: 14, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
            Cancel
          </button>
          <button
            onClick={() => {
              if (!selectedMeeting || !selectedProject) { toast.error('Please select both a meeting and a folder'); return }
              onAssign(selectedMeeting, selectedProject)
            }}
            style={{ flex: 1, padding: '11px', background: 'linear-gradient(90deg,#5b8dee,#a78bfa)', border: 'none', borderRadius: 10, color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
            Add to Folder
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Folder Card ────────────────────────────────────────────────────────────
function FolderCard({ project, meetings, onDelete, onEdit, onRemoveMeeting, colors }) {
  const [expanded, setExpanded] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  const folderMeetings = meetings.filter(m => project.meetingIds?.includes(String(m.id)))
  const totalDuration  = folderMeetings.reduce((acc, m) => acc + (m.duration_seconds || 0), 0)
  const doneCount      = folderMeetings.filter(m => m.status === 'done').length

  return (
    <div style={{ background: colors.cardBg, borderRadius: 16, border: `1px solid ${colors.border}`, overflow: 'hidden', transition: 'all 0.2s' }}>
      <div style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 4, height: 40, borderRadius: 4, background: project.color, flexShrink: 0 }}/>

        <div onClick={() => setExpanded(p => !p)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
          {expanded
            ? <FolderOpen size={24} color={project.color}/>
            : <Folder size={24} color={project.color} fill={`${project.color}25`}/>
          }
          <div>
            <p style={{ color: colors.textPrimary, fontWeight: 700, fontSize: 15, margin: 0 }}>{project.name}</p>
            <p style={{ color: colors.textSecondary, fontSize: 12, margin: '3px 0 0' }}>
              {folderMeetings.length} meeting{folderMeetings.length !== 1 ? 's' : ''}
              {totalDuration > 0 ? ` · ${fmt(totalDuration)} total` : ''}
              {doneCount > 0 ? ` · ${doneCount} processed` : ''}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {folderMeetings.length > 0 && (
            <span style={{ background: `${project.color}20`, color: project.color, borderRadius: 20, padding: '4px 12px', fontSize: 12, fontWeight: 600 }}>
              {folderMeetings.length}
            </span>
          )}
          <button onClick={() => setExpanded(p => !p)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: colors.textSecondary, display: 'flex', alignItems: 'center', padding: 4 }}>
            {expanded ? <ChevronDown size={16}/> : <ChevronRight size={16}/>}
          </button>
          <div style={{ position: 'relative' }}>
            <button onClick={() => setMenuOpen(p => !p)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: colors.textSecondary, display: 'flex', alignItems: 'center', padding: 4 }}>
              <MoreVertical size={16}/>
            </button>
            {menuOpen && (
              <div style={{ position: 'absolute', right: 0, top: 28, background: colors.cardBg, border: `1px solid ${colors.border}`, borderRadius: 10, overflow: 'hidden', zIndex: 10, minWidth: 140, boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}
                onMouseLeave={() => setMenuOpen(false)}>
                <button onClick={() => { onEdit(); setMenuOpen(false) }} style={{ width: '100%', padding: '10px 14px', background: 'transparent', border: 'none', cursor: 'pointer', color: colors.textPrimary, fontSize: 13, textAlign: 'left', fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Edit2 size={13}/> Rename
                </button>
                <button onClick={() => { onDelete(); setMenuOpen(false) }} style={{ width: '100%', padding: '10px 14px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#f87171', fontSize: 13, textAlign: 'left', fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Trash2 size={13}/> Delete Folder
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {expanded && (
        <div style={{ borderTop: `1px solid ${colors.border}` }}>
          {folderMeetings.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center' }}>
              <FileText size={28} color={colors.textMuted} style={{ marginBottom: 8 }}/>
              <p style={{ color: colors.textSecondary, fontSize: 13, margin: 0 }}>No meetings in this folder</p>
              <p style={{ color: colors.textMuted, fontSize: 12, margin: '4px 0 0' }}>Click "Add Meeting" to assign meetings here</p>
            </div>
          ) : (
            folderMeetings.map((m, i) => (
              <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 20px', borderBottom: i < folderMeetings.length - 1 ? `1px solid ${colors.border}` : 'none', transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = colors.inputBg}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: m.status === 'done' ? 'rgba(16,185,129,0.12)' : 'rgba(91,141,238,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {m.status === 'done' ? <CheckCircle size={15} color="#34d399"/> : <Clock size={15} color="#7aa7f5"/>}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ color: colors.textPrimary, fontWeight: 600, fontSize: 13, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.title}</p>
                  <p style={{ color: colors.textSecondary, fontSize: 11, margin: '2px 0 0' }}>
                    {m.created_at ? new Date(m.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                    {m.duration_seconds > 0 ? ` · ${fmt(m.duration_seconds)}` : ''}
                  </p>
                </div>
                <span style={{ background: m.status === 'done' ? 'rgba(16,185,129,0.15)' : 'rgba(91,141,238,0.15)', color: m.status === 'done' ? '#34d399' : '#7aa7f5', borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 600, flexShrink: 0 }}>
                  {m.status === 'done' ? 'Processed' : m.status}
                </span>
                <button onClick={() => onRemoveMeeting(m.id)} style={{ background: 'rgba(239,68,68,0.1)', border: 'none', borderRadius: 6, width: 28, height: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <X size={12} color="#f87171"/>
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────
export default function ProjectsPage() {
  const { user }   = useAuth()
  const { colors } = useTheme()
  const [meetings, setMeetings]               = useState([])
  const [projects, setProjects]               = useState(loadProjects)
  const [showFolderModal, setShowFolderModal] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [editingProject, setEditingProject]   = useState(null)

  useEffect(() => {
    if (!user?.id) return
    api.get('/meetings/', { params: { user_id: user.id } })
      .then(r => { if (r.data?.length) setMeetings(r.data) })
      .catch(() => {})
  }, [user])

  useEffect(() => { saveProjects(projects) }, [projects])

  const handleCreateFolder = ({ name, color }) => {
    const newProject = { id: Date.now().toString(), name, color, meetingIds: [], createdAt: new Date().toISOString() }
    setProjects(p => [...p, newProject])
    setShowFolderModal(false)
    toast.success(`Folder "${name}" created!`)
  }

  const handleEditFolder = ({ name, color }) => {
    setProjects(p => p.map(proj => proj.id === editingProject.id ? { ...proj, name, color } : proj))
    setEditingProject(null)
    toast.success('Folder updated!')
  }

  const handleDeleteFolder = (projectId) => {
    const project = projects.find(p => p.id === projectId)
    setProjects(p => p.filter(proj => proj.id !== projectId))
    toast.success(`Folder "${project?.name}" deleted`)
  }

  const handleAssignMeeting = (meetingId, projectId) => {
    setProjects(p => p.map(proj => {
      if (proj.id !== projectId) return proj
      const ids = proj.meetingIds || []
      if (ids.includes(String(meetingId))) { toast.error('Meeting already in this folder'); return proj }
      return { ...proj, meetingIds: [...ids, String(meetingId)] }
    }))
    setShowAssignModal(false)
    toast.success('Meeting added to folder!')
  }

  const handleRemoveMeeting = (projectId, meetingId) => {
    setProjects(p => p.map(proj =>
      proj.id === projectId
        ? { ...proj, meetingIds: proj.meetingIds.filter(id => id !== String(meetingId)) }
        : proj
    ))
    toast.success('Meeting removed from folder')
  }

  const card = { background: colors.cardBg, borderRadius: 16, border: `1px solid ${colors.border}`, padding: 24, transition: 'background 0.3s' }
  const totalMeetingsAssigned = projects.reduce((acc, p) => acc + (p.meetingIds?.length || 0), 0)
  const unassigned = meetings.filter(m => !projects.some(p => p.meetingIds?.includes(String(m.id))))

  return (
    <UserLayout title="Projects" subtitle="Organise your meetings into folders">

      {showFolderModal && <FolderModal onSave={handleCreateFolder} onClose={() => setShowFolderModal(false)}/>}
      {editingProject  && <FolderModal existing={editingProject} onSave={handleEditFolder} onClose={() => setEditingProject(null)}/>}
      {showAssignModal && <AssignModal meetings={meetings} projects={projects} onAssign={handleAssignMeeting} onClose={() => setShowAssignModal(false)}/>}

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total Folders',  value: projects.length,       color: '#7aa7f5', bg: 'rgba(91,141,238,0.1)',  icon: Folder },
          { label: 'Total Meetings', value: meetings.length,       color: '#34d399', bg: 'rgba(16,185,129,0.1)',  icon: FileText },
          { label: 'Assigned',       value: totalMeetingsAssigned, color: '#fbbf24', bg: 'rgba(245,158,11,0.1)',  icon: CheckCircle },
          { label: 'Unassigned',     value: unassigned.length,     color: '#f87171', bg: 'rgba(239,68,68,0.1)',   icon: Clock },
        ].map(({ label, value, color, bg, icon: Icon }) => (
          <div key={label} style={{ ...card, display: 'flex', alignItems: 'center', gap: 14, padding: '18px 20px' }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon size={20} color={color}/>
            </div>
            <div>
              <p style={{ color, fontSize: 26, fontWeight: 700, margin: 0 }}>{value}</p>
              <p style={{ color: colors.textSecondary, fontSize: 12, margin: 0 }}>{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        <button onClick={() => setShowFolderModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 22px', background: 'linear-gradient(90deg,#5b8dee,#a78bfa)', border: 'none', borderRadius: 10, color: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: 'Inter, sans-serif', boxShadow: '0 4px 14px rgba(91,141,238,0.3)' }}>
          <Plus size={16}/> New Folder
        </button>
        {projects.length > 0 && meetings.length > 0 && (
          <button onClick={() => setShowAssignModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 22px', background: colors.inputBg, border: `1px solid ${colors.borderInput}`, borderRadius: 10, color: '#7aa7f5', fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
            <FileText size={16}/> Add Meeting to Folder
          </button>
        )}
      </div>

      {/* Folders */}
      {projects.length === 0 ? (
        <div style={{ ...card, textAlign: 'center', padding: '64px 24px' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(91,141,238,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <FolderOpen size={32} color="#5b8dee"/>
          </div>
          <p style={{ color: colors.textPrimary, fontSize: 18, fontWeight: 700, margin: '0 0 8px' }}>No folders yet</p>
          <p style={{ color: colors.textSecondary, fontSize: 14, margin: '0 0 24px' }}>
            Create folders to organise your meetings — e.g. "Client Meetings", "Team Standups", "Sprint Reviews"
          </p>
          <button onClick={() => setShowFolderModal(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 28px', background: 'linear-gradient(90deg,#5b8dee,#a78bfa)', border: 'none', borderRadius: 10, color: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
            <Plus size={16}/> Create your first folder
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {projects.map(project => (
            <FolderCard
              key={project.id}
              project={project}
              meetings={meetings}
              colors={colors}
              onDelete={() => handleDeleteFolder(project.id)}
              onEdit={() => setEditingProject(project)}
              onRemoveMeeting={(meetingId) => handleRemoveMeeting(project.id, meetingId)}
            />
          ))}

          {/* Unassigned meetings */}
          {unassigned.length > 0 && (
            <div style={{ ...card, opacity: 0.85 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <AlertCircle size={16} color={colors.textMuted}/>
                <h3 style={{ color: colors.textSecondary, fontWeight: 600, fontSize: 14, margin: 0 }}>
                  Unassigned Meetings ({unassigned.length})
                </h3>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {unassigned.map(m => (
                  <span key={m.id} style={{ background: colors.inputBg, border: `1px solid ${colors.border}`, color: colors.textSecondary, borderRadius: 20, padding: '5px 14px', fontSize: 12, fontWeight: 500 }}>
                    {m.title}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </UserLayout>
  )
}