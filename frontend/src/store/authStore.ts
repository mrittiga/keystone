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
      const user: AuthUser = {
        userId: data.userId,
        email: data.email,
        name: data.name,
        role: data.role,
        customerId: data.customerId,
      }
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(user))
      set({ token: data.token, user, loading: false })
    } catch (error: any) {
      set({ loading: false })
      const msg = error.response?.data?.message || 'Invalid email or password'
      throw new Error(msg)
    }
  },

  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    set({ token: null, user: null })
  },

  initialize: () => {
    const token = localStorage.getItem('token')
    const raw = localStorage.getItem('user')
    if (token && raw) {
      try {
        const user = JSON.parse(raw) as AuthUser
        set({ token, user })
      } catch {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
  },
}))
