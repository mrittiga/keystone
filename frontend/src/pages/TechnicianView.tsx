import { useEffect, useState } from 'react'
import apiClient from '../services/api'
import type { WorkOrder } from '../types'
import Spinner from '../components/Spinner'
import { StatusBadge, PriorityBadge } from '../components/Badge'

interface Props { onSelectOrder: (id: number) => void }

export default function TechnicianView({ onSelectOrder }: Props) {
  const [orders, setOrders] = useState<WorkOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [manageJob, setManageJob] = useState<WorkOrder | null>(null)
  const [jobTab, setJobTab] = useState<'Notes'|'Checklist'|'Parts Log'|'Photos'|'Signature'>('Notes')
  const [jobNotes, setJobNotes] = useState('')
  const [checks, setChecks] = useState([false, false, false])
  const [jobPhotos, setJobPhotos] = useState<string[]>([])

  useEffect(() => {
    apiClient.get<WorkOrder[]>('/work-orders/my-assigned')
      .then(r => setOrders(r.data))
      .catch(e => setError(e.response?.data?.message || 'Failed to load'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner />

  const active = orders.filter(o => ['ASSIGNED','IN_PROGRESS','ON_HOLD'].includes(o.status))
  const done   = orders.filter(o => ['COMPLETED','CLOSED'].includes(o.status))

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Jobs 🛠️</h1>
          <p className="page-subtitle">{active.length} active, {done.length} completed</p>
        </div>
      </div>

      {error && <div className="alert alert-error">⚠️ {error}</div>}

      <div className="stats-grid" style={{ marginBottom: 24 }}>
        {[
          { l: 'Assigned', v: active.length, c: 'purple', i: '📋' },
          { l: 'Completed', v: done.length, c: 'green', i: '✅' },
          { l: 'SLA Breached', v: orders.filter(o=>o.slaBreached).length, c: 'red', i: '⚠️' },
        ].map(s => (
          <div key={s.l} className={`stat-card glass ${s.c}`}>
            <span className="stat-icon">{s.i}</span>
            <div className="stat-value">{s.v}</div>
            <div className="stat-label">{s.l}</div>
          </div>
        ))}
      </div>

      {active.length === 0 && done.length === 0 && (
        <div className="glass" style={{ padding: 60, textAlign: 'center' }}>
          <div style={{ fontSize: 50, marginBottom: 16 }}>🎉</div>
          <p style={{ color: 'var(--text-muted)' }}>No work orders assigned yet</p>
        </div>
      )}

      {active.length > 0 && (
        <>
          <h3 style={{ marginBottom: 14, color: 'var(--text-secondary)', fontWeight: 700 }}>
            ⚡ Active Jobs
          </h3>
          {active.map(o => (
            <div key={o.id} className="glass" style={{
              padding: 22, marginBottom: 14, cursor: 'pointer',
              borderLeft: `4px solid ${o.status === 'IN_PROGRESS' ? '#f59e0b' : '#8b5cf6'}`,
              transition: 'all 0.25s ease',
            }}
              onClick={() => onSelectOrder(o.id)}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = 'none'}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <div style={{ color: '#a78bfa', fontWeight: 800, fontSize: 12, marginBottom: 4 }}>{o.code}</div>
                  <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>{o.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    📍 {o.siteName} · 🏢 {o.customerName}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
                  <StatusBadge status={o.status} />
                  <PriorityBadge priority={o.priority} />
                </div>
              </div>
              {o.slaBreached && (
                <div style={{ marginTop: 12, padding: '8px 12px', background: 'rgba(239,68,68,0.15)',
                  borderRadius: 8, fontSize: 12, color: '#f87171', fontWeight: 700 }}>
                  ⚠ SLA BREACHED — Needs immediate attention
                </div>
              )}
              {o.slaDueDate && !o.slaBreached && (
                <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text-muted)' }}>
                  🕐 SLA due: {new Date(o.slaDueDate).toLocaleString()}
                </div>
              )}
              <div style={{ marginTop: 14 }}>
                <button className="btn btn-primary btn-sm"
                  onClick={e => { e.stopPropagation(); onSelectOrder(o.id) }}>
                  Open Job →
                </button>
                <button className="btn btn-secondary btn-sm" style={{ marginLeft:8 }} onClick={e => { e.stopPropagation(); const address = o.siteAddress || o.siteName || ''; window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`, '_blank', 'noopener,noreferrer') }}>🧭 Get Directions</button>
                <button className="btn btn-warning btn-sm" style={{ marginLeft:8 }} onClick={e => { e.stopPropagation(); setManageJob(o); setJobTab('Notes') }}>🧰 Manage Job</button>
              </div>
            </div>
          ))}
        </>
      )}

      {done.length > 0 && (
        <>
          <h3 style={{ margin: '24px 0 14px', color: 'var(--text-muted)', fontWeight: 700 }}>
            ✅ Completed / Closed
          </h3>
          {done.map(o => (
            <div key={o.id} className="wo-card glass" style={{ marginBottom: 10 }}
              onClick={() => onSelectOrder(o.id)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div className="wo-code">{o.code}</div>
                  <div className="wo-title">{o.title}</div>
                </div>
                <StatusBadge status={o.status} />
              </div>
            </div>
          ))}
        </>
      )}

      {manageJob && <div className="modal-overlay open" onClick={() => setManageJob(null)}><div className="modal" style={{ maxWidth:640 }} onClick={e => e.stopPropagation()}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:12 }}><div><h2>🧰 Manage {manageJob.code}</h2><p style={{ color:'var(--text-muted)', fontSize:12 }}>{manageJob.title}</p></div><button className="btn btn-secondary btn-sm" onClick={() => setManageJob(null)}>Close</button></div>
        <div style={{ display:'flex', gap:5, overflowX:'auto', margin:'20px 0 16px', paddingBottom:4 }}>{(['Notes','Checklist','Parts Log','Photos','Signature'] as const).map(tab => <button key={tab} className={jobTab === tab ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'} onClick={() => setJobTab(tab)}>{tab}</button>)}</div>
        {jobTab === 'Notes' && <textarea className="textarea" value={jobNotes} onChange={e => setJobNotes(e.target.value)} placeholder="Add site notes, findings, and handover details..." />}
        {jobTab === 'Checklist' && <div style={{ display:'grid', gap:10 }}>{['Confirm site access','Inspect equipment','Test system and clean area'].map((item, index) => <label key={item} style={{ display:'flex', gap:10, alignItems:'center', padding:12, background:'rgba(255,255,255,.05)', borderRadius:8 }}><input type="checkbox" checked={checks[index]} onChange={() => setChecks(current => current.map((checked, i) => i === index ? !checked : checked))} />{item}</label>)}</div>}
        {jobTab === 'Parts Log' && <div className="alert alert-warning">Parts logging is available from the job detail view. Open the order to record stock usage.</div>}
        {jobTab === 'Photos' && <><input className="input" type="file" accept="image/*" multiple onChange={e => setJobPhotos(Array.from(e.target.files ?? []).map(file => URL.createObjectURL(file)))} /><div style={{ display:'flex', gap:8, flexWrap:'wrap', marginTop:12 }}>{jobPhotos.map(src => <img key={src} src={src} alt="Job site preview" style={{ width:100, height:78, objectFit:'cover', borderRadius:8 }} />)}</div></>}
        {jobTab === 'Signature' && <div><div style={{ height:150, border:'1px dashed rgba(167,139,250,.6)', borderRadius:10, display:'grid', placeItems:'center', color:'var(--text-muted)', background:'rgba(255,255,255,.03)' }}>✍️ Tap or draw signature here</div><p style={{ color:'var(--text-muted)', fontSize:12, marginTop:8 }}>Digital signature capture is simulated for this demo.</p></div>}
        <div className="btn-row"><button className="btn btn-primary" onClick={() => setManageJob(null)}>Save Job Updates</button></div>
      </div></div>}
    </div>
  )
}
