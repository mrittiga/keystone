import { useEffect, useState } from 'react'
import apiClient from '../services/api'
import type { Part, PageResponse } from '../types'
import Spinner from '../components/Spinner'

export default function Parts() {
  const [parts, setParts]     = useState<Part[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const [success, setSuccess] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    sku: '', name: '', description: '', unitCost: '',
    stockQuantity: '', minStockLevel: '5'
  })
  const [submitting, setSubmitting] = useState(false)

  const load = () => {
    setLoading(true)
    apiClient.get<PageResponse<Part>>('/parts')
      .then(r => setParts(r.data.content ?? []))
      .catch(e => setError(e.response?.data?.message || 'Failed to load'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault(); setSubmitting(true)
    try {
      await apiClient.post('/parts', {
        ...form, unitCost: Number(form.unitCost),
        stockQuantity: Number(form.stockQuantity),
        minStockLevel: Number(form.minStockLevel),
      })
      setShowForm(false)
      setForm({ sku: '', name: '', description: '', unitCost: '', stockQuantity: '', minStockLevel: '5' })
      setSuccess('Part added successfully'); setTimeout(() => setSuccess(''), 3000)
      load()
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to create part')
    } finally { setSubmitting(false) }
  }

  if (loading) return <Spinner />

  const lowStock = parts.filter(p => p.lowStock)

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Parts Inventory 🔧</h1>
          <p className="page-subtitle">{parts.length} parts tracked</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          ➕ Add Part
        </button>
      </div>

      {error && <div className="alert alert-error">⚠️ {error}</div>}
      {success && <div className="alert alert-success">✅ {success}</div>}
      {lowStock.length > 0 && (
        <div className="alert alert-warning">
          ⚠ {lowStock.length} part{lowStock.length > 1 ? 's' : ''} below minimum stock:&nbsp;
          {lowStock.map(p => p.name).join(', ')}
        </div>
      )}

      <div className="glass" style={{ overflow: 'hidden' }}>
        <table className="table">
          <thead>
            <tr><th>SKU</th><th>Name</th><th>Stock</th><th>Min</th><th>Unit Cost</th><th>Status</th></tr>
          </thead>
          <tbody>
            {parts.map(p => (
              <tr key={p.id}>
                <td>
                  <code style={{ color: '#a78bfa', fontSize: 11,
                    background: 'rgba(167,139,250,0.1)', padding: '3px 8px', borderRadius: 4 }}>
                    {p.sku}
                  </code>
                </td>
                <td>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{p.name}</div>
                  {p.description && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p.description}</div>}
                </td>
                <td style={{ fontWeight: 700, color: p.lowStock ? '#f87171' : '#34d399' }}>
                  {p.stockQuantity}
                </td>
                <td style={{ color: 'var(--text-muted)' }}>{p.minStockLevel}</td>
                <td style={{ fontWeight: 600, color: '#fbbf24' }}>
                  ${Number(p.unitCost).toFixed(2)}
                </td>
                <td>
                  <span className={`badge ${p.lowStock ? 'badge-danger' : 'badge-success'}`}>
                    {p.lowStock ? '⚠ Low Stock' : '✓ OK'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="modal-overlay open" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>🔧 Add New Part</h2>
            <form onSubmit={handleCreate}>
              {[
                { label: 'SKU *', key: 'sku', placeholder: 'PART_001', type: 'text' },
                { label: 'Name *', key: 'name', placeholder: 'Part name', type: 'text' },
                { label: 'Description', key: 'description', placeholder: 'Optional description', type: 'text' },
                { label: 'Unit Cost ($) *', key: 'unitCost', placeholder: '0.00', type: 'number' },
                { label: 'Stock Quantity *', key: 'stockQuantity', placeholder: '0', type: 'number' },
                { label: 'Min Stock Level', key: 'minStockLevel', placeholder: '5', type: 'number' },
              ].map(f => (
                <div key={f.key} className="form-group">
                  <label className="form-label">{f.label}</label>
                  <input className="input" type={f.type} placeholder={f.placeholder}
                    required={f.label.includes('*')}
                    value={(form as any)[f.key]}
                    onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))} />
                </div>
              ))}
              <div className="btn-row">
                <button type="button" className="btn btn-secondary"
                  onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? '⏳ Saving...' : '✅ Add Part'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
