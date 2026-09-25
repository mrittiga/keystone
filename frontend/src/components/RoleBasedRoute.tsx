import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import type { Role } from '../types'

export function roleHomePath(role: Role) {
  switch (role) {
    case 'MANAGER': return '/manager/dashboard'
    case 'DISPATCHER': return '/dispatcher/dashboard'
    case 'TECHNICIAN': return '/technician/dashboard'
    case 'CUSTOMER': return '/customer/dashboard'
  }
}

interface Props { roles: Role[] }

export default function RoleBasedRoute({ roles }: Props) {
  const user = useAuthStore(state => state.user)
  if (!user) return <Navigate to="/login" replace />
  return roles.includes(user.role)
    ? <Outlet />
    : <Navigate to={roleHomePath(user.role)} replace />
}