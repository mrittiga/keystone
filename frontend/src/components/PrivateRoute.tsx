import { Navigate, Outlet } from 'react-router-dom'

interface Props { token: string | null }

export default function PrivateRoute({ token }: Props) {
  return token ? <Outlet /> : <Navigate to="/login" replace />
}
