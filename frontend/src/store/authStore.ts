import { create } from 'zustand'
import type { AuthUser } from '../types'
import apiClient from '../services/api'

interface AuthStore {
  token: string | null
  user: AuthUser | null
  loading: boolean
  initialized: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  initialize: () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  token: null,
  user: null,
  loading: false,
  initialized: false,

  login: async (email, password) => {
    set({ loading: true })
    try {
      const response = await apiClient.post('/auth/login', { email, password })
      const data = response.data
      const token = String(data.token).replace(/^Bearer\s+/i, '')
      const identity = data.user ?? data
      const customerId = (identity.customerId !== null && identity.customerId !== undefined)
        ? Number(identity.customerId) : undefined
      const user: AuthUser = {
        userId: Number(identity.id ?? identity.userId),
        email: identity.email,
        name: identity.name,
        role: String(identity.role).toUpperCase() as AuthUser['role'],
        customerId,
      }
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      set({ token, user, loading: false })
    } catch (error: any) {
      set({ loading: false })
      const responseData = error.response?.data
      const fieldErrors = responseData?.fieldErrors
        ? Object.values(responseData.fieldErrors).join(' ')
        : ''
      const msg = fieldErrors || responseData?.message || ''
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
    set({ initialized: true })
  },
}))
