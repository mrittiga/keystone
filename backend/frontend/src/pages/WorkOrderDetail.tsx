import { useEffect, useState } from 'react'
import { useAuthStore } from '../store/authStore'
import apiClient from '../services/api'
import type { WorkOrder, Part, User, WOStatus } from '../types'
import Spinner from '../components/Spinner'
import { StatusBadge, PriorityBadge } from '../components/Badge'

const TRANSITIONS: Record<WOStatus, WOStatus[]> = {
  NEW: ['ASSIGNED','CANCELLED'],
  ASSIGNED: ['IN_PROGRESS','CANCELLED'],
  IN_PROGRESS: ['ON_HOLD','COMPLETED'],
  ON_HOLD: ['IN_PROGRESS'],
  COMPLETED: ['CLOSED'],
  CLOSED: [], CANCELLED: [],
}

function canUserDoTransition(role: string, ns: WOStatus, order: WorkOrder, userId: number) {
  if (ns === 'CLOSED') return role === 'MANAGER'
  if (ns === 'CANCELLED') return role === 'MANAGER' || role === 'DISPATCHER'
  if (ns === 'ASSIGNED') return role === 'DISPATCHER' || role === 'MANAGER'
  if (['IN_PROGRESS','ON_HOLD','COMPLETED'].includes(ns))
    return role === 'TECHNICIAN' && order.assignedToId === userId
  return false
}

interface Props { orderId: number; onBack: () => void }

