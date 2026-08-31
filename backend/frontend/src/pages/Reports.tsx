import { useEffect, useState } from 'react'
import apiClient from '../services/api'
import type { DashboardSummary, WorkOrder } from '../types'
import Spinner from '../components/Spinner'
import { PriorityBadge } from '../components/Badge'
import Toast from '../components/Toast'

export default function Reports() {
  const [summary, setSummary]   = useState<DashboardSummary | null>(null)
  const [overdue, setOverdue]   = useState<WorkOrder[]>([])
  const [breaches, setBreaches] = useState<WorkOrder[]>([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')
  const [toast, setToast]       = useState<{msg:string;type:'success'|'error'}|null>(null)

  useEffect(() => {
    Promise.all([
      apiClient.get<DashboardSummary>('/reports/summary'),
      apiClient.get<WorkOrder[]>('/reports/overdue'),
      apiClient.get<WorkOrder[]>('/reports/sla-status'),
    ])
      .then(([s, o, b]) => { setSummary(s.data); setOverdue(o.data); setBreaches(b.data) })
      .catch(() => setError('Failed to load reports.'))
      .finally(() => setLoading(false))
  }, [])

  function exportCSV(data: any[], filename: string) {
    if (!data || data.length === 0) {
      setToast({ msg: 'No data to export.', type: 'error' })
      return
    }
    const headers = ['Code','Title','Priority','Status','SLA Due','Assigned To']
    const rows = data.map((o: any) => [
      o.code ?? '', o.title ?? '', o.priority ?? '', o.status ?? '',
      o.slaDueDate ? new Date(o.slaDueDate).toLocaleString() : 'N/A',
      o.assignedToName ?? 'Unassigned',
    ])
    const csv = [headers, ...rows].map(r => r.map((v: any) => `"${v}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url
    a.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    setToast({ msg: `Exported ${data.length} records to ${filename}.csv`, type: 'success' })
  }

  if (loading) return <Spinner />

  function SlaRing({ pct }: { pct: number }) {
    const r = 52, c = 2 * Math.PI * r, dash = (pct / 100) * c
    const color = pct >= 80 ? '#10b981' : pct >= 60 ? '#f59e0b' : '#ef4444'
    return (
      <div style={{ position:'relative', width:140, height:140, margin:'10px auto' }}>
        <svg width="140" height="140" viewBox="0 0 140 140">
          <circle cx="70" cy="70" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="12"/>
          <circle cx="70" cy="70" r={r} fill="none" stroke={color} strokeWidth="12"
            strokeDasharray={`${dash} ${c}`} strokeLinecap="round"
            transform="rotate(-90 70 70)"
            style={{ filter:`drop-shadow(0 0 10px ${color})` }}/>
        </svg>
        <div style={{
          position:'absolute', inset:0, display:'flex',
          flexDirection:'column', alignItems:'center', justifyContent:'center',
        }}>
          <div style={{ fontSize:24, fontWeight:900, color }}>{pct}%</div>
          <div style={{ fontSize:10, color:'var(--text-muted)', textTransform:'uppercase' }}>SLA Met</div>
        </div>
      </div>
    )
  }

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
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      <div className="page-header">
        <div>
          <h1 className="page-title">Reports & Analytics 📈</h1>
          <p className="page-subtitle">Operational performance overview</p>
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <button className="btn btn-secondary btn-sm"
            onClick={() => exportCSV(overdue, 'overdue-orders')}>
            📥 Export Overdue CSV
          </button>
          <button className="btn btn-secondary btn-sm"
            onClick={() => exportCSV(breaches, 'sla-breaches')}>
            📥 Export Breaches CSV
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error">⚠️ {error}</div>}

      {summary && (
        <>
          <div className="stats-grid">
            {[
              { l:'Total Orders',   v: summary.totalOrders,           i:'📊', c:'purple' },
              { l:'SLA Compliance', v:`${Math.round(summary.slaCompliancePercent)}%`, i:'🎯', c: summary.slaCompliancePercent>=80?'green':'red' },
              { l:'Overdue',        v: summary.overdueCount,          i:'🚨', c:'red'    },
              { l:'SLA Breaches',   v: summary.slaBreachCount,        i:'⚠️', c:'red'   },
              { l:'Completed',      v: summary.completedOrders,       i:'✅', c:'green'  },
              { l:'Closed',         v: summary.closedOrders,          i:'🔒', c:'cyan'   },
            ].map(s => (
              <div key={s.l} className={`stat-card glass ${s.c}`}>
                <span className="stat-icon">{s.i}</span>
                <div className="stat-value">{s.v}</div>
                <div className="stat-label">{s.l}</div>
              </div>
            ))}
          </div>

          <div className="grid-2" style={{ marginBottom: 20 }}>
            <div className="glass" style={{ padding: 22 }}>
              <h3 style={{ marginBottom: 16 }}>📊 Status Breakdown</h3>
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

            <div className="glass" style={{ padding: 22, textAlign:'center' }}>
              <h3 style={{ marginBottom: 8 }}>🎯 SLA Performance</h3>
              <SlaRing pct={Math.round(summary.slaCompliancePercent)} />
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginTop:16 }}>
                <div style={{ background:'rgba(16,185,129,0.1)', borderRadius:10, padding:12 }}>
                  <div style={{ fontSize:22, fontWeight:800, color:'#34d399' }}>{summary.closedOrders}</div>
                  <div style={{ fontSize:11, color:'var(--text-muted)' }}>Met SLA</div>
                </div>
                <div style={{ background:'rgba(239,68,68,0.1)', borderRadius:10, padding:12 }}>
                  <div style={{ fontSize:22, fontWeight:800, color:'#f87171' }}>{summary.slaBreachCount}</div>
                  <div style={{ fontSize:11, color:'var(--text-muted)' }}>Breached</div>
                </div>
              </div>
            </div>
          </div>

          {overdue.length > 0 && (
            <div className="glass" style={{ padding: 22, marginBottom: 16 }}>
              <h3 style={{ marginBottom: 14 }}>
                🚨 Overdue Work Orders
                <span className="badge badge-danger" style={{ marginLeft:8 }}>{overdue.length}</span>
              </h3>
              <table className="table">
                <thead>
                  <tr><th>Code</th><th>Title</th><th>Priority</th><th>SLA Due</th><th>Assigned</th></tr>
                </thead>
                <tbody>
                  {overdue.map((o: any) => (
                    <tr key={o.id}>
                      <td style={{ color:'#a78bfa', fontWeight:700 }}>{o.code}</td>
                      <td>{o.title}</td>
                      <td><PriorityBadge priority={o.priority} /></td>
                      <td style={{ color:'#f87171', fontSize:12 }}>
                        {o.slaDueDate ? new Date(o.slaDueDate).toLocaleString() : '—'}
                      </td>
                      <td>{o.assignedToName ?? 'Unassigned'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {overdue.length === 0 && breaches.length === 0 && (
            <div className="glass" style={{ padding:50, textAlign:'center' }}>
              <div style={{ fontSize:50, marginBottom:14 }}>🎉</div>
              <h3 style={{ color:'#34d399', marginBottom:8 }}>All SLAs on track!</h3>
              <p style={{ color:'var(--text-muted)', fontSize:13 }}>No overdue or breached work orders</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
