import { useEffect, useState } from 'react'
import apiClient from '../services/api'
import type { WorkOrder, PageResponse } from '../types'
import Spinner from '../components/Spinner'
import { StatusBadge, PriorityBadge } from '../components/Badge'

interface Customer {
  id: number
  name: string
}

interface Site {
  id: number
  name: string
  city?: string
}

interface Props {
  onSelectOrder: (id: number) => void
}

export default function WorkOrders({ onSelectOrder }: Props) {
  const [orders, setOrders]             = useState<WorkOrder[]>([])
  const [customers, setCustomers]       = useState<Customer[]>([])
  const [sites, setSites]               = useState<Site[]>([])
  const [loading, setLoading]           = useState(true)
  const [loadingCustomers, setLoadingCustomers] = useState(false)
  const [loadingSites, setLoadingSites] = useState(false)
  const [error, setError]               = useState('')
  const [success, setSuccess]           = useState('')
  const [showForm, setShowForm]         = useState(false)
  
  const [form, setForm]                 = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    customerId: '',
    siteId: '',
  })
  const [submitting, setSubmitting]     = useState(false)

  useEffect(() => {
    loadOrders()
  }, [])

  async function loadOrders() {
    try {
      const res = await apiClient.get<PageResponse<WorkOrder>>('/work-orders')
      setOrders(res.data.content ?? [])
    } catch {
      setError('Failed to load work orders.')
    } finally {
      setLoading(false)
    }
  }

  async function openCreateModal() {
    setError('')
    setSuccess('')
    setShowForm(true)
    setLoadingCustomers(true)
    try {
      const res = await apiClient.get('/customers')
      const data = Array.isArray(res.data) ? res.data : (res.data.content ?? [])
      setCustomers(data)
    } catch {
      setError('Failed to load customers list.')
    } finally {
      setLoadingCustomers(false)
    }
  }

  async function handleCustomerChange(customerId: string) {
    setForm(f => ({ ...f, customerId, siteId: '' }))
    setSites([])
    if (!customerId) return

    setLoadingSites(true)
    try {
      const res = await apiClient.get(`/customers/${customerId}/sites`)
      const data = Array.isArray(res.data) ? res.data : (res.data.content ?? [])
      setSites(data)
    } catch {
      setSites([])
    } finally {
      setLoadingSites(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) {
      setError('Please enter a title.')
      return
    }
    if (!form.customerId) {
      setError('Please select a customer.')
      return
    }
    if (!form.siteId) {
      setError('Please select a site.')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      await apiClient.post('/work-orders', {
        title: form.title.trim(),
        description: form.description.trim(),
        priority: form.priority,
        customerId: Number(form.customerId),
        siteId: Number(form.siteId),
      })

      setShowForm(false)
      setForm({ title: '', description: '', priority: 'MEDIUM', customerId: '', siteId: '' })
      setSuccess('Work order created successfully!')
      setTimeout(() => setSuccess(''), 5000)
      loadOrders()
    } catch {
      setError('Failed to create work order. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <Spinner />

  return (
    <div className="page">
      {success && (
        <div className="alert alert-success" style={{ marginBottom: 16 }}>
          ✅ {success}
        </div>
      )}

      <div className="page-header">
        <div>
          <h1 className="page-title">Work Orders 📋</h1>
          <p className="page-subtitle">Manage and track all dispatch operations</p>
        </div>
        <button className="btn btn-primary" onClick={openCreateModal}>
          ✨ New Work Order
        </button>
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>⚠️ {error}</div>}

      {orders.length === 0 ? (
        <div className="glass" style={{ padding: 60, textAlign: 'center' }}>
          <div style={{ fontSize: 50, marginBottom: 16 }}>📋</div>
          <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>No work orders found</p>
          <button className="btn btn-primary" onClick={openCreateModal}>
            Create First Work Order
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
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <div>
                <div className="wo-code">{o.code}</div>
                <div className="wo-title">{o.title}</div>
              </div>
              <StatusBadge status={o.status} />
            </div>

            <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center' }}>
              {o.siteName && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>📍 {o.siteName}</span>}
              <PriorityBadge priority={o.priority} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                📅 {new Date(o.createdAt).toLocaleDateString()}
              </span>
              <button
                className="btn btn-secondary btn-sm"
                onClick={e => { e.stopPropagation(); onSelectOrder(o.id) }}
              >
                View Details →
              </button>
            </div>
          </div>
        ))
      )}

      {showForm && (
        <div className="modal-overlay open" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>✨ New Work Order</h2>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">TITLE *</label>
                <input
                  className="input"
                  required
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="Brief description of the issue"
                />
              </div>

              <div className="form-group">
                <label className="form-label">DESCRIPTION</label>
                <textarea
                  className="textarea"
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="More details about the problem..."
                />
              </div>

              <div className="form-group">
                <label className="form-label">PRIORITY</label>
                <select
                  className="select"
                  value={form.priority}
                  onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
                >
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                  <option value="URGENT">URGENT</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  CUSTOMER * {loadingCustomers && <span style={{ fontSize: 11, opacity: 0.7 }}>(loading...)</span>}
                </label>
                <select
                  className="select"
                  value={form.customerId}
                  onChange={e => handleCustomerChange(e.target.value)}
                  disabled={loadingCustomers}
                  required
                >
                  <option value="">
                    {loadingCustomers ? 'Loading customers...' : 'Select customer...'}
                  </option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  SITE * {loadingSites && <span style={{ fontSize: 11, opacity: 0.7 }}>(loading sites...)</span>}
                </label>
                <select
                  className="select"
                  value={form.siteId}
                  onChange={e => setForm(f => ({ ...f, siteId: e.target.value }))}
                  disabled={!form.customerId || loadingSites}
                  required
                >
                  <option value="">
                    {!form.customerId
                      ? 'Select customer first...'
                      : sites.length === 0
                      ? 'No sites found for this customer'
                      : 'Select site...'}
                  </option>
                  {sites.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name}{s.city ? ` — ${s.city}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="btn-row" style={{ marginTop: 20 }}>
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
                  disabled={submitting || loadingCustomers || loadingSites}
                >
                  {submitting ? '⏳ Creating...' : '✅ Create Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

