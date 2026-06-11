import { Link } from 'react-router-dom'
import Badge from '../BrowseItemPage/Badge'

export default function ReportedItemsList({ items }) {
  const formatDate = (value) => {
    if (!value) return ''
    return new Intl.DateTimeFormat('en', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(value))
  }

  

  return (
    <div className="reported-items-panel">
      <div className="section-header-row">
        <h3>Active Reports</h3>
        <Link to="/items" className="btn-link-action">
          View All Items
          {/* Lucide ChevronRight Icon */}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="reported-empty-state">
          {/* Lucide PackageOpen Icon */}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="48" height="48" className="empty-pkg-icon">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
          </svg>
          <p>You haven't reported any lost or found items yet.</p>
          <Link to="/items/report" className="btn-primary" style={{ marginTop: '12px', display: 'inline-flex' }}>
            Report an Item
          </Link>
        </div>
      ) : (
        <div className="table-responsive-container">
          <table className="reported-items-table">
            <thead>
              <tr>
                <th>Identifier</th>
                <th>Report Details</th>
                <th>Report Date</th>
                <th>Item Location</th>
                <th>Report Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item._id}>
                  <td className="item-id-cell">
                    <code>{item._id.substring(item._id.length - 8).toUpperCase()}</code>
                  </td>
                  <td>
                    <div className="table-item-detail">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.title} className="table-thumbnail" />
                      ) : (
                        <div className="table-thumbnail-placeholder">
                          {/* Lucide Image Icon */}
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                            <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                            <circle cx="9" cy="9" r="2" />
                            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                          </svg>
                        </div>
                      )}
                      <Link to={`/items/${item._id}`} className="table-item-title-link">
                        {item.title}
                      </Link>
                    </div>
                  </td>
                  <td>{formatDate(item.createdAt)}</td>
                  <td>{item.locationId}</td>
                  <td>
                    <Badge type="status" value={item.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
