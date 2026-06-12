export default function Badge({ type, value }) {
  if (!value) return null
  const label = value.charAt(0).toUpperCase() + value.slice(1)
  return <span className={`badge ${type}-${value}`}>{label}</span>
}
