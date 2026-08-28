import { useEffect, useState } from 'react'
import { useAuthStore } from '../store/authStore'
import apiClient from '../services/api'
import type { WorkOrder, Customer, Site, PageResponse } from '../types'
import Spinner from '../components/Spinner'
import { StatusBadge, PriorityBadge } from '../components/Badge'

interface Props { onSelectOrder: (id: number) => void }

export default function WorkOrders({ onSelectOrder }: Props) {
  const { user } = useAuthStore()
  const [orders, setOrders]       = useState<WorkOrder[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [sites, setSites]         = useState<Site[]>([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState('')
  const [showForm, setShowForm]   = useState(false)
  const [filterStatus, setFilter] = useState('')
  const [search, setSearch]       = useState('')
  const [form, setForm]           = useState({ title: '', description: '', priority: 'MEDIUM', customerId: '', siteId: '' })
  const [submitting, setSubmitting] = useState(false)

  const canCreate = ['DISPATCHER','MANAGER','CUSTOMER'].includes(user?.role || '')

  useEffect(() => { loadOrders() }, [user])

  async function loadOrders() {
    setLoading(true)
    try {
      const path = user?.role === 'TECHNICIAN' ? '/work-orders/my-assigned' : '/work-orders'
      const res = await apiClient.get<PageResponse<WorkOrder> | WorkOrder[]>(path)
      const data = res.data
      setOrders(Array.isArray(data) ? data : (data as PageResponse<WorkOrder>).content ?? [])
      if (canCreate && user?.role !== 'CUSTOMER') {
        const cr = await apiClient.get<PageResponse<Customer>>('/customers')
        setCustomers(cr.data.content ?? [])
      }
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  async function handleCustomerChange(cid: string) {
    setForm(f => ({ ...f, customerId: cid, siteId: '' }))
    if (!cid) { setSites([]); return }
    try {
      const res = await apiClient.get<PageResponse<Site>>(`/customers/${cid}/sites`)
      setSites(res.data.content ?? [])
    } catch { setSites([]) }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault(); setSubmitting(true)
    try {
      await apiClient.post('/work-orders', {
        title: form.title, description: form.description, priority: form.priority,
        customerId: Number(form.customerId), siteId: Number(form.siteId),
      })
      setShowForm(false)
      setForm({ title: '', description: '', priority: 'MEDIUM', customerId: '', siteId: '' })
      loadOrders()
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to create order')
    } finally { setSubmitting(false) }
  }

  const filtered = orders.filter(o => {
    if (filterStatus && o.status !== filterStatus) return false
    if (search && !o.title.toLowerCase().includes(search.toLowerCase())
        && !o.code.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  if (loading) return <Spinner />

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Work Orders</h1>
          <p className="page-subtitle">{filtered.length} order{filtered.length !== 1 ? 's' : ''} shown</p>
        </div>
        {canCreate && (
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            ➕ New Work Order
          </button>
        )}
      </div>

      {error && <div className="alert alert-error">⚠️ {error}</div>}

      <div className="filters-bar">
        <select className="select" value={filterStatus} onChange={e => setFilter(e.target.value)}>
          <option value="">All Status</option>
          {['NEW','ASSIGNED','IN_PROGRESS','ON_HOLD','COMPLETED','CLOSED','CANCELLED'].map(s => (
            <option key={s} value={s}>{s.replace('_',' ')}</option>
          ))}
        </select>
        <input className="input" placeholder="🔍 Search by title or code..."
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {filtered.length === 0
        ? <div className="glass" style={{ padding: 60, textAlign: 'center' }}>
            <div style={{ fontSize: 50, marginBottom: 16 }}>📭</div>
            <p style={{ color: 'var(--text-muted)' }}>No work orders found</p>
          </div>
        : filtered.map(o => (
          <div key={o.id} className="wo-card glass" onClick={() => onSelectOrder(o.id)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div>
                <div className="wo-code">{o.code}</div>
                <div className="wo-title">{o.title}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
                <StatusBadge status={o.status} />
                <PriorityBadge priority={o.priority} />
              </div>
            </div>
            <div className="wo-meta">
              {o.customerName && <span>🏢 {o.customerName}</span>}
              {o.siteName && <span>📍 {o.siteName}</span>}
              {o.assignedToName && <span>👤 {o.assignedToName}</span>}
              {o.slaBreached && <span style={{ color: '#f87171', fontWeight: 700 }}>⚠ SLA Breached</span>}
            </div>
            <div className="wo-footer">
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                📅 {new Date(o.createdAt).toLocaleDateString()}
              </span>
              <button className="btn btn-secondary btn-sm"
                onClick={e => { e.stopPropagation(); onSelectOrder(o.id) }}>
                View Details →
              </button>
            </div>
          </div>
        ))
      }

      {/* New Work Order Modal */}
      {showForm && (
        <div className="modal-overlay open" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>✨ New Work Order</h2>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="form-label">Title *</label>
                <input className="input" required value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="Brief description of the issue" />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="textarea" value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="More details about the problem..." />
              </div>
              <div className="form-group">
                <label className="form-label">Priority *</label>
                <select className="select" value={form.priority}
                  onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                  {['LOW','MEDIUM','HIGH','URGENT'].map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              {user?.role !== 'CUSTOMER' && (
                <>
                  <div className="form-group">
                    <label className="form-label">Customer *</label>
                    <select className="select" required value={form.customerId}
                      onChange={e => handleCustomerChange(e.target.value)}>
                      <option value="">Select customer...</option>
                      {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Site *</label>
                    <select className="select" required value={form.siteId}
                      disabled={!form.customerId}
                      onChange={e => setForm(f => ({ ...f, siteId: e.target.value }))}>
                      <option value="">Select site...</option>
                      {sites.map(s => <option key={s.id} value={s.id}>{s.name} — {s.city}</option>)}
                    </select>
                  </div>
                </>
              )}
              <div className="btn-row">
                <button type="button" className="btn btn-secondary"
                  onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
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
