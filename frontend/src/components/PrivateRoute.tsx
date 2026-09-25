import { Navigate, Outlet } from 'react-router-dom'
import Spinner from './Spinner'

interface Props { token: string | null; initialized: boolean }

export default function PrivateRoute({ token, initialized }: Props) {
  if (!initialized) return <Spinner />
  return token ? <Outlet /> : <Navigate to="/login" replace />
}
