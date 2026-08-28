import { useEffect, useState } from 'react'
import apiClient from '../services/api'
import type { WorkOrder, WOStatus, PageResponse } from '../types'
import Spinner from '../components/Spinner'
import { PriorityBadge } from '../components/Badge'

const COLS: { status: WOStatus; label: string; color: string; bg: string }[] = [
  { status: 'NEW',         label: 'New',         color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
  { status: 'ASSIGNED',    label: 'Assigned',    color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
  { status: 'IN_PROGRESS', label: 'In Progress', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  { status: 'ON_HOLD',     label: 'On Hold',     color: '#ef4444', bg: 'rgba(239,68,68,0.1)'  },
  { status: 'COMPLETED',   label: 'Completed',   color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
]

interface Props { onSelectOrder: (id: number) => void }

export default function Dispatch({ onSelectOrder }: Props) {
  const [orders, setOrders] = useState<WorkOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    apiClient.get<PageResponse<WorkOrder>>('/work-orders')
      .then(r => setOrders(r.data.content ?? []))
      .catch(e => setError(e.response?.data?.message || 'Failed to load'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner />

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dispatch Board</h1>
          <p className="page-subtitle">Live Kanban view — click any card to open</p>
        </div>
      </div>

      {error && <div className="alert alert-error">⚠️ {error}</div>}

      <div className="kanban-board">
        {COLS.map(col => {
          const items = orders.filter(o => o.status === col.status)
          return (
            <div key={col.status} className="kanban-col"
              style={{ background: col.bg, border: `1px solid ${col.color}30` }}>
              <div className="kanban-col-header" style={{ borderBottomColor: col.color }}>
                <span className="kanban-col-title" style={{ color: col.color }}>
                  {col.label}
                </span>
                <span className="kanban-count" style={{ background: col.color }}>
                  {items.length}
                </span>
              </div>
              {items.length === 0
                ? <p style={{ color: 'var(--text-muted)', fontSize: 12, padding: '16px 0', textAlign: 'center' }}>
                    Empty
                  </p>
                : items.map(o => (
                  <div key={o.id} className="kanban-item" onClick={() => onSelectOrder(o.id)}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: col.color, marginBottom: 4 }}>
                      {o.code}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
                      {o.title}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>
                      {o.customerName}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        {o.assignedToName || 'Unassigned'}
                      </span>
                      <PriorityBadge priority={o.priority} />
                    </div>
                    {o.slaBreached && (
                      <div style={{ fontSize: 10, color: '#f87171', fontWeight: 700, marginTop: 6 }}>
                        ⚠ SLA BREACH
                      </div>
                    )}
                  </div>
                ))
              }
            </div>
          )
        })}
      </div>
    </div>
  )
}
