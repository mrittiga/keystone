import { useEffect, useState } from 'react'

interface Props {
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  onClose: () => void
  duration?: number
}

export default function Toast({ message, type, onClose, duration = 4000 }: Props) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => { setVisible(false); setTimeout(onClose, 300) }, duration)
    return () => clearTimeout(t)
  }, [])

  const config = {
    success: { bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.4)', color: '#34d399', icon: '✅' },
    error:   { bg: 'rgba(239,68,68,0.15)',  border: 'rgba(239,68,68,0.4)',  color: '#f87171', icon: '❌' },
    warning: { bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.4)', color: '#fbbf24', icon: '⚠️' },
    info:    { bg: 'rgba(59,130,246,0.15)', border: 'rgba(59,130,246,0.4)', color: '#60a5fa', icon: 'ℹ️' },
  }[type]

  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 16, zIndex: 9999,
      background: config.bg, border: `1px solid ${config.border}`,
      borderRadius: 14, padding: '14px 18px',
      backdropFilter: 'blur(20px)',
      boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', gap: 10,
      maxWidth: 340, minWidth: 200,
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)',
      transition: 'all 0.3s ease',
      color: config.color, fontWeight: 600, fontSize: 13,
    }}>
      <span style={{ fontSize: 18 }}>{config.icon}</span>
      <span style={{ flex: 1 }}>{message}</span>
      <button onClick={() => { setVisible(false); setTimeout(onClose, 300) }}
        style={{ background: 'none', border: 'none', color: config.color,
          cursor: 'pointer', fontSize: 16, opacity: 0.7, padding: 0 }}>✕</button>
    </div>
  )
}
