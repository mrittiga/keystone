export default function Spinner() {
  return (
    <div className="loading">
      <div className="spinner" />
      <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Loading...</p>
    </div>
  )
}
