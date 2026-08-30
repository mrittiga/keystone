import { useEffect, useState } from 'react'
import { useAuthStore } from '../store/authStore'
import apiClient from '../services/api'
import type { WorkOrder, Site, PageResponse } from '../types'
import Spinner from '../components/Spinner'
import { StatusBadge, PriorityBadge } from '../components/Badge'
import StatusProgress from '../components/StatusProgress'
import Toast from '../components/Toast'

interface Props { onSelectOrder: (id: number) => void }

export default function CustomerPortal({ onSelectOrder }: Props) {
  const { user }                = useAuthStore()
  const [orders, setOrders]     = useState<WorkOrder[]>([])
  const [sites, setSites]       = useState<Site[]>([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')
  const [toast, setToast]       = useState<{msg:string;type:'success'|'error'}|null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm]         = useState({ title:'', description:'', priority:'MEDIUM', siteId:'' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => { load() }, [user])

  async function load() {
    setLoading(true)
    setError('')
    try {
      const or = await apiClient.get<PageResponse<WorkOrder>>('/work-orders')
      setOrders(or.data.content ?? [])
    } catch { setError('Failed to load orders.') }

    try {
      const meRes = await apiClient.get<any>('/users/me')
      const cid = meRes.data?.customerId
      if (cid) {
        const si = await apiClient.get<any>(`/customers/${cid}/sites`)
        const raw = si.data
        if (Array.isArray(raw)) setSites(raw)
        else if (raw?.content && Array.isArray(raw.content)) setSites(raw.content)
        else setSites([])
      } else {
        setSites([])
      }
    } catch { setSites([]) }

    setLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.siteId) { setError('Please select a site.'); return }
    setSubmitting(true); setError('')
    try {
      const meRes = await apiClient.get<any>('/users/me')
      const cid = meRes.data?.customerId
      await apiClient.post('/work-orders', {
        title: form.title.trim(), description: form.description.trim(),
        priority: form.priority, customerId: cid, siteId: Number(form.siteId),
      })
      setShowForm(false)
      setForm({ title:'', description:'', priority:'MEDIUM', siteId:'' })
      setToast({ msg: 'Service request submitted successfully! We will be in touch.', type: 'success' })
      load()
    } catch {
      setError('Failed to submit. Please try again.')
    } finally { setSubmitting(false) }
  }

  if (loading) return <Spinner />

  return (
    <div className="page">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      <div className="page-header">
        <div>
          <h1 className="page-title">My Requests 📬</h1>
          <p className="page-subtitle">Track and manage your service requests</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setError(''); setShowForm(true) }}>
          ➕ Request Service
        </button>
      </div>

      {error && <div className="alert alert-error">⚠️ {error}</div>}

      {orders.length === 0
        ? (
          <div className="glass" style={{ padding: 60, textAlign: 'center' }}>
            <div style={{ fontSize: 50, marginBottom: 16 }}>📬</div>
            <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>No requests yet</p>
            <button className="btn btn-primary" onClick={() => setShowForm(true)}>
              Submit First Request
            </button>
          </div>
        )
        : orders.map(o => (
          <div key={o.id} className="wo-card glass" style={{ marginBottom: 16 }}
            onClick={() => onSelectOrder(o.id)}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom: 10 }}>
              <div>
                <div className="wo-code">{o.code}</div>
                <div className="wo-title">{o.title}</div>
              </div>
              <StatusBadge status={o.status} />
            </div>
            <StatusProgress currentStatus={o.status} />
            <div className="wo-meta">
              {o.siteName && <span>📍 {o.siteName}</span>}
              <PriorityBadge priority={o.priority} />
            </div>
            <div className="wo-footer">
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                📅 {new Date(o.createdAt).toLocaleDateString()}
              </span>
              <button className="btn btn-secondary btn-sm"
                onClick={e => { e.stopPropagation(); onSelectOrder(o.id) }}>
                View Status →
              </button>
            </div>
          </div>
        ))
      }

      {showForm && (
        <div className="modal-overlay open" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>📬 New Service Request</h2>
            {sites.length === 0 && (
              <div className="alert alert-warning">
                ⚠ Loading your sites... If this persists, ask your admin to check your account.
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">What needs fixing? *</label>
                <input className="input" required value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="Brief description of the issue" />
              </div>
              <div className="form-group">
                <label className="form-label">Details</label>
                <textarea className="textarea" value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="More information about the problem..." />
              </div>
              <div className="form-group">
                <label className="form-label">Urgency</label>
                <select className="select" value={form.priority}
                  onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                  <option value="LOW">Low — Routine</option>
                  <option value="MEDIUM">Medium — Needs attention soon</option>
                  <option value="HIGH">High — Affecting operations</option>
                  <option value="URGENT">Urgent — Critical, immediate</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">
                  Location / Site * ({sites.length} available)
                </label>
                {sites.length === 0
                  ? <div style={{
                      padding: '11px 15px', background: 'rgba(239,68,68,0.1)',
                      border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10,
                      fontSize: 13, color: '#f87171',
                    }}>No sites found. Contact your administrator.</div>
                  : <select className="select" value={form.siteId}
                      onChange={e => setForm(f => ({ ...f, siteId: e.target.value }))}>
                      <option value="">— Select your site —</option>
                      {sites.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.name}{s.city ? ` — ${s.city}` : ''}
                        </option>
                      ))}
                    </select>
                }
              </div>
              <div className="btn-row">
                <button type="button" className="btn btn-secondary"
                  onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary"
                  disabled={submitting || sites.length === 0}>
                  {submitting ? '⏳ Submitting...' : '📤 Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
