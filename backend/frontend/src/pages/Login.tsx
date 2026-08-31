import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

const DEMOS = [
  { email: 'manager@meridian.com',    role: 'Manager',    icon: '👔', desc: 'Dashboard & reports' },
  { email: 'dispatcher@meridian.com', role: 'Dispatcher', icon: '📡', desc: 'Create & assign orders' },
  { email: 'technician@meridian.com', role: 'Technician', icon: '🛠️', desc: 'Field work & logging' },
  { email: 'customer@acme.com',       role: 'Customer',   icon: '🏢', desc: 'Self-service portal' },
]

export default function Login() {
  const [email, setEmail] = useState('manager@meridian.com')
  const [password, setPassword] = useState('Test@123')
  const [error, setError] = useState('')
  const { login, loading } = useAuthStore()
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    try {
      await login(email, password)
      navigate('/app')
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div className="app-bg" />
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <div style={{ width: '100%', maxWidth: 440 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            width: 70, height: 70, borderRadius: 20,
            background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 32, margin: '0 auto 16px',
            boxShadow: '0 0 40px rgba(124,58,237,0.5)',
          }}>⚙️</div>
          <h1 style={{
            fontSize: 36, fontWeight: 900, letterSpacing: 3,
            background: 'linear-gradient(135deg, #fff 0%, #a78bfa 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>KEYSTONE</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 6 }}>
            Field Service Management Platform
          </p>
        </div>

        {/* Card */}
        <div className="glass-strong" style={{ padding: 36 }}>
          {error && (
            <div className="alert alert-error">⚠️ {error}</div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input className="input" type="email" required
                value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@meridian.com" />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="input" type="password" required
                value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" />
            </div>

            <button type="submit" className="btn btn-primary btn-lg"
              style={{ width: '100%' }} disabled={loading}>
              {loading ? '⏳ Signing in...' : '🚀 Sign In'}
            </button>
          </form>

          <div style={{ marginTop: 28, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', marginBottom: 14 }}>
              Quick demo — click to prefill (password: <code style={{
                background: 'rgba(124,58,237,0.2)', padding: '2px 7px',
                borderRadius: 4, color: '#a78bfa', fontFamily: 'monospace'
              }}>Test@123</code>)
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {DEMOS.map(d => (
                <button key={d.email}
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 12, padding: '12px 14px',
                    cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
                    color: 'var(--text-primary)',
                  }}
                  onClick={() => { setEmail(d.email); setPassword('Test@123') }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.background = 'rgba(124,58,237,0.15)'
                    ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(124,58,237,0.4)'
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'
                    ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.1)'
                  }}
                >
                  <div style={{ fontSize: 20, marginBottom: 4 }}>{d.icon}</div>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{d.role}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{d.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 12, marginTop: 20 }}>
          Zidio Development · Project KEYSTONE v1.0
        </p>
      </div>
    </div>
  )
}
