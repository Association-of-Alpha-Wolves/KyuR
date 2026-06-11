export default function EmptyState() {
  return (
    <div className="empty-state">
      <div className="empty-illustration">
        {/* Lucide PackageSearch Icon */}
        <svg
          className="lucide-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          width="48"
          height="48"
        >
          <path d="M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4" />
          <path d="m7.5 4.27 9 5.15" />
          <path d="M3.29 7 12 12l8.71-5" />
          <path d="M12 22V12" />
          <circle cx="18.5" cy="15.5" r="2.5" />
          <path d="m20.3 17.3 1.7 1.7" />
        </svg>
      </div>
      <h2>No items found</h2>
      <p>Try a different keyword, category, status, or location ID.</p>
    </div>
  )
}
