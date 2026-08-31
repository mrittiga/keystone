import { useEffect, useState } from 'react'
import apiClient from '../services/api'
import type { User } from '../types'
import Spinner from '../components/Spinner'
import { RoleBadge } from '../components/Badge'

export default function Users() {
  const [users, setUsers]     = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const [success, setSuccess] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: 'Test@123', role: 'TECHNICIAN' })
  const [submitting, setSubmitting] = useState(false)

  const load = () => {
    setLoading(true)
    apiClient.get<User[]>('/users')
      .then(r => setUsers(r.data))
      .catch(e => setError(e.response?.data?.message || 'Failed to load'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault(); setSubmitting(true)
    try {
      await apiClient.post('/users', form)
      setShowForm(false)
      setForm({ name: '', email: '', password: 'Test@123', role: 'TECHNICIAN' })
      setSuccess('User created successfully'); setTimeout(() => setSuccess(''), 3000)
      load()
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to create user')
    } finally { setSubmitting(false) }
  }

  async function toggleActive(id: number) {
    try {
      await apiClient.put(`/users/${id}/toggle-active`, {})
      load()
    } catch (e: any) { setError(e.response?.data?.message || 'Failed') }
  }

  if (loading) return <Spinner />

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">User Management 👥</h1>
          <p className="page-subtitle">{users.length} users on the platform</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          ➕ Add User
        </button>
      </div>

      {error && <div className="alert alert-error">⚠️ {error}</div>}
      {success && <div className="alert alert-success">✅ {success}</div>}

      <div className="glass" style={{ overflow: 'hidden' }}>
        <table className="table">
          <thead>
            <tr>
              <th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 8,
                      background: 'linear-gradient(135deg,#7c3aed,#06b6d4)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 13, fontWeight: 800, color: 'white',
                    }}>{u.name.charAt(0)}</div>
                    <strong style={{ color: 'var(--text-primary)' }}>{u.name}</strong>
                  </div>
                </td>
                <td>{u.email}</td>
                <td><RoleBadge role={u.role} /></td>
                <td>
                  <span className={`badge ${u.active ? 'badge-success' : 'badge-danger'}`}>
                    {u.active ? '● Active' : '● Inactive'}
                  </span>
                </td>
                <td>
                  <button
                    className={`btn btn-sm ${u.active ? 'btn-danger' : 'btn-success'}`}
                    onClick={() => toggleActive(u.id)}>
                    {u.active ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="modal-overlay open" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>👤 Add New User</h2>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input className="input" required value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input className="input" required type="email" value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Password *</label>
                <input className="input" required type="password" value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Role *</label>
                <select className="select" value={form.role}
                  onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                  {['DISPATCHER','TECHNICIAN','MANAGER','CUSTOMER'].map(r =>
                    <option key={r}>{r}</option>)}
                </select>
              </div>
              <div className="btn-row">
                <button type="button" className="btn btn-secondary"
                  onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? '⏳ Creating...' : '✅ Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
