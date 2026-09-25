import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

interface Props { dark: boolean; onToggleTheme: () => void }

const notifications = [
  { id: 1, title: 'SLA watch', text: 'A work order needs attention today.', time: 'Now' },
  { id: 2, title: 'System update', text: 'Your workspace is synced.', time: '5m' },
]

export default function HeaderNav({ dark, onToggleTheme }: Props) {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [menu, setMenu] = useState<'notifications' | 'profile' | null>(null)
  const [unread, setUnread] = useState(2)

  useEffect(() => {
    function close() { setMenu(null) }
    window.addEventListener('click', close)
    return () => window.removeEventListener('click', close)
  }, [])

  function signOut() { logout(); navigate('/login') }

  return (
    <header style={{
      display:'flex', alignItems:'center', justifyContent:'flex-end', gap:10,
      minHeight:48, marginBottom:22, position:'relative', zIndex:20,
    }}>
      <span style={{ marginRight:'auto', color:'var(--text-muted)', fontSize:12, letterSpacing:.4 }}>
        {new Date().toLocaleDateString(undefined, { weekday:'long', month:'short', day:'numeric' })}
      </span>
      <button className="btn btn-secondary btn-sm" title="Toggle theme" onClick={onToggleTheme}>
        {dark ? '☀️ Light' : '🌙 Dark'}
      </button>
      <div style={{ position:'relative' }}>
        <button className="btn btn-secondary btn-sm" title="Notifications" onClick={e => { e.stopPropagation(); setMenu(menu === 'notifications' ? null : 'notifications'); setUnread(0) }}>
          🔔 {unread > 0 && <span style={{ background:'#ef4444', color:'#fff', borderRadius:99, padding:'1px 6px', fontSize:10 }}>{unread}</span>}
        </button>
        {menu === 'notifications' && (
          <div className="glass-strong" onClick={e => e.stopPropagation()} style={{ position:'absolute', right:0, top:44, width:290, padding:14 }}>
            <strong style={{ display:'block', marginBottom:10 }}>Notifications</strong>
            {notifications.map(n => <div key={n.id} style={{ padding:'10px 0', borderTop:'1px solid rgba(255,255,255,.08)' }}>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, fontWeight:700 }}><span>{n.title}</span><span style={{ color:'var(--text-muted)', fontWeight:400 }}>{n.time}</span></div>
              <div style={{ color:'var(--text-muted)', fontSize:12 }}>{n.text}</div>
            </div>)}
          </div>
        )}
      </div>
      <div style={{ position:'relative' }}>
        <button className="btn btn-secondary btn-sm" title="Profile menu" onClick={e => { e.stopPropagation(); setMenu(menu === 'profile' ? null : 'profile') }}>
          <span style={{ width:24, height:24, borderRadius:8, display:'inline-flex', alignItems:'center', justifyContent:'center', background:'linear-gradient(135deg,#7c3aed,#06b6d4)', color:'#fff', fontWeight:800 }}>{user?.name?.charAt(0) || '?'}</span>
          {user?.name?.split(' ')[0]}
        </button>
        {menu === 'profile' && (
          <div className="glass-strong" onClick={e => e.stopPropagation()} style={{ position:'absolute', right:0, top:44, width:190, padding:8 }}>
            <button className="header-menu-item">👤 View Profile</button>
            <button className="header-menu-item">⚙️ Settings</button>
            <button className="header-menu-item danger" onClick={signOut}>🚪 Logout</button>
          </div>
        )}
      </div>
    </header>
  )
}
