import { useEffect, useState } from 'react'
import { useAuthStore } from '../store/authStore'
import apiClient from '../services/api'
import type { WorkOrder, Site, PageResponse } from '../types'
import Spinner from '../components/Spinner'
import { StatusBadge, PriorityBadge } from '../components/Badge'

interface Props { onSelectOrder: (id: number) => void }
interface ChatMessage { id: number; from: 'bot' | 'customer'; text: string }
interface TicketDraft { title: string; siteId: string; description: string; priority: string }

export default function CustomerPortal({ onSelectOrder }: Props) {
  const { user }            = useAuthStore()
  const [orders, setOrders] = useState<WorkOrder[]>([])
  const [sites, setSites]   = useState<Site[]>([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')
  const [success, setSuccess]   = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm]         = useState({ title:'', description:'', priority:'MEDIUM', siteId:'' })
  const [submitting, setSubmitting] = useState(false)
  const [attachments, setAttachments] = useState<string[]>([])
  const [feedbackOrder, setFeedbackOrder] = useState<WorkOrder | null>(null)
  const [rating, setRating] = useState(0)
  const [review, setReview] = useState('')
  const [paymentOrder, setPaymentOrder] = useState<WorkOrder | null>(null)
  const [paid, setPaid] = useState<number[]>([])
  const [chatOpen, setChatOpen] = useState(false)
  const [chatInput, setChatInput] = useState('')
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: 1, from: 'bot', text: 'Hi! I can help with your requests, site locations, status updates, and payments. What would you like to know?' },
  ])
  const [ticketDraft, setTicketDraft] = useState<TicketDraft | null>(null)

  useEffect(() => { load() }, [user])

  async function load() {
    setLoading(true); setError('')
    try {
      const or = await apiClient.get<PageResponse<WorkOrder>>('/work-orders')
      setOrders(or.data.content ?? [])

      const cid = user?.customerId
      if (cid) {
        const si = await apiClient.get<PageResponse<Site>>(`/customers/${cid}/sites`)
        const raw: any = si.data
        if (Array.isArray(raw)) setSites(raw)
        else if (raw?.content && Array.isArray(raw.content)) setSites(raw.content)
        else setSites([])
      }
    } catch (e: any) {
      setError('Failed to load. Please refresh.')
    } finally { setLoading(false) }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.siteId) { setError('Please select a site location.'); return }
    setSubmitting(true); setError('')
    try {
      await apiClient.post('/work-orders', {
        title: form.title.trim(),
        description: form.description.trim(),
        priority: form.priority,
        customerId: user?.customerId,
        siteId: Number(form.siteId),
      })
      setShowForm(false)
      setForm({ title:'', description:'', priority:'MEDIUM', siteId:'' }); setAttachments([])
      setSuccess('Request submitted! We will be in touch soon.')
      setTimeout(() => setSuccess(''), 5000)
      load()
    } catch (e: any) {
      const msg = e.response?.data?.message ?? ''
      setError(msg && !msg.includes('null') && !msg.includes('SQL')
        ? msg : 'Failed to submit. Please try again.')
    } finally { setSubmitting(false) }
  }

  function answerQuestion(question: string) {
    const text = question.toLowerCase()
    const active = orders.filter(order => !['CLOSED', 'CANCELLED'].includes(order.status))
    const latest = orders[0]
    if (ticketDraft && !ticketDraft.title) {
      setTicketDraft({ ...ticketDraft, title: question })
      return 'Got it. I added that as the ticket title. Choose the affected site below, add any details, and select Create Ticket.'
    }
    if (text.includes('site') || text.includes('location')) {
      return sites.length ? `You have ${sites.length} linked site${sites.length === 1 ? '' : 's'}: ${sites.map(site => site.name).join(', ')}.` : 'There are no sites linked to your account yet. Please contact your administrator.'
    }
    if (text.includes('status') || text.includes('request') || text.includes('order')) {
      if (!orders.length) return 'You do not have any service requests yet. Select Request Service to create one.'
      return `You have ${active.length} open request${active.length === 1 ? '' : 's'}. Your latest request, ${latest.code}, is ${latest.status.replace('_', ' ').toLowerCase()}.`
    }
    if (text.includes('pay') || text.includes('invoice') || text.includes('cost')) {
      const completed = orders.filter(order => order.status === 'COMPLETED')
      return completed.length ? `You have ${completed.length} completed service invoice${completed.length === 1 ? '' : 's'}. Open a completed request and choose Pay Now.` : 'There are no completed invoices ready for payment.'
    }
    if (text.includes('human') || text.includes('agent') || text.includes('contact')) {
      return 'Please submit a service request with your site and issue details. The dispatch team will follow up there.'
    }
    if (text.includes('create') || text.includes('new') || text.includes('fix')) {
      if (!sites.length) return 'I cannot create a ticket yet because no site is linked to your account. Please contact your administrator.'
      setTicketDraft({ title:'', siteId:'', description:'', priority:'MEDIUM' })
      return 'I can create that ticket for you. What needs fixing? Please reply with a short title, such as “Air conditioner not cooling”.'
    }
    if (ticketDraft) return 'Please finish the ticket setup in the form below, or choose Cancel ticket.'
    return 'I can help with request status, linked sites, invoices, payments, or creating a new service request. Try one of the suggested questions below.'
  }

  async function sendChat(message = chatInput) {
    const question = message.trim()
    if (!question) return
    const id = Date.now()
    setChatMessages(current => [...current, { id, from:'customer', text:question }])
    setChatInput('')
    const workflowReply = ticketDraft || /\b(create|new)\b.*\b(ticket|request)\b/i.test(question)
    if (workflowReply) {
      setChatMessages(current => [...current, { id:id + 1, from:'bot', text:answerQuestion(question) }])
      return
    }
    try {
      const response = await apiClient.post('/customer/chat', { message: question })
      setChatMessages(current => [...current, { id:id + 1, from:'bot', text:response.data.reply }])
    } catch {
      setChatMessages(current => [...current, { id:id + 1, from:'bot', text:'Support is temporarily unavailable. Please use Request Service to contact the dispatch team.' }])
    }
  }

  async function createTicketFromChat() {
    if (!ticketDraft || !ticketDraft.title || !ticketDraft.siteId || !user?.customerId) return
    setSubmitting(true)
    try {
      await apiClient.post('/work-orders', {
        title: ticketDraft.title.trim(),
        description: ticketDraft.description.trim(),
        priority: ticketDraft.priority,
        customerId: user.customerId,
        siteId: Number(ticketDraft.siteId),
      })
      setTicketDraft(null)
      setChatMessages(current => [...current, { id:Date.now(), from:'bot', text:'Your service ticket was created successfully. I am refreshing your request list now.' }])
      await load()
    } catch {
      setChatMessages(current => [...current, { id:Date.now(), from:'bot', text:'I could not create the ticket right now. Please try again or use the Request Service form.' }])
    } finally { setSubmitting(false) }
  }

  if (loading) return <Spinner />

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Requests 📬</h1>
          <p className="page-subtitle">Track and manage your service requests</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setError(''); setShowForm(true) }}>
          ➕ Request Service
        </button>
      </div>

      {error   && <div className="alert alert-error">⚠️ {error}</div>}
      {success && <div className="alert alert-success">✅ {success}</div>}

      {orders.length === 0 ? (
        <div className="glass" style={{ padding:60, textAlign:'center' }}>
          <div style={{ fontSize:50, marginBottom:16 }}>📬</div>
          <p style={{ color:'var(--text-muted)', marginBottom:20 }}>No service requests yet</p>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            Submit Your First Request
          </button>
        </div>
      ) : orders.map(o => (
        <div key={o.id} className="wo-card glass" onClick={() => onSelectOrder(o.id)}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
            <div>
              <div className="wo-code">{o.code}</div>
              <div className="wo-title">{o.title}</div>
            </div>
            <StatusBadge status={o.status} />
          </div>
          <div className="wo-meta">
            {o.siteName && <span>📍 {o.siteName}</span>}
            <PriorityBadge priority={o.priority} />
          </div>
          <div className="wo-footer">
            <span style={{ fontSize:11, color:'var(--text-muted)' }}>
              📅 {new Date(o.createdAt).toLocaleDateString()}
            </span>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap', justifyContent:'flex-end' }}>
              <button className="btn btn-secondary btn-sm" onClick={e => { e.stopPropagation(); onSelectOrder(o.id) }}>View Status →</button>
              {o.status === 'COMPLETED' && <>
                <button className="btn btn-success btn-sm" onClick={e => { e.stopPropagation(); setFeedbackOrder(o); setRating(0) }}>⭐ Feedback</button>
                <button className="btn btn-warning btn-sm" onClick={e => { e.stopPropagation(); setPaymentOrder(o) }}>{paid.includes(o.id) ? '✓ Paid' : '💳 Pay Now'}</button>
              </>}
            </div>
          </div>
        </div>
      ))}

      {showForm && (
        <div className="modal-overlay open" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>📬 New Service Request</h2>

            {sites.length === 0 && (
              <div className="alert alert-warning">
                ⚠ No sites linked to your account. Contact your administrator.
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">What needs fixing? *</label>
                <input className="input" required value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="Brief description of the issue" />
              </div>
              <div className="form-group">
                <label className="form-label">Photos (optional)</label>
                <input className="input" type="file" accept="image/*" multiple onChange={e => setAttachments(Array.from(e.target.files ?? []).map(file => URL.createObjectURL(file)))} />
                {attachments.length > 0 && <div style={{ display:'flex', gap:8, marginTop:10, flexWrap:'wrap' }}>{attachments.map(src => <img key={src} src={src} alt="Selected attachment" style={{ width:58, height:58, objectFit:'cover', borderRadius:8, border:'1px solid rgba(255,255,255,.2)' }} />)}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">Details</label>
                <textarea className="textarea" value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="More information about the problem..." />
              </div>
              <div className="form-group">
                <label className="form-label">Urgency</label>
                <select className="select" value={form.priority}
                  onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                  <option value="LOW">Low — Routine, no urgency</option>
                  <option value="MEDIUM">Medium — Needs attention soon</option>
                  <option value="HIGH">High — Affecting operations</option>
                  <option value="URGENT">Urgent — Critical, immediate response</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">
                  Location / Site * ({sites.length} available)
                </label>
                {sites.length === 0 ? (
                  <div style={{
                    padding:'11px 15px', background:'rgba(239,68,68,0.1)',
                    border:'1px solid rgba(239,68,68,0.3)',
                    borderRadius:10, fontSize:13, color:'#f87171',
                  }}>No sites available — contact your administrator</div>
                ) : (
                  <select className="select" value={form.siteId}
                    onChange={e => setForm(f => ({ ...f, siteId: e.target.value }))}>
                    <option value="">— Select your site —</option>
                    {sites.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name}{s.city ? ` — ${s.city}` : ''}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <div className="btn-row">
                <button type="button" className="btn btn-secondary"
                  onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary"
                  disabled={submitting || sites.length === 0}>
                  {submitting ? '⏳ Submitting...' : '📤 Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {feedbackOrder && <div className="modal-overlay open" onClick={() => setFeedbackOrder(null)}><div className="modal" onClick={e => e.stopPropagation()}>
        <h2>⭐ Rate {feedbackOrder.code}</h2><p style={{ color:'var(--text-muted)', marginBottom:18 }}>How did this service go?</p>
        <div style={{ display:'flex', gap:8, marginBottom:18 }}>{[1,2,3,4,5].map(value => <button key={value} type="button" onClick={() => setRating(value)} style={{ border:0, background:'transparent', cursor:'pointer', fontSize:30, opacity:value <= rating ? 1 : .35 }}>★</button>)}</div>
        <textarea className="textarea" value={review} onChange={e => setReview(e.target.value)} placeholder="Tell us what went well..." />
        <div className="btn-row"><button className="btn btn-secondary" onClick={() => setFeedbackOrder(null)}>Cancel</button><button className="btn btn-primary" disabled={!rating} onClick={async () => { await apiClient.post(`/customer/work-orders/${feedbackOrder.id}/feedback`, { rating, comment:review }); setFeedbackOrder(null); setReview(''); setSuccess('Thanks for sharing your feedback!') }}>Submit Feedback</button></div>
      </div></div>}

      {paymentOrder && <div className="modal-overlay open" onClick={() => setPaymentOrder(null)}><div className="modal" onClick={e => e.stopPropagation()}>
        <h2>💳 Confirm Payment</h2><p style={{ color:'var(--text-muted)' }}>Invoice for {paymentOrder.code}</p><div className="glass" style={{ padding:18, margin:'18px 0' }}><strong style={{ fontSize:26 }}>${Number(paymentOrder.totalPartsPrice ?? 0).toFixed(2)}</strong><div style={{ color:'var(--text-muted)', fontSize:12 }}>Service invoice total</div></div>
        <div className="btn-row"><button className="btn btn-secondary" onClick={() => setPaymentOrder(null)}>Cancel</button><button className="btn btn-success" onClick={async () => { await apiClient.post(`/customer/work-orders/${paymentOrder.id}/payment`, { amount:paymentOrder.totalPartsPrice ?? 0 }); setPaid(current => [...current, paymentOrder.id]); setPaymentOrder(null); setSuccess('Payment confirmed. Thank you!') }}>Confirm Payment</button></div>
      </div></div>}

      <div style={{ position:'fixed', right:24, bottom:24, zIndex:30 }}>
        {chatOpen && <div className="glass-strong" style={{ width:'min(360px, calc(100vw - 32px))', marginBottom:10, overflow:'hidden' }}>
          <div style={{ padding:'14px 16px', display:'flex', justifyContent:'space-between', alignItems:'center', background:'linear-gradient(135deg,rgba(124,58,237,.35),rgba(6,182,212,.12))' }}><div><strong>Keystone Assistant</strong><div style={{ color:'var(--text-muted)', fontSize:11 }}>Customer support</div></div><button className="btn btn-secondary btn-sm" onClick={() => setChatOpen(false)}>×</button></div>
          <div style={{ height:250, overflowY:'auto', padding:12, display:'grid', alignContent:'start', gap:8 }}>
            {chatMessages.map(message => <div key={message.id} style={{ maxWidth:'88%', justifySelf:message.from === 'customer' ? 'end' : 'start', padding:'9px 11px', borderRadius:10, background:message.from === 'customer' ? 'rgba(124,58,237,.55)' : 'rgba(255,255,255,.08)', fontSize:12 }}>{message.text}</div>)}
          </div>
          {ticketDraft && <div style={{ padding:'0 12px 12px' }}>
            <div style={{ border:'1px solid rgba(167,139,250,.35)', borderRadius:10, padding:10 }}>
              <strong style={{ fontSize:12 }}>New ticket</strong>
              <input className="input" style={{ marginTop:8 }} placeholder="What needs fixing?" value={ticketDraft.title} onChange={e => setTicketDraft({ ...ticketDraft, title:e.target.value })} />
              <select className="select" style={{ marginTop:8 }} value={ticketDraft.siteId} onChange={e => setTicketDraft({ ...ticketDraft, siteId:e.target.value })}>
                <option value="">Select site</option>{sites.map(site => <option key={site.id} value={site.id}>{site.name}{site.city ? ` — ${site.city}` : ''}</option>)}
              </select>
              <textarea className="textarea" style={{ marginTop:8, minHeight:58 }} placeholder="More details (optional)" value={ticketDraft.description} onChange={e => setTicketDraft({ ...ticketDraft, description:e.target.value })} />
              <select className="select" style={{ marginTop:8 }} value={ticketDraft.priority} onChange={e => setTicketDraft({ ...ticketDraft, priority:e.target.value })}><option value="LOW">Low urgency</option><option value="MEDIUM">Medium urgency</option><option value="HIGH">High urgency</option><option value="URGENT">Urgent</option></select>
              <div style={{ display:'flex', gap:6, marginTop:8 }}><button className="btn btn-primary btn-sm" disabled={submitting || !ticketDraft.title.trim() || !ticketDraft.siteId} onClick={createTicketFromChat}>{submitting ? 'Creating...' : 'Create Ticket'}</button><button className="btn btn-secondary btn-sm" onClick={() => setTicketDraft(null)}>Cancel ticket</button></div>
            </div>
          </div>}
          <div style={{ display:'flex', gap:6, padding:'0 12px 10px', overflowX:'auto' }}>{['What is my request status?','What sites are linked?','How do I pay?'].map(prompt => <button key={prompt} className="btn btn-secondary btn-sm" onClick={() => sendChat(prompt)} style={{ fontSize:10 }}>{prompt}</button>)}</div>
          <form onSubmit={e => { e.preventDefault(); sendChat() }} style={{ display:'flex', gap:7, padding:12, borderTop:'1px solid rgba(255,255,255,.08)' }}><input className="input" value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Ask a question..." /><button className="btn btn-primary btn-sm" type="submit" title="Send message">➤</button></form>
        </div>}
        <button className="btn btn-primary" onClick={() => setChatOpen(value => !value)}>{chatOpen ? 'Close Assistant' : '💬 Ask Keystone'}</button>
      </div>
    </div>
  )
}
