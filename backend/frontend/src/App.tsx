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

function AppShell() {
  const { user } = useAuthStore()

  const defaultPage = () => {
    if (user?.role === 'TECHNICIAN') return 'myjobs'
    if (user?.role === 'CUSTOMER')   return 'portal'
    return 'dashboard'
  }

  const [page, setPage]                  = useState(defaultPage)
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

export default function App() {
  const { token, initialize } = useAuthStore()
  useEffect(() => { initialize() }, [initialize])
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<PrivateRoute token={token} />}>
          <Route path="/app" element={<AppShell />} />
        </Route>
        <Route path="*" element={<Navigate to={token ? '/app' : '/login'} replace />} />
      </Routes>
    </BrowserRouter>
  )
}
