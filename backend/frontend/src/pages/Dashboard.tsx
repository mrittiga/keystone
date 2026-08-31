import { useEffect, useState } from 'react'
import { useAuthStore } from '../store/authStore'
import apiClient from '../services/api'
import type { DashboardSummary, WorkOrder } from '../types'
import Spinner from '../components/Spinner'
import { PriorityBadge } from '../components/Badge'
import NotificationBell from '../components/NotificationBell'

interface Props { onSelectOrder: (id: number) => void }

function SlaRing({ pct }: { pct: number }) {
  const r = 54, c = 2 * Math.PI * r, dash = (pct / 100) * c
  const color = pct >= 80 ? '#10b981' : pct >= 60 ? '#f59e0b' : '#ef4444'
  return (
    <div style={{ position: 'relative', width: 140, height: 140, margin: '10px auto' }}>
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="12"/>
        <circle cx="70" cy="70" r={r} fill="none" stroke={color} strokeWidth="12"
          strokeDasharray={`${dash} ${c}`} strokeLinecap="round"
          transform="rotate(-90 70 70)"
          style={{ filter:`drop-shadow(0 0 10px ${color})`, transition:'stroke-dasharray 1s ease' }}/>
      </svg>
      <div style={{
        position: 'absolute', inset: 0, display: 'flex',
        flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ fontSize: 26, fontWeight: 900, color }}>{pct}%</div>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase' }}>SLA Met</div>
      </div>
    </div>
  )
}

export default function Dashboard({ onSelectOrder }: Props) {
  const { user }            = useAuthStore()
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [overdue, setOverdue] = useState<WorkOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState('')

  useEffect(() => {
    if (user?.role === 'TECHNICIAN' || user?.role === 'CUSTOMER') { setLoading(false); return }
    async function fetch() {
      try {
        const [s, o] = await Promise.all([
          apiClient.get<DashboardSummary>('/reports/summary'),
          apiClient.get<WorkOrder[]>('/reports/overdue'),
        ])
        setSummary(s.data); setOverdue(o.data); setError('')
      } catch (e: any) { setError('Failed to load dashboard.') }
      finally { setLoading(false) }
    }
    fetch()
    const iv = setInterval(fetch, 30000)
    return () => clearInterval(iv)
  }, [user])

  if (loading) return <Spinner />

  if (user?.role === 'TECHNICIAN') return (
    <div className="page">
      <h1 className="page-title">Welcome, {user.name} 👋</h1>
      <p className="page-subtitle">Go to My Jobs to see your assigned work orders</p>
      <div className="glass" style={{ padding: 40, textAlign: 'center', marginTop: 20 }}>
        <div style={{ fontSize: 60, marginBottom: 16 }}>🛠️</div>
        <p style={{ color: 'var(--text-muted)' }}>Your assigned jobs are waiting in the My Jobs section</p>
      </div>
    </div>
  )

  if (user?.role === 'CUSTOMER') return (
    <div className="page">
      <h1 className="page-title">Welcome, {user.name} 👋</h1>
      <p className="page-subtitle">Go to My Requests to track your service requests</p>
    </div>
  )

  const bars = summary ? [
    { l:'New',        v: summary.newOrders,       c:'#3b82f6' },
    { l:'Assigned',   v: summary.assignedOrders,  c:'#8b5cf6' },
    { l:'In Progress',v: summary.inProgressOrders,c:'#f59e0b' },
    { l:'On Hold',    v: summary.onHoldOrders,    c:'#ef4444' },
    { l:'Completed',  v: summary.completedOrders, c:'#10b981' },
    { l:'Closed',     v: summary.closedOrders,    c:'#64748b' },
  ] : []

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Operations Dashboard</h1>
          <p className="page-subtitle">Live overview — auto-refreshes every 30 seconds</p>
        </div>
        <NotificationBell />
      </div>

      {error && <div className="alert alert-error">⚠️ {error}</div>}

      {summary && (
        <>
          <div className="stats-grid">
            {[
              { l:'New',        v: summary.newOrders,       i:'🆕', c:'blue'   },
              { l:'Assigned',   v: summary.assignedOrders,  i:'👤', c:'purple' },
              { l:'In Progress',v: summary.inProgressOrders,i:'⚡', c:'amber'  },
              { l:'Completed',  v: summary.completedOrders, i:'✅', c:'green'  },
              { l:'Overdue',    v: summary.overdueCount,    i:'🚨', c:'red'    },
              { l:'SLA Breaches',v:summary.slaBreachCount,  i:'⚠️', c:'red'   },
            ].map(s => (
              <div key={s.l} className={`stat-card glass ${s.c}`}>
                <span className="stat-icon">{s.i}</span>
                <div className="stat-value">{s.v}</div>
                <div className="stat-label">{s.l}</div>
              </div>
            ))}
          </div>

          <div className="grid-3" style={{ marginBottom: 20 }}>
            <div className="glass" style={{ padding: 22, display:'flex', flexDirection:'column', alignItems:'center' }}>
              <h3 style={{ marginBottom: 4 }}>SLA Compliance</h3>
              <SlaRing pct={Math.round(summary.slaCompliancePercent)} />
              {summary.slaBreachCount > 0 && (
                <p style={{ color:'#f87171', fontSize:12, fontWeight:600 }}>
                  ⚠ {summary.slaBreachCount} active breach{summary.slaBreachCount > 1 ? 'es' : ''}
                </p>
              )}
            </div>

            <div className="glass" style={{ padding: 22 }}>
              <h3 style={{ marginBottom: 16 }}>Status Breakdown</h3>
              {bars.map(b => {
                const pct = summary.totalOrders > 0
                  ? Math.round(b.v / summary.totalOrders * 100) : 0
                return (
                  <div key={b.l} style={{ marginBottom: 12 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, marginBottom:5 }}>
                      <span style={{ color:'var(--text-secondary)' }}>{b.l}</span>
                      <strong style={{ color:'var(--text-primary)' }}>{b.v} ({pct}%)</strong>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill"
                        style={{ width:`${pct}%`, background:b.c, boxShadow:`0 0 8px ${b.c}60` }} />
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="glass" style={{ padding: 22 }}>
              <h3 style={{ marginBottom: 14 }}>
                ⚠ Overdue
                {overdue.length > 0 && (
                  <span className="badge badge-danger" style={{ marginLeft: 8, fontSize: 10 }}>
                    {overdue.length}
                  </span>
                )}
              </h3>
              {overdue.length === 0
                ? <p style={{ color:'var(--success)', fontSize:13, padding:'20px 0', textAlign:'center' }}>
                    ✓ No overdue orders
                  </p>
                : overdue.slice(0, 5).map(o => (
                  <div key={o.id} style={{
                    padding:'9px 0', borderBottom:'1px solid rgba(255,255,255,0.05)', cursor:'pointer',
                  }} onClick={() => onSelectOrder(o.id)}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
                      <span style={{ color:'#a78bfa', fontWeight:700, fontSize:11 }}>{o.code}</span>
                      <PriorityBadge priority={o.priority} />
                    </div>
                    <div style={{ fontSize:12, color:'var(--text-secondary)' }}>{o.title}</div>
                  </div>
                ))
              }
            </div>
          </div>
        </>
      )}
    </div>
  )
}
