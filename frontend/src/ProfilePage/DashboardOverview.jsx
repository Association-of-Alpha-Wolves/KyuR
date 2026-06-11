export default function DashboardOverview({ items, setActiveTab }) {
  const ongoingReports = items.filter(i => i.status !== 'claimed')
  const ongoingCount = ongoingReports.length

  const formatDate = (value) => {
    if (!value) return ''
    return new Intl.DateTimeFormat('en', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(value))
  }

  // Generate some recent updates based on the user's reported items
  const recentUpdates = items
    .slice(0, 3)
    .map(item => ({
      id: item._id.substring(item._id.length - 8).toUpperCase(),
      update: `Report "${item.title}" was registered as ${item.status}`,
      date: formatDate(item.createdAt)
    }))

  return (
    <div className="dashboard-widgets-grid">
      {/* Current Reports Card */}
      <div className="widget-card card-current-reports">
        <h4 className="widget-card-title">Current Reports</h4>
        <div className="widget-card-body">
          <span className="reports-big-number">
            {ongoingCount < 10 ? `0${ongoingCount}` : ongoingCount}
          </span>
          <span className="reports-subtitle">Ongoing Reports</span>
          <button 
            type="button" 
            className="widget-details-link" 
            onClick={() => setActiveTab('settings')}
            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
          >
            Manage Settings & Password &gt;
          </button>
        </div>
      </div>

      {/* Recent Updates Card */}
      <div className="widget-card card-recent-updates">
        <h4 className="widget-card-title">Recent Updates</h4>
        <div className="widget-card-body">
          {recentUpdates.length === 0 ? (
            <div className="updates-empty-state">
              <p>No recent status updates available.</p>
            </div>
          ) : (
            <table className="mini-updates-table">
              <thead>
                <tr>
                  <th>Identifier</th>
                  <th>Update</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentUpdates.map((up, idx) => (
                  <tr key={idx}>
                    <td>
                      <code>{up.id}</code>
                    </td>
                    <td>{up.update}</td>
                    <td>{up.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
