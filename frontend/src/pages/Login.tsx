import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { registerUser } from '../services/api'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [mode, setMode] = useState<'signin' | 'register' | 'forgot'>('signin')
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const { login, loading } = useAuthStore()
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (mode === 'forgot') {
      setNotice(`Reset instructions sent to ${email}`)
      return
    }
    if (mode === 'register') {
      try {
        await registerUser(name, email, password)
        setNotice('Account created. You can now sign in.')
        setMode('signin')
        setPassword('')
      } catch (err: any) {
        setError(err.response?.data?.message ?? 'Unable to create account.')
      }
      return
    }
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
          {notice && <div className="alert alert-success">✅ {notice}</div>}

          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:6, marginBottom:24, padding:4, background:'rgba(255,255,255,.05)', borderRadius:10 }}>
            {([['signin','Sign In'],['register','Register'],['forgot','Forgot Password']] as const).map(([value,label]) => <button key={value} type="button" onClick={() => { setMode(value); setError(''); setNotice('') }} style={{ padding:'9px 4px', border:0, borderRadius:7, cursor:'pointer', color: mode === value ? '#fff' : 'var(--text-muted)', background: mode === value ? 'rgba(124,58,237,.7)' : 'transparent', fontWeight:700, fontSize:11 }}>{label}</button>)}
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input className="input" type="email" required
                value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@meridian.com" />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position:'relative' }}>
                <input className="input" style={{ paddingRight:48 }} type={showPassword ? 'text' : 'password'} required={mode !== 'forgot'}
                  value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
                <button type="button" title={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(v => !v)} style={{ position:'absolute', right:8, top:5, height:34, width:34, border:0, background:'transparent', cursor:'pointer', fontSize:20 }}>{showPassword ? '🐵' : '🙈'}</button>
              </div>
            </div>

            {mode === 'register' && <div className="form-group"><label className="form-label">Full name</label><input className="input" required value={name} onChange={e => setName(e.target.value)} placeholder="Your name" /></div>}

            <button type="submit" className="btn btn-primary btn-lg"
              style={{ width: '100%' }} disabled={loading}>
              {loading ? '⏳ Signing in...' : mode === 'forgot' ? '📨 Send Reset Link' : mode === 'register' ? '✨ Create Account' : '🚀 Sign In'}
            </button>
          </form>

          <p style={{ marginTop: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>
            Need access? Contact your Keystone administrator.
          </p>
        </div>

        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 12, marginTop: 20 }}>
          Zidio Development · Project KEYSTONE v1.0
        </p>
      </div>
    </div>
  )
}
