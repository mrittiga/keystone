export type Role = 'DISPATCHER' | 'TECHNICIAN' | 'MANAGER' | 'CUSTOMER'
export type WOStatus = 'NEW' | 'ASSIGNED' | 'IN_PROGRESS' | 'ON_HOLD' | 'COMPLETED' | 'CLOSED' | 'CANCELLED'
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'

export interface AuthUser {
  userId: number
  email: string
  name: string
  role: Role
  customerId?: number
}

export interface WorkOrder {
  id: number
  code: string
  title: string
  description?: string
  status: WOStatus
  priority: Priority
  customerId?: number
  customerName?: string
  siteId?: number
  siteName?: string
  siteAddress?: string
  assignedToId?: number
  assignedToName?: string
  slaDueDate?: string
  slaBreached?: boolean
  totalPartsPrice?: number
  totalMinutesWorked?: number
  createdAt: string
  updatedAt?: string
  statusHistory?: StatusHistory[]
  partsUsed?: PartUsage[]
  timeLogs?: TimeLog[]
}

export interface StatusHistory {
  id: number
  fromStatus: WOStatus
  toStatus: WOStatus
  changedById?: number
  changedByName?: string
  note?: string
  changedAt: string
}

export interface PartUsage {
  id: number
  partId?: number
  partSku?: string
  partName?: string
  quantityUsed: number
  unitPrice: number
  totalPrice: number
  usedAt: string
}

export interface TimeLog {
  id: number
  technicianId?: number
  technicianName?: string
  minutesWorked: number
  note?: string
  loggedAt: string
}

export interface Customer {
  id: number
  name: string
  code: string
  contactEmail?: string
  contactPhone?: string
  address?: string
  createdAt?: string
}

export interface Site {
  id: number
  name: string
  address?: string
  city?: string
  postcode?: string
  contactPerson?: string
  contactPhone?: string
  customerId?: number
  customerName?: string
}

export interface Part {
  id: number
  sku: string
  name: string
  description?: string
  unitCost: number
  stockQuantity: number
  minStockLevel: number
  lowStock?: boolean
}

export interface User {
  id: number
  email: string
  name: string
  role: Role
  active: boolean
  customerId?: number
  customerName?: string
}

export interface DashboardSummary {
  totalOrders: number
  newOrders: number
  assignedOrders: number
  inProgressOrders: number
  onHoldOrders: number
  completedOrders: number
  closedOrders: number
  cancelledOrders: number
  overdueCount: number
  slaBreachCount: number
  slaCompliancePercent: number
  countByStatus: Record<string, number>
}

export interface PageResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  last: boolean
}
