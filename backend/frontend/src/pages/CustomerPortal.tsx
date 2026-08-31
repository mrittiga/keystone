import { useEffect, useState } from 'react'
import apiClient from '../services/api'
import type { WorkOrder, PageResponse } from '../types'
import Spinner from '../components/Spinner'
import { StatusBadge, PriorityBadge } from '../components/Badge'

interface Site {
  id: number
  name: string
  city?: string
  address?: string
  customerId?: number
}

interface Props { onSelectOrder: (id: number) => void }

export default function CustomerPortal({ onSelectOrder }: Props) {
  const [orders, setOrders]       = useState<WorkOrder[]>([])
  const [sites, setSites]         = useState<Site[]>([])
  const [loading, setLoading]     = useState(true)
  const [sitesLoading, setSitesLoading] = useState(true)
  const [error, setError]         = useState('')
  const [success, setSuccess]     = useState('')
  const [showForm, setShowForm]   = useState(false)
  const [form, setForm]           = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    siteId: '',
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadOrders()
    loadSites()
  }, [])

  async function loadOrders() {
    try {
      const res = await apiClient.get<PageResponse<WorkOrder>>('/work-orders')
      setOrders(res.data.content ?? [])
    } catch {
      setError('Failed to load your requests.')
    } finally {
      setLoading(false)
    }
  }

  async function loadSites() {
    setSitesLoading(true)
    try {
      const res = await apiClient.get<Site[]>('/customers/my-sites')
      const data = res.data
      if (Array.isArray(data)) {
        setSites(data)
      } else {
        setSites([])
      }
    } catch {
      setSites([])
    } finally {
      setSitesLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.siteId) {
      setError('Please select a site location.')
      return
    }
    if (!form.title.trim()) {
      setError('Please enter a title.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const selectedSite = sites.find(s => s.id === Number(form.siteId))
      const customerId = selectedSite?.customerId

      await apiClient.post('/work-orders', {
        title: form.title.trim(),
        description: form.description.trim(),
        priority: form.priority,
        customerId: customerId,
        siteId: Number(form.siteId),
      })

      setShowForm(false)
      setForm({ title: '', description: '', priority: 'MEDIUM', siteId: '' })
      setSuccess('Your service request has been submitted successfully!')
      setTimeout(() => setSuccess(''), 5000)
      loadOrders()
    } catch {
      setError('Failed to submit your request. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <Spinner />

  return (
    <div className="page">

      {/* Success toast */}
      {success && (
        <div style={{
          position: 'fixed', bottom: 24, right: 16, zIndex: 9999,
          background: 'rgba(16,185,129,0.15)',
          border: '1px solid rgba(16,185,129,0.4)',
          borderRadius: 14, padding: '14px 18px',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', gap: 10,
          color: '#34d399', fontWeight: 600, fontSize: 13,
          maxWidth: 340,
        }}>
          <span style={{ fontSize: 18 }}>✅</span>
          <span style={{ flex: 1 }}>{success}</span>
          <button onClick={() => setSuccess('')}
            style={{ background: 'none', border: 'none', color: '#34d399',
              cursor: 'pointer', fontSize: 16, opacity: 0.7, padding: 0 }}>✕</button>
        </div>
      )}

      <div className="page-header">
        <div>
          <h1 className="page-title">My Requests 📬</h1>
          <p className="page-subtitle">
            Track and manage your service requests
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => { setError(''); setSuccess(''); setShowForm(true) }}
        >
          ➕ Request Service
        </button>
      </div>

      {error && (
        <div className="alert alert-error">⚠️ {error}</div>
      )}

      {orders.length === 0 ? (
        <div className="glass" style={{ padding: 60, textAlign: 'center' }}>
          <div style={{ fontSize: 50, marginBottom: 16 }}>📬</div>
          <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>
            No service requests yet
          </p>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            Submit Your First Request
          </button>
        </div>
      ) : (
        orders.map(o => (
          <div
            key={o.id}
            className="wo-card glass"
            style={{ marginBottom: 14 }}
            onClick={() => onSelectOrder(o.id)}
          >
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'flex-start', marginBottom: 10,
            }}>
              <div>
                <div className="wo-code">{o.code}</div>
                <div className="wo-title">{o.title}</div>
              </div>
              <StatusBadge status={o.status} />
            </div>

            <div style={{
              display: 'flex', flexWrap: 'wrap', gap: 8,
              marginBottom: 12, alignItems: 'center',
            }}>
              <span style={{
                display: 'flex', alignItems: 'center', gap: 4,
                fontSize: 12, color: 'var(--text-muted)',
              }}>
                {o.siteName && <>📍 {o.siteName}</>}
              </span>
              <PriorityBadge priority={o.priority} />
            </div>

            <div style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', paddingTop: 12,
              borderTop: '1px solid rgba(255,255,255,0.06)',
            }}>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                📅 {new Date(o.createdAt).toLocaleDateString()}
              </span>
              <button
                className="btn btn-secondary btn-sm"
                onClick={e => { e.stopPropagation(); onSelectOrder(o.id) }}
              >
                View Status →
              </button>
            </div>
          </div>
        ))
      )}

      {showForm && (
        <div
          className="modal-overlay open"
          onClick={() => setShowForm(false)}
        >
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>📬 New Service Request</h2>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">What needs fixing? *</label>
                <input
                  className="input"
                  required
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="Brief description of the issue"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Details</label>
                <textarea
                  className="textarea"
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="More information about the problem..."
                />
              </div>

              <div className="form-group">
                <label className="form-label">Urgency</label>
                <select
                  className="select"
                  value={form.priority}
                  onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
                >
                  <option value="LOW">Low — Routine, no urgency</option>
                  <option value="MEDIUM">Medium — Needs attention soon</option>
                  <option value="HIGH">High — Affecting operations</option>
                  <option value="URGENT">Urgent — Critical, immediate response</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Location / Site *{' '}
                  {sitesLoading
                    ? <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: 11 }}>
                        (loading...)
                      </span>
                    : <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: 11 }}>
                        ({sites.length} available)
                      </span>
                  }
                </label>

                {sitesLoading ? (
                  <div style={{
                    padding: '11px 15px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: 10, fontSize: 13,
                    color: 'var(--text-muted)',
                  }}>
                    Loading sites...
                  </div>
                ) : sites.length === 0 ? (
                  <div style={{
                    padding: '11px 15px',
                    background: 'rgba(239,68,68,0.1)',
                    border: '1px solid rgba(239,68,68,0.3)',
                    borderRadius: 10, fontSize: 13,
                    color: '#f87171',
                  }}>
                    No sites found. Contact your administrator.
                  </div>
                ) : (
                  <select
                    className="select"
                    value={form.siteId}
                    onChange={e => setForm(f => ({ ...f, siteId: e.target.value }))}
                  >
                    <option value="">— Select your site —</option>
                    {sites.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name}{s.city ? ` — ${s.city}` : ''}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="btn-row">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting || sitesLoading || sites.length === 0}
                >
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
