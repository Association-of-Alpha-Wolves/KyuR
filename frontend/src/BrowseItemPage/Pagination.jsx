export default function Pagination({ currentPage, totalPages, onPageChange }) {
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1)

  return (
    <nav className="pagination" aria-label="Pagination">
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        aria-label="Previous page"
      >
        {/* Lucide ChevronLeft Icon */}
        <svg
          className="lucide-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          width="18"
          height="18"
        >
          <path d="m15 18-6-6 6-6" />
        </svg>
        Previous
      </button>
      
      <div className="page-numbers">
        {pages.map((page) => (
          <button
            aria-current={page === currentPage ? 'page' : undefined}
            className={page === currentPage ? 'active' : ''}
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
          >
            {page}
          </button>
        ))}
      </div>
      
      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        aria-label="Next page"
      >
        Next
        {/* Lucide ChevronRight Icon */}
        <svg
          className="lucide-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          width="18"
          height="18"
        >
          <path d="m9 18 6-6-6-6" />
        </svg>
      </button>
    </nav>
  )
}
