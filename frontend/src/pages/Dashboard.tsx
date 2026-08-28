import { useEffect, useState } from 'react'
import { useAuthStore } from '../store/authStore'
import apiClient from '../services/api'
import type { DashboardSummary, WorkOrder } from '../types'
import Spinner from '../components/Spinner'
import { StatusBadge, PriorityBadge } from '../components/Badge'

interface Props { onSelectOrder: (id: number) => void }

function SlaRing({ pct }: { pct: number }) {
  const r = 58
  const c = 2 * Math.PI * r
  const dash = (pct / 100) * c
  const color = pct >= 80 ? '#10b981' : pct >= 60 ? '#f59e0b' : '#ef4444'
  return (
    <div className="sla-ring-wrap">
      <svg width="150" height="150" viewBox="0 0 150 150">
        <circle cx="75" cy="75" r={r} fill="none"
          stroke="rgba(255,255,255,0.08)" strokeWidth="12"/>
        <circle cx="75" cy="75" r={r} fill="none"
          stroke={color} strokeWidth="12"
          strokeDasharray={`${dash} ${c}`}
          strokeLinecap="round"
          transform="rotate(-90 75 75)"
          style={{ filter: `drop-shadow(0 0 8px ${color})`, transition: 'stroke-dasharray 1s ease' }}/>
      </svg>
      <div style={{ position: 'absolute', textAlign: 'center' }}>
        <div style={{ fontSize: 30, fontWeight: 900, color }}>{pct}%</div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>SLA Met</div>
      </div>
    </div>
  )
}

export default function Dashboard({ onSelectOrder }: Props) {
  const { user } = useAuthStore()
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [overdue, setOverdue] = useState<WorkOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (user?.role === 'TECHNICIAN' || user?.role === 'CUSTOMER') {
      setLoading(false); return
    }
    Promise.all([
      apiClient.get<DashboardSummary>('/reports/summary'),
      apiClient.get<WorkOrder[]>('/reports/overdue'),
    ])
      .then(([s, o]) => { setSummary(s.data); setOverdue(o.data) })
      .catch(e => setError(e.response?.data?.message || 'Failed to load dashboard'))
      .finally(() => setLoading(false))
  }, [user])

  if (loading) return <Spinner />
  if (user?.role === 'TECHNICIAN') return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Welcome, {user.name} 👋</h1>
          <p className="page-subtitle">Go to My Jobs to see your assigned work orders</p>
        </div>
      </div>
      <div className="glass" style={{ padding: 30, textAlign: 'center' }}>
        <div style={{ fontSize: 60, marginBottom: 16 }}>🛠️</div>
        <h3 style={{ marginBottom: 8 }}>Ready to work?</h3>
        <p style={{ color: 'var(--text-muted)' }}>Your assigned jobs are waiting in the My Jobs section</p>
      </div>
    </div>
  )

  if (user?.role === 'CUSTOMER') return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Welcome, {user.name} 👋</h1>
          <p className="page-subtitle">Go to My Requests to track your service requests</p>
        </div>
      </div>
    </div>
  )

  const stats = summary ? [
    { label: 'New',         value: summary.newOrders,         icon: '🆕', cls: 'blue' },
    { label: 'Assigned',    value: summary.assignedOrders,    icon: '👤', cls: 'purple' },
    { label: 'In Progress', value: summary.inProgressOrders,  icon: '⚡', cls: 'amber' },
    { label: 'Completed',   value: summary.completedOrders,   icon: '✅', cls: 'green' },
    { label: 'Overdue',     value: summary.overdueCount,      icon: '🚨', cls: 'red' },
    { label: 'SLA Breaches',value: summary.slaBreachCount,    icon: '⚠️', cls: 'red' },
  ] : []

  const bars = summary ? [
    { label: 'New',         val: summary.newOrders,       color: '#3b82f6' },
    { label: 'Assigned',    val: summary.assignedOrders,  color: '#8b5cf6' },
    { label: 'In Progress', val: summary.inProgressOrders,color: '#f59e0b' },
    { label: 'On Hold',     val: summary.onHoldOrders,    color: '#ef4444' },
    { label: 'Completed',   val: summary.completedOrders, color: '#10b981' },
    { label: 'Closed',      val: summary.closedOrders,    color: '#64748b' },
  ] : []

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Operations Dashboard</h1>
          <p className="page-subtitle">Live overview of your field service operation</p>
        </div>
      </div>

      {error && <div className="alert alert-error">⚠️ {error}</div>}

      {summary && (
        <>
          <div className="stats-grid">
            {stats.map(s => (
              <div key={s.label} className={`stat-card glass ${s.cls}`}>
                <span className="stat-icon">{s.icon}</span>
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="grid-3" style={{ marginBottom: 24 }}>
            {/* SLA Ring */}
            <div className="glass" style={{ padding: 24, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <h3 style={{ marginBottom: 8, alignSelf: 'flex-start' }}>SLA Compliance</h3>
              <SlaRing pct={Math.round(summary.slaCompliancePercent)} />
              {summary.slaBreachCount > 0 && (
                <p style={{ color: '#f87171', fontSize: 12, fontWeight: 600, marginTop: 8 }}>
                  ⚠ {summary.slaBreachCount} active breach{summary.slaBreachCount > 1 ? 'es' : ''}
                </p>
              )}
            </div>

            {/* Status bars */}
            <div className="glass" style={{ padding: 24 }}>
              <h3 style={{ marginBottom: 16 }}>Status Breakdown</h3>
              {bars.map(b => {
                const pct = summary.totalOrders > 0
                  ? Math.round(b.val / summary.totalOrders * 100) : 0
                return (
                  <div key={b.label} style={{ marginBottom: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 12 }}>
                      <span style={{ color: 'var(--text-secondary)' }}>{b.label}</span>
                      <strong style={{ color: 'var(--text-primary)' }}>{b.val}</strong>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill"
                        style={{ width: `${pct}%`, background: b.color,
                          boxShadow: `0 0 8px ${b.color}60` }} />
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Overdue */}
            <div className="glass" style={{ padding: 24 }}>
              <h3 style={{ marginBottom: 14 }}>
                ⚠ Overdue
                {overdue.length > 0 && (
                  <span className="badge badge-danger" style={{ marginLeft: 8, fontSize: 10 }}>
                    {overdue.length}
                  </span>
                )}
              </h3>
              {overdue.length === 0
                ? <p style={{ color: 'var(--text-muted)', fontSize: 13, padding: '20px 0' }}>
                    ✓ No overdue orders
                  </p>
                : overdue.slice(0, 5).map(o => (
                  <div key={o.id} style={{
                    padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)',
                    cursor: 'pointer'
                  }} onClick={() => onSelectOrder(o.id)}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                      <span style={{ color: '#a78bfa', fontWeight: 700, fontSize: 11 }}>{o.code}</span>
                      <PriorityBadge priority={o.priority} />
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{o.title}</div>
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
