import React, { useState, useEffect } from 'react'
import apiClient from '../services/api'

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
  onClose: () => void
  onSuccess: () => void
}

export default function NewWorkOrderModal({ onClose, onSuccess }: Props) {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [sites, setSites]         = useState<Site[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState('')
  const [selectedSite, setSelectedSite]         = useState('')
  const [title, setTitle]                       = useState('')
  const [description, setDescription]         = useState('')
  const [priority, setPriority]                 = useState('MEDIUM')
  const [loadingCustomers, setLoadingCustomers] = useState(true)
  const [loadingSites, setLoadingSites]         = useState(false)
  const [submitting, setSubmitting]             = useState(false)
  const [error, setError]                       = useState('')

  // 1. Fetch available customers when modal opens
  useEffect(() => {
    async function loadCustomers() {
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
    loadCustomers()
  }, [])

  // 2. Fetch sites whenever a customer is selected
  const handleCustomerChange = async (customerId: string) => {
    setSelectedCustomer(customerId)
    setSelectedSite('')
    if (!customerId) {
      setSites([])
      return
    }

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

  // 3. Handle submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCustomer) {
      setError('Please select a customer.')
      return
    }
    if (!selectedSite) {
      setError('Please select a site.')
      return
    }
    if (!title.trim()) {
      setError('Please enter a title.')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      await apiClient.post('/work-orders', {
        title: title.trim(),
        description: description.trim(),
        priority,
        customerId: Number(selectedCustomer),
        siteId: Number(selectedSite),
      })
      onSuccess()
      onClose()
    } catch {
      setError('Failed to create work order. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="modal-overlay open" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>✨ New Work Order</h2>

        {error && <div className="alert alert-error" style={{ marginBottom: 12 }}>⚠️ {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">TITLE *</label>
            <input
              className="input"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Title of the issue or task"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">DESCRIPTION</label>
            <textarea
              className="textarea"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="More details about the problem..."
            />
          </div>

          <div className="form-group">
            <label className="form-label">PRIORITY</label>
            <select
              className="select"
              value={priority}
              onChange={e => setPriority(e.target.value)}
            >
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
              <option value="URGENT">URGENT</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">
              CUSTOMER * {loadingCustomers && <span style={{ opacity: 0.6 }}>(loading...)</span>}
            </label>
            <select
              className="select"
              value={selectedCustomer}
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
              SITE * {loadingSites && <span style={{ opacity: 0.6 }}>(loading sites...)</span>}
            </label>
            <select
              className="select"
              value={selectedSite}
              onChange={e => setSelectedSite(e.target.value)}
              disabled={!selectedCustomer || loadingSites}
              required
            >
              <option value="">
                {!selectedCustomer
                  ? 'Select customer first...'
                  : sites.length === 0
                  ? 'No sites found for this customer'
                  : 'Select site...'}
              </option>
              {sites.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} {s.city ? `(${s.city})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="btn-row" style={{ marginTop: 20 }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={submitting}
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
  )
}

