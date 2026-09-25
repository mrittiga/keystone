import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import Login          from './pages/Login'
import Dashboard      from './pages/Dashboard'
import WorkOrders     from './pages/WorkOrders'
import WorkOrderDetail from './pages/WorkOrderDetail'
import Dispatch       from './pages/Dispatch'
import TechnicianView from './pages/TechnicianView'
import CustomerPortal from './pages/CustomerPortal'
import Users          from './pages/Users'
import Parts          from './pages/Parts'
import Reports        from './pages/Reports'
import Layout         from './components/Layout'
import PrivateRoute   from './components/PrivateRoute'
import RoleBasedRoute, { roleHomePath } from './components/RoleBasedRoute'
import type { Role } from './types'

function AppShell({ initialPage }: { initialPage: string }) {
  const { user } = useAuthStore()

  const [page, setPage]                  = useState(initialPage)
  const [selectedOrderId, setSelectedId] = useState<number | null>(null)

  function openOrder(id: number) { setSelectedId(id); setPage('detail') }
  function goBack()               { setSelectedId(null); setPage('workorders') }
  function changePage(p: string)  { setSelectedId(null); setPage(p) }

  function renderContent() {
    if (page === 'detail' && selectedOrderId !== null) {
      return <WorkOrderDetail orderId={selectedOrderId} onBack={goBack} />
    }
    switch (page) {
      case 'dashboard':  return <Dashboard      onSelectOrder={openOrder} />
      case 'workorders': return <WorkOrders     onSelectOrder={openOrder} />
      case 'dispatch':   return <Dispatch       onSelectOrder={openOrder} />
      case 'myjobs':     return <TechnicianView onSelectOrder={openOrder} />
      case 'portal':     return <CustomerPortal onSelectOrder={openOrder} />
      case 'users':      return <Users />
      case 'parts':      return <Parts />
      case 'reports':    return <Reports />
      default:           return <Dashboard      onSelectOrder={openOrder} />
    }
  }

  return (
    <Layout currentPage={page} setPage={changePage} onSelectOrder={openOrder}>
      {renderContent()}
    </Layout>
  )
}

function RoleHome() {
  const user = useAuthStore(state => state.user)
  return user ? <Navigate to={roleHomePath(user.role)} replace /> : <Navigate to="/login" replace />
}

function RolePage({ roles, page }: { roles: Role[]; page: string }) {
  return <RoleBasedRoute roles={roles} />
}

export default function App() {
  const { token, initialized, initialize } = useAuthStore()
  useEffect(() => { initialize() }, [initialize])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<PrivateRoute token={token} initialized={initialized} />}>
          <Route path="/app" element={<RoleHome />} />
          <Route element={<RoleBasedRoute roles={['MANAGER']} />}>
            <Route path="/manager/dashboard" element={<AppShell initialPage="dashboard" />} />
          </Route>
          <Route element={<RoleBasedRoute roles={['DISPATCHER']} />}>
            <Route path="/dispatcher/dashboard" element={<AppShell initialPage="dashboard" />} />
          </Route>
          <Route element={<RoleBasedRoute roles={['TECHNICIAN']} />}>
            <Route path="/technician/dashboard" element={<AppShell initialPage="myjobs" />} />
          </Route>
          <Route element={<RoleBasedRoute roles={['CUSTOMER']} />}>
            <Route path="/customer/dashboard" element={<AppShell initialPage="portal" />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to={token ? '/app' : '/login'} replace />} />
      </Routes>
    </BrowserRouter>
  )
}
