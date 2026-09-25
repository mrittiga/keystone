import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { getApiErrorMessage, registerUser } from '../services/api'
import { roleHomePath } from '../components/RoleBasedRoute'

type UserRole = 'MANAGER' | 'DISPATCHER' | 'TECHNICIAN' | 'CUSTOMER'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState<UserRole>('CUSTOMER')
  const [showPassword, setShowPassword] = useState(false)
  const [mode, setMode] = useState<'signin' | 'register' | 'forgot'>('signin')
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const { login, loading } = useAuthStore()
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setNotice('')

    if (mode === 'forgot') {
      setNotice(`Reset instructions sent to ${email}`)
      return
    }

    if (mode === 'register') {
      try {
        await registerUser(name, email, password, role)
        setNotice(`Account created successfully as ${role}. You can now sign in.`)
        setMode('signin')
        setPassword('')
      } catch (err: any) {
        setError(getApiErrorMessage(err, 'Unable to create account.'))
      }
      return
    }

    try {
      await login(email, password)
      const loggedInUser = useAuthStore.getState().user
      if (loggedInUser) navigate(roleHomePath(loggedInUser.role))
    } catch (err: any) {
      setError(err.message || 'Invalid credentials or login failed.')
    }
  }

  return (
    <div className="login-container">
      <h2>⚙️ KEYSTONE Field Service Management Platform</h2>

      {error && <div className="error">⚠️ {error}</div>}
      {notice && <div className="notice">✅ {notice}</div>}

      <div className="mode-switch">
        {(['signin','register','forgot'] as const).map(value => (
          <button
            key={value}
            onClick={() => { setMode(value); setError(''); setNotice('') }}
            style={{
              padding:'9px 4px',
              border:0,
              borderRadius:7,
              cursor:'pointer',
              color: mode === value ? '#fff' : 'var(--text-muted)',
              background: mode === value ? 'rgba(124,58,237,.7)' : 'transparent',
              fontWeight:700,
              fontSize:11
            }}
          >
            {value === 'signin' ? 'Sign In' : value === 'register' ? 'Register' : 'Forgot Password'}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        {mode === 'register' && (
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Full Name"
            required
          />
        )}

        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Email Address"
          required
        />

        {mode !== 'forgot' && (
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              style={{
                position:'absolute',
                right:8,
                top:5,
                height:34,
                width:34,
                border:0,
                background:'transparent',
                cursor:'pointer',
                fontSize:20
              }}
            >
              {showPassword ? '🐵' : '🙈'}
            </button>
          </div>
        )}

        {mode === 'register' && (
          <select value={role} onChange={e => setRole(e.target.value as UserRole)}>
            <option value="CUSTOMER">Customer</option>
            <option value="MANAGER">Manager</option>
            <option value="DISPATCHER">Dispatcher</option>
            <option value="TECHNICIAN">Technician</option>
          </select>
        )}

        <button type="submit" disabled={loading}>
          {loading
            ? '⏳ Processing...'
            : mode === 'forgot'
            ? '📨 Send Reset Link'
            : mode === 'register'
            ? `✨ Register as ${role.charAt(0) + role.slice(1).toLowerCase()}`
            : '🚀 Sign In'}
        </button>
      </form>
    </div>
  )
}
