import { type ReactNode, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import type { Role } from '../types'

interface MenuItem { key: string; label: string; icon: string }

const MENUS: Record<Role, MenuItem[]> = {
  MANAGER: [
    { key: 'dashboard',  label: 'Dashboard',     icon: '📊' },
    { key: 'workorders', label: 'Work Orders',   icon: '📋' },
    { key: 'dispatch',   label: 'Dispatch Board',icon: '🗂️' },
    { key: 'reports',    label: 'Reports',       icon: '📈' },
    { key: 'users',      label: 'Users',         icon: '👥' },
    { key: 'parts',      label: 'Parts',         icon: '🔧' },
  ],
  DISPATCHER: [
    { key: 'dashboard',  label: 'Dashboard',     icon: '📊' },
    { key: 'workorders', label: 'Work Orders',   icon: '📋' },
    { key: 'dispatch',   label: 'Dispatch Board',icon: '🗂️' },
    { key: 'parts',      label: 'Parts',         icon: '🔧' },
  ],
  TECHNICIAN: [
    { key: 'myjobs',     label: 'My Jobs',       icon: '🛠️' },
    { key: 'workorders', label: 'All Orders',    icon: '📋' },
  ],
  CUSTOMER: [
    { key: 'portal',     label: 'My Requests',   icon: '📬' },
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
  const [mini, setMini] = useState(false)
  const items = user?.role ? (MENUS[user.role] ?? []) : []
  const W = mini ? 58 : 228

  return (
    <div style={{
      display: 'flex', height: '100vh', overflow: 'hidden',
      background: 'linear-gradient(135deg,#0f0c29 0%,#1a1040 50%,#0d1b2a 100%)',
    }}>
      <div style={{
        position: 'fixed', width: 380, height: 380, borderRadius: '50%',
        background: 'radial-gradient(circle,rgba(124,58,237,0.35),transparent)',
        top: -90, left: -90, filter: 'blur(70px)', pointerEvents: 'none', zIndex: 0,
      }} />
      <div style={{
        position: 'fixed', width: 280, height: 280, borderRadius: '50%',
        background: 'radial-gradient(circle,rgba(6,182,212,0.25),transparent)',
        bottom: -50, right: -50, filter: 'blur(70px)', pointerEvents: 'none', zIndex: 0,
      }} />

      <nav style={{
        width: W, minWidth: W, maxWidth: W,
        height: '100vh', display: 'flex', flexDirection: 'column',
        padding: mini ? '14px 6px' : '16px 10px',
        borderRight: '1px solid rgba(255,255,255,0.08)',
        background: 'rgba(15,12,41,0.97)',
        backdropFilter: 'blur(30px)',
        overflowY: 'auto', overflowX: 'hidden',
        zIndex: 10, flexShrink: 0,
        transition: 'width 0.3s ease, min-width 0.3s ease',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: mini ? 'center' : 'space-between',
          gap: 8, paddingBottom: 16,
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          marginBottom: 14,
        }}>
          {!mini && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, overflow: 'hidden' }}>
              <div style={{
                width: 36, height: 36, borderRadius: 11, flexShrink: 0,
                background: 'linear-gradient(135deg,#7c3aed,#06b6d4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, boxShadow: '0 4px 14px rgba(124,58,237,0.45)',
              }}>⚙️</div>
              <div>
                <div style={{
                  fontSize: 14, fontWeight: 900, letterSpacing: 2,
                  background: 'linear-gradient(135deg,#fff,#a78bfa)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                }}>KEYSTONE</div>
                <div style={{ fontSize: 9, color: 'rgba(148,163,184,0.55)', textTransform: 'uppercase', letterSpacing: 1 }}>
                  Field Service
                </div>
              </div>
            </div>
          )}
          {mini && (
            <div style={{
              width: 36, height: 36, borderRadius: 11,
              background: 'linear-gradient(135deg,#7c3aed,#06b6d4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18,
            }}>⚙️</div>
          )}
          <button onClick={() => setMini(m => !m)} title={mini ? 'Expand' : 'Collapse'} style={{
            background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.11)',
            borderRadius: 7, color: 'rgba(255,255,255,0.55)',
            width: 24, height: 24, display: 'flex', alignItems: 'center',
            justifyContent: 'center', cursor: 'pointer', fontSize: 10, flexShrink: 0,
          }}>
            {mini ? '▶' : '◀'}
          </button>
        </div>

        {!mini && (
          <div style={{
            fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: 1.2, color: 'rgba(100,116,139,0.7)',
            padding: '0 6px', marginBottom: 8,
          }}>Navigation</div>
        )}

        <ul style={{ listStyle: 'none', flex: 1 }}>
          {items.map(item => {
            const active = currentPage === item.key || (currentPage === 'detail' && item.key === 'workorders')
            return (
              <li key={item.key} style={{ marginBottom: 2 }}>
                <button
                  onClick={() => setPage(item.key)}
                  title={mini ? item.label : undefined}
                  style={{
                    display: 'flex', alignItems: 'center',
                    gap: mini ? 0 : 10,
                    justifyContent: mini ? 'center' : 'flex-start',
                    width: '100%', padding: mini ? '11px 0' : '10px 10px',
                    borderRadius: 9, border: 'none',
                    background: active
                      ? 'linear-gradient(135deg,rgba(124,58,237,0.28),rgba(6,182,212,0.09))'
                      : 'transparent',
                    color: active ? '#a78bfa' : 'rgba(148,163,184,0.72)',
                    fontSize: 13, fontWeight: active ? 700 : 500,
                    fontFamily: 'inherit', cursor: 'pointer',
                    textAlign: 'left', transition: 'all 0.17s ease',
                    borderLeft: active ? '3px solid #7c3aed' : '3px solid transparent',
                    whiteSpace: 'nowrap', overflow: 'hidden',
                  }}
                  onMouseEnter={e => {
                    if (!active) {
                      const el = e.currentTarget as HTMLElement
                      el.style.background = 'rgba(124,58,237,0.11)'
                      el.style.color = '#e2e8f0'
                    }
                  }}
                  onMouseLeave={e => {
                    if (!active) {
                      const el = e.currentTarget as HTMLElement
                      el.style.background = 'transparent'
                      el.style.color = 'rgba(148,163,184,0.72)'
                    }
                  }}
                >
                  <span style={{ fontSize: 17, minWidth: 20, textAlign: 'center', flexShrink: 0 }}>
                    {item.icon}
                  </span>
                  {!mini && item.label}
                </button>
              </li>
            )
          })}
        </ul>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 12, marginTop: 10 }}>
          {!mini && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 9,
              padding: '9px 10px', borderRadius: 9, marginBottom: 9,
              background: 'rgba(255,255,255,0.04)',
            }}>
              <div style={{
                width: 32, height: 32, minWidth: 32, borderRadius: 8,
                background: 'linear-gradient(135deg,#7c3aed,#06b6d4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 800, color: 'white', flexShrink: 0,
              }}>{user?.name.charAt(0)}</div>
              <div style={{ overflow: 'hidden', flex: 1 }}>
                <div style={{
                  fontSize: 12, fontWeight: 600, color: '#f1f5f9',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>{user?.name}</div>
                <div style={{ fontSize: 9, color: 'rgba(100,116,139,0.75)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  {user?.role}
                </div>
              </div>
            </div>
          )}
          {mini && (
            <div style={{
              width: 32, height: 32, borderRadius: 8, margin: '0 auto 9px',
              background: 'linear-gradient(135deg,#7c3aed,#06b6d4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 800, color: 'white',
            }}>{user?.name.charAt(0)}</div>
          )}
          <button
            onClick={() => { logout(); navigate('/login') }}
            title="Sign Out"
            style={{
              width: '100%', padding: mini ? '9px 0' : '8px 10px',
              background: 'rgba(239,68,68,0.09)',
              border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: 8, color: '#f87171',
              fontSize: 12, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer',
              transition: 'all 0.17s ease', display: 'flex',
              alignItems: 'center', justifyContent: 'center', gap: 5,
            }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.18)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.09)'}
          >
            <span>🚪</span>{!mini && 'Sign Out'}
          </button>
        </div>
      </nav>

      <main style={{
        flex: 1, overflowY: 'auto', overflowX: 'hidden',
        padding: '24px 18px', position: 'relative', zIndex: 1,
      }}>
        {children}
      </main>
    </div>
  )
}
