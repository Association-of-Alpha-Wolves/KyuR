import Badge from '../BrowseItemPage/Badge'

export default function ItemInfoPanel({ item, isReporter, onOpenStatusModal, onOpenDeleteModal }) {
  const formatDate = (value) => {
    if (!value) return 'Date unavailable'
    return new Intl.DateTimeFormat('en', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(value))
  }

  return (
    <div className="item-info-panel-content">
      <div className="item-detail-image-box">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.title} className="item-detail-img" />
        ) : (
          <div className="item-detail-image-placeholder">
            {/* Lucide Image Icon */}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="64" height="64" className="placeholder-image-icon">
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
              <circle cx="9" cy="9" r="2" />
              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
            </svg>
            <span>No Image Attached</span>
          </div>
        )}
      </div>

      <div className="item-detail-meta-box">
        <div className="badge-row">
          <Badge type="status" value={item.status} />
          <Badge type="category" value={item.category} />
        </div>

        <h1 className="item-detail-title">{item.title}</h1>
        <p className="item-detail-desc">{item.description}</p>

        <hr className="divider-line" />

        <dl className="item-detail-meta-list">
          <div className="detail-meta-item">
            <dt>
              {/* Lucide MapPin Icon */}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" className="meta-icon">
                <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              Location ID
            </dt>
            <dd>{item.locationId}</dd>
          </div>

          <div className="detail-meta-item">
            <dt>
              {/* Lucide Calendar Icon */}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" className="meta-icon">
                <path d="M8 2v4" />
                <path d="M16 2v4" />
                <rect width="18" height="18" x="3" y="4" rx="2" />
                <path d="M3 10h18" />
              </svg>
              Date Reported
            </dt>
            <dd>{formatDate(item.createdAt)}</dd>
          </div>

          <div className="detail-meta-item">
            <dt>
              {/* Lucide User Icon */}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" className="meta-icon">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              Reported By
            </dt>
            <dd>{item.reportedBy?.name || 'Unknown'}</dd>
          </div>
        </dl>

        {isReporter && (
          <div className="reporter-actions-box">
            <button type="button" className="btn-primary" onClick={onOpenStatusModal}>
              {/* Lucide Edit Icon */}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" style={{ marginRight: '6px' }}>
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
              Update Status
            </button>
            <button type="button" className="btn-danger-outline" onClick={onOpenDeleteModal}>
              {/* Lucide Trash Icon */}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" style={{ marginRight: '6px' }}>
                <path d="M3 6h18" />
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
              </svg>
              Delete Item
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