export default function WorkOrderDetail({ orderId, onBack }: Props) {
  const { user } = useAuthStore()
  const [order, setOrder]       = useState<WorkOrder | null>(null)
  const [techs, setTechs]       = useState<User[]>([])
  const [parts, setParts]       = useState<Part[]>([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')
  const [success, setSuccess]   = useState('')
  const [note, setNote]         = useState('')
  const [assignId, setAssignId] = useState('')
  const [partId, setPartId]     = useState('')
  const [qty, setQty]           = useState(1)
  const [mins, setMins]         = useState(30)
  const [tNote, setTNote]       = useState('')
  const [busy, setBusy]         = useState(false)

  useEffect(() => { load() }, [orderId])

  async function load() {
    setLoading(true)
    try {
      const res = await apiClient.get<WorkOrder>(`/work-orders/${orderId}`)
      setOrder(res.data)
      if (user?.role === 'DISPATCHER' || user?.role === 'MANAGER') {
        const [tr, pr] = await Promise.all([
          apiClient.get<User[]>('/users/technicians'),
          apiClient.get<any>('/parts'),
        ])
        setTechs(tr.data)
        setParts(pr.data.content ?? pr.data)
      }
      if (user?.role === 'TECHNICIAN') {
        const pr = await apiClient.get<any>('/parts')
        setParts(pr.data.content ?? pr.data)
      }
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to load order')
    } finally { setLoading(false) }
  }

  function showMsg(msg: string, isError = false) {
    if (isError) setError(msg); else setSuccess(msg)
    setTimeout(() => { setError(''); setSuccess('') }, 4000)
  }

  async function doAction(fn: () => Promise<any>) {
    setBusy(true); setError(''); setSuccess('')
    try { await fn(); await load() }
    catch (e: any) { showMsg(e.response?.data?.message || e.message, true) }
    finally { setBusy(false) }
  }

  if (loading) return <Spinner />
  if (!order) return <div className="page"><div className="alert alert-error">{error || 'Not found'}</div></div>

  const myTransitions = TRANSITIONS[order.status].filter(ns =>
    canUserDoTransition(user?.role || '', ns, order, user?.userId || 0))

  const canAssign = (user?.role === 'DISPATCHER' || user?.role === 'MANAGER')
    && order.status === 'NEW'
  const isMyJob = order.assignedToId === user?.userId
  const isOpen = !['CLOSED','CANCELLED'].includes(order.status)

  return (
    <div className="page">
      {/* Back + header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <button className="btn btn-secondary btn-sm" onClick={onBack}>← Back</button>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#a78bfa' }}>{order.code}</h1>
          <StatusBadge status={order.status} />
          <PriorityBadge priority={order.priority} />
          {order.slaBreached && <span className="badge badge-danger">⚠ SLA BREACHED</span>}
        </div>
      </div>

      {error && <div className="alert alert-error">⚠️ {error}</div>}
      {success && <div className="alert alert-success">✅ {success}</div>}

      <div className="grid-2" style={{ marginBottom: 20 }}>
        {/* Details */}
        <div className="glass" style={{ padding: 24 }}>
          <h3 style={{ marginBottom: 16, fontSize: 18 }}>{order.title}</h3>
          {order.description && (
            <p style={{ color: 'var(--text-secondary)', marginBottom: 16, fontSize: 13 }}>
              {order.description}
            </p>
          )}
          <div style={{ display: 'grid', gap: 10 }}>
            {[
              ['🏢 Customer', order.customerName],
              ['📍 Site', order.siteName],
              ['🏗️ Site Address', order.siteAddress],
              ['👤 Assigned To', order.assignedToName || 'Unassigned'],
              ['🕐 SLA Due', order.slaDueDate ? new Date(order.slaDueDate).toLocaleString() : '—'],
              ['💰 Parts Cost', order.totalPartsPrice != null ? `$${Number(order.totalPartsPrice).toFixed(2)}` : '—'],
              ['⏱️ Labour', `${order.totalMinutesWorked ?? 0} min`],
              ['📅 Created', new Date(order.createdAt).toLocaleString()],
            ].map(([label, val]) => (
              <div key={label as string} style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>{label}</span>
                <span style={{ fontSize: 13, color: 'var(--text-primary)', textAlign: 'right' }}>{val || '—'}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="glass" style={{ padding: 24 }}>
          <h3 style={{ marginBottom: 18 }}>🎮 Actions</h3>

          {!isOpen && (
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
              This order is {order.status.toLowerCase()} — no further actions available.
            </p>
          )}

          {/* Assign */}
          {canAssign && (
            <div style={{ marginBottom: 20, paddingBottom: 20, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <label className="form-label">Assign to Technician</label>
              <select className="select" value={assignId}
                onChange={e => setAssignId(e.target.value)}
                style={{ marginBottom: 8 }}>
                <option value="">Select technician...</option>
                {techs.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
              <input className="input" placeholder="Note (optional)"
                value={note} onChange={e => setNote(e.target.value)}
                style={{ marginBottom: 10 }} />
              <button className="btn btn-primary" disabled={!assignId || busy}
                onClick={() => doAction(() =>
                  apiClient.post(`/work-orders/${orderId}/assign`, {
                    technicianId: Number(assignId), note
                  }))}>
                👤 Assign Work Order
              </button>
            </div>
          )}

          {/* Status transitions */}
          {myTransitions.length > 0 && (
            <div style={{ marginBottom: 20, paddingBottom: 20, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <label className="form-label">Change Status</label>
              <input className="input" placeholder="Note (optional)"
                value={note} onChange={e => setNote(e.target.value)}
                style={{ marginBottom: 10 }} />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {myTransitions.map(ns => (
                  <button key={ns} disabled={busy}
                    className={`btn ${ns === 'CANCELLED' ? 'btn-danger' : ns === 'CLOSED' ? 'btn-success' : 'btn-primary'}`}
                    onClick={() => doAction(() =>
                      apiClient.post(`/work-orders/${orderId}/status`, { newStatus: ns, note }))}>
                    → {ns.replace('_',' ')}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Log parts */}
          {user?.role === 'TECHNICIAN' && isMyJob && isOpen && (
            <div style={{ marginBottom: 20, paddingBottom: 20, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <label className="form-label">🔧 Log Parts Used</label>
              <select className="select" value={partId}
                onChange={e => setPartId(e.target.value)}
                style={{ marginBottom: 8 }}>
                <option value="">Select part...</option>
                {parts.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} (Stock: {p.stockQuantity})
                  </option>
                ))}
              </select>
              <input className="input" type="number" min={1} value={qty}
                onChange={e => setQty(Number(e.target.value))}
                placeholder="Quantity" style={{ marginBottom: 8 }} />
              <button className="btn btn-warning" disabled={!partId || busy}
                onClick={() => doAction(() =>
                  apiClient.post(`/work-orders/${orderId}/parts`, {
                    partId: Number(partId), quantityUsed: qty
                  }))}>
                📦 Log Parts
              </button>
            </div>
          )}

          {/* Log time */}
          {user?.role === 'TECHNICIAN' && isMyJob && isOpen && (
            <div>
              <label className="form-label">⏱️ Log Time Worked</label>
              <input className="input" type="number" min={1} value={mins}
                onChange={e => setMins(Number(e.target.value))}
                placeholder="Minutes worked" style={{ marginBottom: 8 }} />
              <input className="input" placeholder="Note (optional)"
                value={tNote} onChange={e => setTNote(e.target.value)}
                style={{ marginBottom: 8 }} />
              <button className="btn btn-primary" disabled={busy}
                onClick={() => doAction(() =>
                  apiClient.post(`/work-orders/${orderId}/time`, {
                    minutesWorked: mins, note: tNote
                  }))}>
                ✅ Log Time
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Status History */}
      {order.statusHistory && order.statusHistory.length > 0 && (
        <div className="glass" style={{ padding: 24, marginBottom: 16 }}>
          <h3 style={{ marginBottom: 20 }}>📜 Status History (Audit Trail)</h3>
          <div className="timeline">
            {[...order.statusHistory]
              .sort((a,b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime())
              .map(h => (
              <div key={h.id} className="timeline-item">
                <div className="timeline-dot" />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <StatusBadge status={h.fromStatus} />
                    <span style={{ color: 'var(--text-muted)' }}>→</span>
                    <StatusBadge status={h.toStatus} />
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {new Date(h.changedAt).toLocaleString()}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {h.changedByName}{h.note ? ` — ${h.note}` : ''}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Parts Used */}
      {order.partsUsed && order.partsUsed.length > 0 && (
        <div className="glass" style={{ padding: 24, marginBottom: 16 }}>
          <h3 style={{ marginBottom: 16 }}>
            🔧 Parts Used — Total: ${Number(order.totalPartsPrice).toFixed(2)}
          </h3>
          <table className="table">
            <thead>
              <tr>
                <th>SKU</th><th>Part Name</th><th>Qty</th>
                <th>Unit $</th><th>Total $</th>
              </tr>
            </thead>
            <tbody>
              {order.partsUsed.map(p => (
                <tr key={p.id}>
                  <td><code style={{ color: '#a78bfa', fontSize: 11 }}>{p.partSku}</code></td>
                  <td>{p.partName}</td>
                  <td>{p.quantityUsed}</td>
                  <td>${Number(p.unitPrice).toFixed(2)}</td>
                  <td><strong style={{ color: '#34d399' }}>${Number(p.totalPrice).toFixed(2)}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Time Logs */}
      {order.timeLogs && order.timeLogs.length > 0 && (
        <div className="glass" style={{ padding: 24 }}>
          <h3 style={{ marginBottom: 16 }}>
            ⏱️ Time Logged — Total: {order.totalMinutesWorked} min
          </h3>
          <table className="table">
            <thead>
              <tr><th>Technician</th><th>Minutes</th><th>Note</th><th>Logged At</th></tr>
            </thead>
            <tbody>
              {order.timeLogs.map(t => (
                <tr key={t.id}>
                  <td>{t.technicianName}</td>
                  <td><strong style={{ color: '#fbbf24' }}>{t.minutesWorked}</strong></td>
                  <td style={{ color: 'var(--text-muted)' }}>{t.note || '—'}</td>
                  <td style={{ fontSize: 12 }}>{new Date(t.loggedAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
