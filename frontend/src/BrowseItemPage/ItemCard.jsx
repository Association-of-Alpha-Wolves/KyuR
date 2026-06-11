import { Link } from 'react-router-dom'
import Badge from './Badge'

export default function ItemCard({ item }) {
  const formatDate = (value) => {
    if (!value) return 'Date unavailable'
    return new Intl.DateTimeFormat('en', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(value))
  }

  return (
    <article className="item-card">
      <div className="item-image">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.title} />
        ) : (
          <div className="image-fallback" aria-label="No photo available">
            {/* Lucide Image Icon */}
            <svg
              className="lucide-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              width="28"
              height="28"
            >
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
              <circle cx="9" cy="9" r="2" />
              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
            </svg>
          </div>
        )}
      </div>
      
      <div className="item-card-body">
        <div className="badge-row">
          <Badge type="status" value={item.status} />
          <Badge type="category" value={item.category} />
        </div>
        
        <h2>{item.title}</h2>
        <p className="item-description">{item.description}</p>
        
        <dl className="item-meta">
          <div>
            <dt>
              {/* Lucide MapPin Icon */}
              <svg
                className="lucide-icon text-muted"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                width="14"
                height="14"
              >
                <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              Location
            </dt>
            <dd>{item.locationId}</dd>
          </div>
          
          <div>
            <dt>
              {/* Lucide Calendar Icon */}
              <svg
                className="lucide-icon text-muted"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                width="14"
                height="14"
              >
                <path d="M8 2v4" />
                <path d="M16 2v4" />
                <rect width="18" height="18" x="3" y="4" rx="2" />
                <path d="M3 10h18" />
              </svg>
              Date reported
            </dt>
            <dd>{formatDate(item.createdAt)}</dd>
          </div>
          
          <div>
            <dt>
              {/* Lucide User Icon */}
              <svg
                className="lucide-icon text-muted"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                width="14"
                height="14"
              >
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              Reported by
            </dt>
            <dd>{item.reportedBy?.name || 'Unknown'}</dd>
          </div>
        </dl>
        
        <Link className="details-link" to={`/items/${item._id}`}>
          View Details
          {/* Lucide ChevronRight Icon */}
          <svg
            className="lucide-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            width="16"
            height="16"
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
        </Link>
      </div>
    </article>
  )
}
