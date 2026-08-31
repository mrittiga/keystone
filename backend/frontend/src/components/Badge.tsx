import type { WOStatus, Priority } from '../types'

const STATUS_CLASS: Record<WOStatus, string> = {
  NEW: 'badge-new',
  ASSIGNED: 'badge-assigned',
  IN_PROGRESS: 'badge-inprogress',
  ON_HOLD: 'badge-onhold',
  COMPLETED: 'badge-completed',
  CLOSED: 'badge-closed',
  CANCELLED: 'badge-cancelled',
}

const PRIORITY_CLASS: Record<Priority, string> = {
  LOW: 'badge-low',
  MEDIUM: 'badge-medium',
  HIGH: 'badge-high',
  URGENT: 'badge-urgent',
}

export function StatusBadge({ status }: { status: WOStatus }) {
  return (
    <span className={`badge ${STATUS_CLASS[status]}`}>
      {status.replace('_', ' ')}
    </span>
  )
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span className={`badge ${PRIORITY_CLASS[priority]}`}>
      {priority}
    </span>
  )
}

export function RoleBadge({ role }: { role: string }) {
  const cls = role === 'MANAGER' ? 'badge-danger'
    : role === 'DISPATCHER' ? 'badge-warning'
    : role === 'TECHNICIAN' ? 'badge-info'
    : 'badge-success'
  return <span className={`badge ${cls}`}>{role}</span>
}
