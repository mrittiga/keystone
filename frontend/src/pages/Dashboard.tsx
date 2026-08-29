import { useEffect, useState } from 'react'
import apiClient from '../services/api'
import type { DashboardSummary, WorkOrder, PageResponse } from '../types'
import Spinner from '../components/Spinner'
import { PriorityBadge } from '../components/Badge'

interface Props {
  onSelectOrder: (id: number) => void
}

export default function Dashboard({ onSelectOrder }: Props) {
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [recentOrders, setRecentOrders] = useState<WorkOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadDashboardData()
  }, [])

  async function loadDashboardData() {
    setLoading(true)
    setError('')
    try {
      const [sumRes, ordersRes] = await Promise.all([
        apiClient.get<DashboardSummary>('/reports/summary'),
        apiClient.get<PageResponse<WorkOrder>>('/work-orders?page=0&size=5&sort=createdAt,desc')
      ])
      setSummary(sumRes.data)
      setRecentOrders(ordersRes.data.content ?? [])
    } catch (err: any) {
      setError('Failed to load dashboard metrics. Please refresh.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <Spinner />

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Operational Dashboard 📊</h1>
          <p className="page-subtitle">Real-time performance metrics and recent work orders</p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={loadDashboardData}>
          🔄 Refresh Data
        </button>
      </div>

      {error && <div className="alert alert-error">⚠️ {error}</div>}

      {/* Metrics Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 16,
        marginBottom: 24
      }}>
        <div className="glass" style={{ padding: 20, borderRadius: 12 }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>
            Total Work Orders
          </div>
          <div style={{ fontSize: 32, fontWeight: 800, marginTop: 4, color: '#f8fafc' }}>
            {summary?.totalOrders ?? 0}
          </div>
        </div>

        <div className="glass" style={{ padding: 20, borderRadius: 12 }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>
            In Progress
          </div>
          <div style={{ fontSize: 32, fontWeight: 800, marginTop: 4, color: '#fbbf24' }}>
            {summary?.inProgressOrders ?? 0}
          </div>
        </div>

        <div className="glass" style={{ padding: 20, borderRadius: 12 }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>
            Completed
          </div>
          <div style={{ fontSize: 32, fontWeight: 800, marginTop: 4, color: '#34d399' }}>
            {summary?.completedOrders ?? 0}
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="glass" style={{ padding: 20, borderRadius: 12 }}>
        <h3 style={{ marginBottom: 16, fontSize: 16, fontWeight: 700 }}>Recent Work Orders</h3>
        {recentOrders.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No recent work orders found.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-muted)', fontSize: 12 }}>
                  <th style={{ padding: '10px 8px' }}>Code</th>
                  <th style={{ padding: '10px 8px' }}>Title</th>
                  <th style={{ padding: '10px 8px' }}>Priority</th>
                  <th style={{ padding: '10px 8px' }}>Status</th>
                  <th style={{ padding: '10px 8px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(order => (
                  <tr key={order.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: 13 }}>
                    <td style={{ padding: '12px 8px', fontWeight: 600, color: '#a78bfa' }}>{order.code}</td>
                    <td style={{ padding: '12px 8px' }}>{order.title}</td>
                    <td style={{ padding: '12px 8px' }}><PriorityBadge priority={order.priority} /></td>
                    <td style={{ padding: '12px 8px' }}>{order.status}</td>
                    <td style={{ padding: '12px 8px' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => onSelectOrder(order.id)}
                      >
                        View →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

