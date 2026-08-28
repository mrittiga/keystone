import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import WorkOrders from './pages/WorkOrders'
import WorkOrderDetail from './pages/WorkOrderDetail'
import Dispatch from './pages/Dispatch'
import TechnicianView from './pages/TechnicianView'
import CustomerPortal from './pages/CustomerPortal'
import Users from './pages/Users'
import Parts from './pages/Parts'
import Reports from './pages/Reports'
import Layout from './components/Layout'
import PrivateRoute from './components/PrivateRoute'

function AppInner() {
  const { user } = useAuthStore()
  const [page, setPage] = useState(() => {
    const role = user?.role
    if (role === 'TECHNICIAN') return 'myjobs'
    if (role === 'CUSTOMER') return 'portal'
    return 'dashboard'
  })
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null)

  function handleSelectOrder(id: number) {
    setSelectedOrderId(id)
    setPage('detail')
  }

  function handleBack() {
    setSelectedOrderId(null)
    setPage('workorders')
  }

  function renderPage() {
    if (page === 'detail' && selectedOrderId) {
      return <WorkOrderDetail orderId={selectedOrderId} onBack={handleBack} />
    }
    switch (page) {
      case 'dashboard':  return <Dashboard onSelectOrder={handleSelectOrder} />
      case 'workorders': return <WorkOrders onSelectOrder={handleSelectOrder} />
      case 'dispatch':   return <Dispatch onSelectOrder={handleSelectOrder} />
      case 'myjobs':     return <TechnicianView onSelectOrder={handleSelectOrder} />
      case 'portal':     return <CustomerPortal onSelectOrder={handleSelectOrder} />
      case 'users':      return <Users />
      case 'parts':      return <Parts />
      case 'reports':    return <Reports />
      default:           return <Dashboard onSelectOrder={handleSelectOrder} />
    }
  }

  return (
    <Layout currentPage={page} setPage={p => { setPage(p); setSelectedOrderId(null) }}
      onSelectOrder={handleSelectOrder}>
      {renderPage()}
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
          <Route path="/app" element={<AppInner />} />
        </Route>
        <Route path="*" element={<Navigate to={token ? '/app' : '/login'} replace />} />
      </Routes>
    </BrowserRouter>
  )
}
