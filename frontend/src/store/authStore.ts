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
      const response = await apiClient.post('/auth/login', { email, password })
      const data = response.data
      const customerId = (data.customerId !== null && data.customerId !== undefined)
        ? Number(data.customerId) : undefined
      const user: AuthUser = {
        userId: data.userId,
        email: data.email,
        name: data.name,
        role: data.role,
        customerId,
      }
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(user))
      set({ token: data.token, user, loading: false })
    } catch (error: any) {
      set({ loading: false })
      const msg = error.response?.data?.message ?? ''
      if (msg && !msg.toLowerCase().includes('null') && !msg.toLowerCase().includes('sql')) {
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
      try {
        set({ token, user: JSON.parse(raw) as AuthUser })
      } catch {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
  },
}))
