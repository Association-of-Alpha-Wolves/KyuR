import { Link, useNavigate } from 'react-router-dom'
import Badge from './Badge'
import { generatePoster, generateQRCodeOnly } from '../utils/posterUtils'

function getStoredToken() {
  return localStorage.getItem('kyurToken')
}

export default function ItemCard({ item }) {
  const navigate = useNavigate()
  const isLoggedIn = !!getStoredToken()

  const handleAction = (e, actionFn) => {
    e.preventDefault();
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    actionFn(item);
  };
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
        
        <div className="card-actions" style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
          <Link className="details-link" to={isLoggedIn ? `/items/${item._id}` : '/login'} style={{ flex: 1, justifyContent: 'center' }}>
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
          <button 
            type="button" 
            className="details-link"
            style={{ 
              backgroundColor: '#f1f5f9', 
              color: '#334155', 
              border: '1px solid #e2e8f0', 
              cursor: 'pointer' 
            }}
            onClick={(e) => handleAction(e, generatePoster)}
            title="Download Poster"
          >
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
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" x2="12" y1="15" y2="3" />
            </svg>
          </button>
          <button 
            type="button" 
            className="details-link"
            style={{ 
              backgroundColor: '#f1f5f9', 
              color: '#334155', 
              border: '1px solid #e2e8f0', 
              cursor: 'pointer' 
            }}
            onClick={(e) => handleAction(e, generateQRCodeOnly)}
            title="Download QR Only"
          >
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
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <rect x="7" y="7" width="3" height="3" />
              <rect x="14" y="7" width="3" height="3" />
              <rect x="7" y="14" width="3" height="3" />
              <rect x="14" y="14" width="3" height="3" />
            </svg>
          </button>
        </div>
      </div>
    </article>
  )
}
