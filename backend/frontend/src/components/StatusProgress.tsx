import type { WOStatus } from '../types'

const STEPS: WOStatus[] = ['NEW', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CLOSED']
const LABELS: Record<string, string> = {
  NEW: 'New', ASSIGNED: 'Assigned', IN_PROGRESS: 'In Progress',
  COMPLETED: 'Done', CLOSED: 'Closed',
}

interface Props { currentStatus: WOStatus }

export default function StatusProgress({ currentStatus }: Props) {
  const idx = STEPS.indexOf(currentStatus)
  if (currentStatus === 'CANCELLED') return (
    <div style={{
      padding: '12px 16px', background: 'rgba(239,68,68,0.12)',
      border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10,
      fontSize: 13, color: '#f87171', fontWeight: 600, textAlign: 'center',
    }}>✕ This request was cancelled</div>
  )
  return (
    <div style={{ padding: '12px 0' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', position: 'relative' }}>
        <div style={{
          position: 'absolute', top: 13, left: '10%', right: '10%', height: 2,
          background: 'rgba(255,255,255,0.08)', zIndex: 0,
        }} />
        <div style={{
          position: 'absolute', top: 13, left: '10%', height: 2,
          width: `${Math.min(80, idx * 20)}%`,
          background: 'linear-gradient(90deg,#7c3aed,#06b6d4)',
          zIndex: 1, transition: 'width 0.8s ease',
        }} />
        {STEPS.map((step, i) => {
          const done = i < idx, cur = i === idx
          return (
            <div key={step} style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', position: 'relative', zIndex: 2,
            }}>
              <div style={{
                width: 26, height: 26, borderRadius: '50%',
                background: done ? 'linear-gradient(135deg,#7c3aed,#06b6d4)'
                  : cur ? 'linear-gradient(135deg,#7c3aed,#8b5cf6)'
                  : 'rgba(255,255,255,0.08)',
                border: cur ? '3px solid #a78bfa' : done ? 'none' : '2px solid rgba(255,255,255,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, color: 'white', fontWeight: 700,
                boxShadow: cur ? '0 0 12px rgba(124,58,237,0.6)' : 'none',
                transition: 'all 0.3s ease',
              }}>{done ? '✓' : i + 1}</div>
              <div style={{
                fontSize: 9, marginTop: 5, textAlign: 'center',
                color: cur ? '#a78bfa' : done ? '#34d399' : 'rgba(148,163,184,0.5)',
                fontWeight: cur ? 700 : 500,
                textTransform: 'uppercase', letterSpacing: 0.4,
              }}>{LABELS[step]}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
