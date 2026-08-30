import { create } from 'zustand'
import type { AuthUser } from '../types'
import apiClient from '../services/api'

interface AuthStore {
  token: string | null
  user: AuthUser | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  initialize: () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  token: null,
  user: null,
  loading: false,

  login: async (email, password) => {
    set({ loading: true })
    try {
      const res = await apiClient.post('/auth/login', { email, password })
      const d = res.data
      const user: AuthUser = {
        userId: d.userId,
        email: d.email,
        name: d.name,
        role: d.role,
        customerId: d.customerId != null ? Number(d.customerId) : undefined,
      }
      localStorage.setItem('token', d.token)
      localStorage.setItem('user', JSON.stringify(user))
      set({ token: d.token, user, loading: false })
    } catch (err: any) {
      set({ loading: false })
      const msg = err.response?.data?.message ?? ''
      if (msg && !msg.includes('null') && !msg.includes('SQL') && !msg.includes('constraint')) {
        throw new Error(msg)
      }
      throw new Error('Invalid email or password. Please try again.')
    }
  },

  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    set({ token: null, user: null })
  },

  initialize: () => {
    const token = localStorage.getItem('token')
    const raw   = localStorage.getItem('user')
    if (token && raw) {
      try { set({ token, user: JSON.parse(raw) }) }
      catch { localStorage.removeItem('token'); localStorage.removeItem('user') }
    }
  },
}))
