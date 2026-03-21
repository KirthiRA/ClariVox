export function StatCard({ label, value, sub, icon: Icon, gradient }) {
  return (
    <div style={{ background:gradient, borderRadius:16, padding:'20px 22px', display:'flex', alignItems:'center', gap:16, border:'1px solid rgba(255,255,255,0.05)', minHeight:106 }}>
      <div style={{ width:50, height:50, borderRadius:14, background:'rgba(255,255,255,0.12)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
        <Icon size={24} color="#fff"/>
      </div>
      <div>
        <p style={{ color:'rgba(255,255,255,0.6)', fontSize:13, margin:0 }}>{label}</p>
        <p style={{ color:'#fff', fontSize:32, fontWeight:700, margin:'2px 0 0', lineHeight:1.1 }}>{value}</p>
        {sub && <p style={{ color:'rgba(255,255,255,0.5)', fontSize:12, margin:'4px 0 0' }}>{sub}</p>}
      </div>
    </div>
  )
}

export function Badge({ status }) {
  const m = {
    Completed:  { bg:'rgba(16,185,129,0.16)',  color:'#34d399', dot:'#10b981' },
    Processing: { bg:'rgba(245,158,11,0.16)',  color:'#fbbf24', dot:'#f59e0b' },
    Failed:     { bg:'rgba(239,68,68,0.16)',   color:'#f87171', dot:'#ef4444' },
    Pending:    { bg:'rgba(91,141,238,0.16)',  color:'#7aa7f5', dot:'#5b8dee' },
    Processed:  { bg:'rgba(16,185,129,0.16)',  color:'#34d399', dot:'#10b981' },
  }
  const s = m[status] || m.Pending
  return (
    <span style={{ background:s.bg, color:s.color, borderRadius:20, padding:'5px 13px', fontSize:12, fontWeight:600, display:'inline-flex', alignItems:'center', gap:6 }}>
      <span style={{ width:7, height:7, borderRadius:'50%', background:s.dot, flexShrink:0, animation:status==='Processing'?'pulse 1.5s infinite':'none' }}/>
      {status}
    </span>
  )
}
