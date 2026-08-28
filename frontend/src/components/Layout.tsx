import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import type { Role } from '../types'

interface MenuItem { key: string; label: string; icon: string }

const MENUS: Record<Role, MenuItem[]> = {
  MANAGER:    [
    { key:'dashboard',  label:'Dashboard',     icon:'📊' },
    { key:'workorders', label:'Work Orders',   icon:'📋' },
    { key:'dispatch',   label:'Dispatch Board',icon:'🗂️' },
    { key:'reports',    label:'Reports',       icon:'📈' },
    { key:'users',      label:'Users',         icon:'👥' },
    { key:'parts',      label:'Parts',         icon:'🔧' },
  ],
  DISPATCHER: [
    { key:'dashboard',  label:'Dashboard',     icon:'📊' },
    { key:'workorders', label:'Work Orders',   icon:'📋' },
    { key:'dispatch',   label:'Dispatch Board',icon:'🗂️' },
    { key:'parts',      label:'Parts',         icon:'🔧' },
  ],
  TECHNICIAN: [
    { key:'myjobs',     label:'My Jobs',       icon:'🛠️' },
    { key:'workorders', label:'All Orders',    icon:'📋' },
  ],
  CUSTOMER:   [
    { key:'portal',     label:'My Requests',   icon:'📬' },
  ],
}

interface Props {
  currentPage: string
  setPage: (p: string) => void
  onSelectOrder: (id: number) => void
  children: ReactNode
}

export default function Layout({ currentPage, setPage, children }: Props) {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const items = user?.role ? MENUS[user.role] ?? [] : []

  return (
    <div className="layout">
      <div className="app-bg" />
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <nav className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">⚙️</div>
          <div className="sidebar-logo-text">
            <h1>KEYSTONE</h1>
            <p>Field Service Platform</p>
          </div>
        </div>

        <p className="sidebar-section-label">Navigation</p>
        <ul className="sidebar-menu">
          {items.map(item => (
            <li key={item.key}>
              <button
                className={`menu-btn ${currentPage === item.key ? 'active' : ''}`}
                onClick={() => setPage(item.key)}>
                <span className="menu-icon">{item.icon}</span>
                {item.label}
              </button>
            </li>
          ))}
        </ul>

        <div className="sidebar-footer">
          <div className="user-chip">
            <div className="user-avatar">{user?.name.charAt(0)}</div>
            <div>
              <div className="user-name">{user?.name}</div>
              <div className="user-role">{user?.role}</div>
            </div>
          </div>
          <button className="logout-btn" onClick={() => { logout(); navigate('/login') }}>
            🚪 Sign Out
          </button>
        </div>
      </nav>

      <main className="main-content">
        {children}
      </main>
    </div>
  )
}
