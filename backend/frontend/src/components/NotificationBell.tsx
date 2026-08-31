import { useEffect, useState } from 'react'
import apiClient from '../services/api'

export default function NotificationBell() {
  const [count, setCount] = useState(0)
  const [open, setOpen]   = useState(false)
  const [items, setItems] = useState<any[]>([])

  useEffect(() => {
    check()
    const iv = setInterval(check, 60000)
    return () => clearInterval(iv)
  }, [])

  async function check() {
    try {
      const res = await apiClient.get<any[]>('/reports/sla-status')
      const list = Array.isArray(res.data) ? res.data : []
      setCount(list.length)
      setItems(list.slice(0, 6))
    } catch { setCount(0) }
  }

  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => setOpen(o => !o)} title="Notifications" style={{
        position: 'relative', background: 'rgba(255,255,255,0.07)',
        border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10,
        width: 38, height: 38, display: 'flex', alignItems: 'center',
        justifyContent: 'center', cursor: 'pointer', fontSize: 17,
        color: 'white', transition: 'all 0.2s',
      }}
        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.14)'}
        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.07)'}
      >
        🔔
        {count > 0 && (
          <span style={{
            position: 'absolute', top: -5, right: -5,
            background: '#ef4444', color: 'white',
            borderRadius: '50%', width: 18, height: 18,
            fontSize: 10, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 8px rgba(239,68,68,0.6)',
            animation: 'pulse 2s infinite',
          }}>{count > 9 ? '9+' : count}</span>
        )}
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 46, right: 0, width: 290,
          background: 'rgba(26,16,64,0.98)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 14, padding: 16,
          backdropFilter: 'blur(30px)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
          zIndex: 1000,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontWeight: 700, fontSize: 13, color: '#f1f5f9' }}>🔔 SLA Alerts</span>
            <button onClick={() => setOpen(false)} style={{
              background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: 15,
            }}>✕</button>
          </div>
          {items.length === 0
            ? <p style={{ color: '#10b981', fontSize: 12, textAlign: 'center', padding: '12px 0' }}>
                ✓ All SLAs on track
              </p>
            : items.map((o: any) => (
              <div key={o.id} style={{
                padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.06)',
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#a78bfa' }}>{o.code}</div>
                <div style={{ fontSize: 12, color: '#e2e8f0', marginTop: 2 }}>{o.title}</div>
                <div style={{ fontSize: 10, color: '#f87171', marginTop: 2, fontWeight: 600 }}>
                  ⚠ SLA BREACHED — {o.priority}
                </div>
              </div>
            ))
          }
        </div>
      )}
    </div>
  )
}
