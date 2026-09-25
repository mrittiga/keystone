import axios from 'axios'

const BASE_URL = `${import.meta.env.VITE_API_URL ?? ''}/api`

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

export async function registerUser(name: string, email: string, password: string, role = 'CUSTOMER') {
  await apiClient.post('/auth/register', { name, email, password, role })
}

export function getApiErrorMessage(error: any, fallback: string) {
  const data = error.response?.data
  if (data?.fieldErrors) return Object.values(data.fieldErrors).join(' ')
  if (data?.message && !String(data.message).toLowerCase().includes('sql')) return data.message
  return fallback
}

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default apiClient